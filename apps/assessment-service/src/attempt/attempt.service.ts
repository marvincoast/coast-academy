import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';
import { AssessmentService } from '../assessment/assessment.service';
import {
  AttemptResultDto,
  QuestionResultDto,
  ShuffledOptionDto,
  ShuffledQuestionDto,
  StartAttemptResponseDto,
  SubmitAttemptResponseDto,
} from '../assessment/assessment.dto';

// ─── Raw DB types ─────────────────────────────────────────────────────────────

interface RawOption {
  id: string;
  text: string;
  is_correct: boolean;
  order_index: number;
}

interface RawQuestion {
  id: string;
  stem: string;
  image_url: string | null;
  explanation: string | null;
  question_options: RawOption[];
}

// ─────────────────────────────────────────────────────────────────────────────

const SUBMIT_GRACE_SECONDS = 60; // extra buffer for slow connections

@Injectable()
export class AttemptService {
  private readonly logger = new Logger(AttemptService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly assessmentService: AssessmentService,
  ) {}

  // ── Start or resume an attempt ─────────────────────────────────────────────

  async startAttempt(
    userId: string,
    assessmentId: string,
  ): Promise<StartAttemptResponseDto> {
    const assessment = await this.assessmentService.getById(assessmentId);

    // Check for existing active attempt (not yet submitted)
    const existing = await this.findActiveAttempt(userId, assessmentId);
    if (existing) {
      return this.buildAttemptResponse(existing.id, assessment, userId);
    }

    // Draw random questions from pool
    const questions = await this.drawQuestions(assessmentId, assessment.questionCount);

    if (questions.length < assessment.questionCount) {
      this.logger.warn(
        `Assessment ${assessmentId} pool has only ${questions.length} questions (needs ${assessment.questionCount})`,
      );
    }

    // Shuffle questions and options
    const shuffledQuestions = this.shuffleArray([...questions]);
    const questionOrder = shuffledQuestions.map((q) => q.id);
    const optionOrder: Record<string, string[]> = {};

    for (const q of shuffledQuestions) {
      optionOrder[q.id] = this.shuffleArray(q.question_options.map((o) => o.id));
    }

    // Create attempt
    const { data: attempt, error } = await this.supabase.admin
      .from('attempts')
      .insert({
        user_id: userId,
        assessment_id: assessmentId,
        time_limit_seconds: assessment.timeLimitSeconds,
        question_order: questionOrder,
        option_order: optionOrder,
      })
      .select('id, started_at')
      .single();

    if (error || !attempt) {
      this.logger.error('Failed to create attempt', error);
      throw new BadRequestException('Failed to start attempt');
    }

    return this.buildAttemptResponse(attempt.id, assessment, userId, {
      shuffledQuestions,
      optionOrder,
      startedAt: attempt.started_at,
    });
  }

  // ── Save a single answer during the attempt (auto-save) ──────────────────

  async saveAnswer(
    userId: string,
    attemptId: string,
    questionId: string,
    selectedOptionId: string,
  ): Promise<{ saved: boolean }> {
    const attempt = await this.requireActiveAttempt(userId, attemptId);

    // Verify question belongs to this attempt
    const questionOrder = attempt.question_order as string[];
    if (!questionOrder.includes(questionId)) {
      throw new BadRequestException('Question does not belong to this attempt');
    }

    // Verify option belongs to the question
    const { data: option } = await this.supabase.admin
      .from('question_options')
      .select('id')
      .eq('id', selectedOptionId)
      .eq('question_id', questionId)
      .single();

    if (!option) {
      throw new BadRequestException('Option does not belong to this question');
    }

    await this.supabase.admin
      .from('attempt_answers')
      .upsert(
        {
          attempt_id: attemptId,
          question_id: questionId,
          selected_option_id: selectedOptionId,
          answered_at: new Date().toISOString(),
        },
        { onConflict: 'attempt_id,question_id' },
      );

    return { saved: true };
  }

  // ── Submit attempt — server-side scoring ──────────────────────────────────

