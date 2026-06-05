import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly openai: OpenAI;
  readonly model: string;

  constructor() {
    const apiKey =
      process.env['OPENAI_API_KEY'] ?? process.env['LLM_API_KEY'] ?? 'ollama';
    const baseURL =
      process.env['OPENAI_BASE_URL'] ??
      process.env['LLM_API_BASE'] ??
      'http://ollama:11434/v1';
    this.model = process.env['EMBEDDING_MODEL'] ?? 'nomic-embed-text';

    this.openai = new OpenAI({ apiKey, baseURL });
    this.logger.log(`Embedding model: ${this.model} @ ${baseURL}`);
  }

  async embed(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    try {
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: texts,
      });
      return response.data.map((d) => d.embedding);
    } catch (err) {
      this.logger.error('Embedding error', err);
      throw err;
    }
  }

  async embedOne(text: string): Promise<number[]> {
    const results = await this.embed([text]);
    const first = results[0];
    if (!first) throw new Error('Embedding returned empty result');
    return first;
  }
}
