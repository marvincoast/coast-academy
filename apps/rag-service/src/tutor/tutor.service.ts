import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import OpenAI from 'openai';
import { SupabaseService } from '../common/supabase.service.js';
import { EmbeddingService } from './embedding.service.js';
import type { TutorAnswerDto, ChunkCitationDto } from './tutor.dto.js';

// In NestJS (CommonJS), __dirname is the compiled dist/tutor directory.
// Prompts live at apps/rag-service/prompts/ → go up two levels from dist/tutor.
const PROMPTS_DIR = join(__dirname, '..', '..', 'prompts');

const TOP_K = 5;

interface KnowledgeChunk {
  id: string;
  source_label: string;
  content: string;
  similarity: number;
}

@Injectable()
export class TutorService {
  private readonly logger = new Logger(TutorService.name);
  private readonly openai: OpenAI;
  private readonly chatModel: string;
  private readonly systemPrompt: string;
  private readonly taskPromptTemplate: string;

  constructor(
    private readonly supabase: SupabaseService,
    private readonly embedding: EmbeddingService,
  ) {
    const apiKey =
      process.env['OPENAI_API_KEY'] ?? process.env['LLM_API_KEY'] ?? 'ollama';
    const baseURL =
      process.env['OPENAI_BASE_URL'] ??
      process.env['LLM_API_BASE'] ??
      'http://ollama:11434/v1';
    this.chatModel = process.env['CHAT_MODEL'] ?? process.env['LLM_MODEL'] ?? 'llama3.2';

    this.openai = new OpenAI({ apiKey, baseURL });

    // Load versioned prompts from disk
    this.systemPrompt = this.loadPrompt('system/tutor.v1.md');
    this.taskPromptTemplate = this.loadPrompt('tasks/answer-with-cites.v1.md');

    this.logger.log(`Chat model: ${this.chatModel} @ ${baseURL}`);
  }

  // ── Ask ────────────────────────────────────────────────────────────────────

  async ask(userId: string, question: string): Promise<TutorAnswerDto> {
    // 1. Embed the question
    const queryEmbedding = await this.embedding.embedOne(question);

    // 2. Retrieve top-K chunks
    const chunks = await this.retrieveChunks(queryEmbedding);

    if (chunks.length === 0) {
      return {
        answer:
          'Não tenho material indexado suficiente para responder com segurança. ' +
          'Por favor, verifique se o conteúdo do curso foi ingerido.',
        citations: [],
        modelUsed: this.chatModel,
      };
    }

    // 3. Build context string
    const retrievedChunks = chunks
      .map((c) => `[source:${c.id.slice(0, 8)}] (${c.source_label}):\n${c.content}`)
      .join('\n\n---\n\n');

    // 4. Fill task template
    const userPrompt = this.taskPromptTemplate
      .replace('{{retrieved_chunks}}', retrievedChunks)
      .replace('{{user_question}}', question)
      .replace('{{user_locale}}', 'pt-BR');

    // 5. Call LLM
    const completion = await this.openai.chat.completions.create({
      model: this.chatModel,
      messages: [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const answer = completion.choices[0]?.message?.content ?? 'Sem resposta do modelo.';

    // 6. Build citations from chunks actually referenced in answer
    const citations: ChunkCitationDto[] = chunks
      .filter((c) => answer.includes(c.id.slice(0, 8)))
      .map((c) => ({
        id: c.id.slice(0, 8),
        sourceLabel: c.source_label,
        excerpt: c.content.slice(0, 200) + (c.content.length > 200 ? '…' : ''),
      }));

    // 7. Save session for analytics (best-effort)
    this.saveSession(userId, question, answer, chunks.map((c) => c.id)).catch(() => {
      /* non-blocking */
    });

    return { answer, citations, modelUsed: this.chatModel };
  }

  // ── Retrieval ──────────────────────────────────────────────────────────────

  private async retrieveChunks(embedding: number[]): Promise<KnowledgeChunk[]> {
    const { data, error } = await this.supabase.admin.rpc('match_knowledge_chunks', {
      query_embedding: JSON.stringify(embedding),
      match_threshold: 0.5,
      match_count: TOP_K,
    });

    if (error) {
      this.logger.error('Retrieval error', error);
      return [];
    }

    return (data ?? []) as KnowledgeChunk[];
  }

  // ── Session persistence ────────────────────────────────────────────────────

  private async saveSession(
    userId: string,
    question: string,
    answer: string,
    chunkIds: string[],
  ): Promise<void> {
    await this.supabase.admin.from('tutor_sessions').insert({
      user_id: userId,
      question,
      answer,
      chunk_ids: chunkIds,
      model_used: this.chatModel,
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private loadPrompt(relativePath: string): string {
    const fullPath = join(PROMPTS_DIR, relativePath);
    return readFileSync(fullPath, 'utf-8');
  }
}