  async submitAttempt(
    userId: string,
    attemptId: string,
  ): Promise<SubmitAttemptResponseDto> {
    const attempt = await this.requireActiveAttempt(userId, attemptId);

    // Validate time limit
    const startedAt = new Date(attempt.started_at as string).getTime();
    const now = Date.now();
    const elapsed = (now - startedAt) / 1000;
    const limit = (attempt.time_limit_seconds as number) + SUBMIT_GRACE_SECONDS;

    if (elapsed > limit) {
      throw new BadRequestException('Time limit exceeded');
    }

    const assessment = await this.assessmentService.getById(
      attempt.assessment_id as string,
    );

    // Fetch questions with correct options
    const questionOrder = attempt.question_order as string[];
    const questions = await this.fetchQuestionsWithOptions(questionOrder);

    // Fetch user's answers
    const { data: answers } = await this.supabase.admin
      .from('attempt_answers')
      .select('question_id, selected_option_id')
      .eq('attempt_id', attemptId);

    const answerMap = new Map<string, string>(
      (answers ?? []).map((a: { question_id: string; selected_option_id: string }) => [
        a.question_id,
        a.selected_option_id,
      ]),
    );

    // Score server-side
    const results: QuestionResultDto[] = [];
    let correct = 0;

    for (const q of questions) {
      const correctOption = q.question_options.find((o) => o.is_correct);
      const selectedId = answerMap.get(q.id) ?? null;
      const isCorrect = selectedId === correctOption?.id;

      if (isCorrect) correct++;

      results.push({
        questionId: q.id,
        stem: q.stem,
        selectedOptionId: selectedId,
        correctOptionId: correctOption?.id ?? '',
        isCorrect,
        explanation: q.explanation,
      });

      // Update answer with is_correct
      if (answerMap.has(q.id)) {
        await this.supabase.admin
          .from('attempt_answers')
          .update({ is_correct: isCorrect })
          .eq('attempt_id', attemptId)
          .eq('question_id', q.id);
      }
    }

    const total = questions.length;
    const score = total === 0 ? 0 : correct / total;
    const passed = score >= assessment.passingScore;
    const submittedAt = new Date().toISOString();

    // Update attempt record
    await this.supabase.admin
      .from('attempts')
      .update({ score, passed, submitted_at: submittedAt })
      .eq('id', attemptId);

    this.logger.log(
      `Attempt ${attemptId} submitted: ${correct}/${total} (${Math.round(score * 100)}%) — ${passed ? 'PASSED' : 'FAILED'}`,
    );

    return {
      attemptId,
      score,
      scorePercent: Math.round(score * 100),
      passed,
      passingScore: assessment.passingScore,
      totalQuestions: total,
      correctAnswers: correct,
      tabChangeCount: attempt.tab_change_count as number,
      submittedAt,
      results,
    };
  }

  // ── Record tab change (anti-cheat) ────────────────────────────────────────

  async recordTabChange(userId: string, attemptId: string): Promise<void> {
    const attempt = await this.findActiveAttempt(userId, attemptId);
    if (!attempt) return; // silently ignore if already submitted

    await this.supabase.admin
      .from('attempts')
      .update({ tab_change_count: (attempt.tab_change_count as number) + 1 })
      .eq('id', attemptId);

    this.logger.warn(
      `Tab change #${(attempt.tab_change_count as number) + 1} for attempt ${attemptId} user ${userId}`,
    );
  }

  // ── Get attempt result (submitted only) ──────────────────────────────────

  async getAttemptResult(
    userId: string,
    attemptId: string,
  ): Promise<AttemptResultDto> {
    const { data: attempt, error } = await this.supabase.admin
      .from('attempts')
      .select('*, assessments!inner(title, assessment_type, passing_score)')
      .eq('id', attemptId)
      .eq('user_id', userId)
      .not('submitted_at', 'is', null)
      .single();

    if (error || !attempt) {
      throw new NotFoundException(`Attempt ${attemptId} not found or not submitted`);
    }

    const { data: answers } = await this.supabase.admin
      .from('attempt_answers')
      .select('question_id, selected_option_id, is_correct')
      .eq('attempt_id', attemptId);

    const questionOrder = attempt.question_order as string[];
    const questions = await this.fetchQuestionsWithOptions(questionOrder);

    const answerMap = new Map<string, { selectedOptionId: string; isCorrect: boolean }>(
      (answers ?? []).map((a: { question_id: string; selected_option_id: string; is_correct: boolean }) => [
        a.question_id,
        { selectedOptionId: a.selected_option_id, isCorrect: a.is_correct },
      ]),
    );

    const results: QuestionResultDto[] = questions.map((q) => {
      const answer = answerMap.get(q.id);
      const correctOption = q.question_options.find((o) => o.is_correct);
      return {
        questionId: q.id,
        stem: q.stem,
        selectedOptionId: answer?.selectedOptionId ?? null,
        correctOptionId: correctOption?.id ?? '',
        isCorrect: answer?.isCorrect ?? false,
        explanation: q.explanation,
      };
    });

    const score = attempt.score as number;
    const total = questions.length;
    const correct = results.filter((r) => r.isCorrect).length;
    const rawAss = attempt.assessments as { title: string; assessment_type: string; passing_score: number } | { title: string; assessment_type: string; passing_score: number }[];
    const ass = Array.isArray(rawAss) ? rawAss[0]! : rawAss;

    return {
      attemptId,
      score,
      scorePercent: Math.round(score * 100),
      passed: attempt.passed as boolean,
      passingScore: ass.passing_score,
      totalQuestions: total,
      correctAnswers: correct,
      tabChangeCount: attempt.tab_change_count as number,
      submittedAt: attempt.submitted_at as string,
      results,
      assessmentTitle: ass.title,
      assessmentType: ass.assessment_type as 'simulado' | 'prova_final',
    };
  }

  // ── List user attempts ────────────────────────────────────────────────────

