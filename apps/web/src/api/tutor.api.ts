import { apiPost } from './client';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ChunkCitationDto {
  id: string;
  sourceLabel: string;
  excerpt: string;
}

export interface TutorAnswerDto {
  answer: string;
  citations: ChunkCitationDto[];
  modelUsed: string;
}

// ─── API ───────────────────────────────────────────────────────────────────

export const tutorApi = {
  ask: (question: string) => apiPost<TutorAnswerDto>('/rag/ask', { question }),
};
