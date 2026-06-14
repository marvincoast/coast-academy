export interface AskQuestionDto {
  question: string;
}

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

export interface IngestStatusDto {
  chunksProcessed: number;
  chunksUpserted: number;
  errors: string[];
}