  async listUserAttempts(userId: string) {
    const { data } = await this.supabase.admin
      .from('attempts')
      .select('id, assessment_id, score, passed, submitted_at, started_at, assessments!inner(title, assessment_type)')
      .eq('user_id', userId)
      .not('submitted_at', 'is', null)
      .order('submitted_at', { ascending: false });

    return (data ?? []).map((a: {
      id: string;
      assessment_id: string;
      score: number;
      passed: boolean;
      submitted_at: string;
      started_at: string;
      assessments: { title: string; assessment_type: string } | { title: string; assessment_type: string }[];
    }) => {
      const ass = Array.isArray(a.assessments) ? a.assessments[0]! : a.assessments;
      return {
      attemptId: a.id,
      assessmentId: a.assessment_id,
      assessmentTitle: ass.title,
      assessmentType: ass.assessment_type,
      score: a.score,
      scorePercent: Math.round(a.score * 100),
      passed: a.passed,
      submittedAt: a.submitted_at,
      startedAt: a.started_at,
    };
    });
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private async findActiveAttempt(userId: string, attemptId: string) {
    const { data } = await this.supabase.admin
      .from('attempts')
      .select('*')
      .eq('id', attemptId)
      .eq('user_id', userId)
      .is('submitted_at', null)
      .single();
    return data;
  }

  private async requireActiveAttempt(userId: string, attemptId: string) {
    const attempt = await this.findActiveAttempt(userId, attemptId);
    if (!attempt) {
      throw new NotFoundException('Active attempt not found or already submitted');
    }
    return attempt;
  }

  private async drawQuestions(
    assessmentId: string,
    count: number,
  ): Promise<RawQuestion[]> {
    // Use Postgres random() for true server-side shuffle from the pool
    const { data } = await this.supabase.admin
      .from('assessment_questions')
      .select(`
        question_id,
        questions!inner (
          id, stem, image_url, explanation,
          question_options ( id, text, is_correct, order_index )
        )
      `)
      .eq('assessment_id', assessmentId)
      .limit(count * 3); // overfetch for shuffle headroom

    const all: RawQuestion[] = (data ?? []).map((r: { questions: RawQuestion | RawQuestion[] }) =>
      Array.isArray(r.questions) ? r.questions[0]! : r.questions,
    );

    return this.shuffleArray(all).slice(0, count);
  }

  private async fetchQuestionsWithOptions(
    questionIds: string[],
  ): Promise<RawQuestion[]> {
    if (questionIds.length === 0) return [];

    const { data } = await this.supabase.admin
      .from('questions')
      .select('id, stem, image_url, explanation, question_options ( id, text, is_correct, order_index )')
      .in('id', questionIds);

    // Re-order to match questionIds order
    const map = new Map<string, RawQuestion>(
      (data ?? []).map((q: RawQuestion) => [q.id, q]),
    );

    return questionIds.map((id) => map.get(id)!).filter(Boolean);
  }

  private shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  }

  private async buildAttemptResponse(
    attemptId: string,
    assessment: Awaited<ReturnType<AssessmentService['getById']>>,
    _userId: string,
    prebuilt?: {
      shuffledQuestions: RawQuestion[];
      optionOrder: Record<string, string[]>;
      startedAt: string;
    },
  ): Promise<StartAttemptResponseDto> {
    let shuffledQuestions: RawQuestion[];
    let optionOrder: Record<string, string[]>;
    let startedAt: string;

    if (prebuilt) {
      shuffledQuestions = prebuilt.shuffledQuestions;
      optionOrder = prebuilt.optionOrder;
      startedAt = prebuilt.startedAt;
    } else {
      // Resume: fetch stored order from DB
      const { data: attempt } = await this.supabase.admin
        .from('attempts')
        .select('question_order, option_order, started_at')
        .eq('id', attemptId)
        .single();

      const questionOrder = attempt!.question_order as string[];
      optionOrder = attempt!.option_order as Record<string, string[]>;
      startedAt = attempt!.started_at as string;
      shuffledQuestions = await this.fetchQuestionsWithOptions(questionOrder);
    }

    // Fetch saved answers for resume
    const { data: savedAnswerRows } = await this.supabase.admin
      .from('attempt_answers')
      .select('question_id, selected_option_id')
      .eq('attempt_id', attemptId);

    const savedAnswers: Record<string, string> = {};
    for (const row of savedAnswerRows ?? []) {
      savedAnswers[(row as { question_id: string }).question_id] =
        (row as { selected_option_id: string }).selected_option_id;
    }

    // Build shuffled question DTOs (never expose is_correct)
    const questions: ShuffledQuestionDto[] = shuffledQuestions.map((q, idx) => {
      const shuffledOptionIds = optionOrder[q.id] ?? q.question_options.map((o) => o.id);
      const optionMap = new Map(q.question_options.map((o) => [o.id, o]));

      const options: ShuffledOptionDto[] = shuffledOptionIds.map((optId, optIdx) => {
        const opt = optionMap.get(optId)!;
        return {
          id: opt.id,
          text: opt.text,
          orderIndex: optIdx,
        };
      });

      return {
        id: q.id,
        stem: q.stem,
        imageUrl: q.image_url,
        orderIndex: idx,
        options,
      };
    });

    return {
      attemptId,
      startedAt,
      timeLimitSeconds: assessment.timeLimitSeconds,
      assessment,
      questions,
      savedAnswers,
    };
  }
}
