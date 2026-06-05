import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service.js';
import { EmbeddingService } from './embedding.service.js';
import type { IngestStatusDto } from './tutor.dto.js';

const CHUNK_SIZE = 800;   // characters
const CHUNK_OVERLAP = 150; // characters

function splitIntoChunks(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end).trim());
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }

  return chunks.filter((c) => c.length > 50);
}

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly embedding: EmbeddingService,
  ) {}

  /** Ingest all published lessons that have no chunks yet */
  async ingestAll(): Promise<IngestStatusDto> {
    const status: IngestStatusDto = {
      chunksProcessed: 0,
      chunksUpserted: 0,
      errors: [],
    };

    // Load published lessons with content
    const { data: lessons, error } = await this.supabase.admin
      .from('lessons')
      .select(
        `
        id,
        title,
        content_markdown,
        chapters!inner (
          modules!inner (
            id,
            title,
            order_index
          )
        )
      `,
      )
      .eq('is_published', true)
      .not('content_markdown', 'is', null);

    if (error || !lessons) {
      this.logger.error('Failed to load lessons', error);
      status.errors.push(
        error?.message ?? 'Failed to load lessons — verifique SUPABASE_URL e service role no rag-service',
      );
      return status;
    }

    if (lessons.length === 0) {
      const hint =
        'Nenhuma aula publicada com content_markdown. Rode: pnpm exec supabase db reset ou ./infra/scripts/seed-db.sh';
      this.logger.warn(hint);
      status.errors.push(hint);
      return status;
    }

    this.logger.log(`Ingesting ${lessons.length} published lesson(s)`);

    for (const lesson of lessons) {
      try {
        await this.ingestLesson(lesson, status);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Failed to ingest lesson ${lesson.id}`, msg);
        status.errors.push(`lesson:${lesson.id} — ${msg}`);
      }
    }

    this.logger.log(
      `Ingestion complete: ${status.chunksUpserted}/${status.chunksProcessed} chunks upserted`,
    );
    return status;
  }

  private async ingestLesson(
    lesson: {
      id: string;
      title: string;
      content_markdown: string | null;
      chapters:
        | {
            modules:
              | { id: string; title: string; order_index: number }
              | { id: string; title: string; order_index: number }[];
          }
        | {
            modules:
              | { id: string; title: string; order_index: number }
              | { id: string; title: string; order_index: number }[];
          }[];
    },
    status: IngestStatusDto,
  ): Promise<void> {
    if (!lesson.content_markdown) return;

    const chapter = Array.isArray(lesson.chapters) ? lesson.chapters[0] : lesson.chapters;
    const moduleInfo = chapter
      ? Array.isArray(chapter.modules)
        ? chapter.modules[0]
        : chapter.modules
      : null;

    const sourceLabel = moduleInfo
      ? `${moduleInfo.title} · ${lesson.title}`
      : lesson.title;
    const moduleId = moduleInfo?.id ?? null;

    const rawChunks = splitIntoChunks(lesson.content_markdown);
    status.chunksProcessed += rawChunks.length;

    // Batch embed in groups of 20
    const BATCH = 20;
    for (let i = 0; i < rawChunks.length; i += BATCH) {
      const batch = rawChunks.slice(i, i + BATCH);
      const embeddings = await this.embedding.embed(batch);

      const rows = batch.map((content, j) => ({
        lesson_id: lesson.id,
        module_id: moduleId,
        source_label: sourceLabel,
        chunk_index: i + j,
        content,
        embedding: JSON.stringify(embeddings[j]),
        tokens: Math.ceil(content.length / 4),
      }));

      const { error } = await this.supabase.admin
        .from('knowledge_chunks')
        .upsert(rows, {
          onConflict: 'lesson_id,chunk_index',
          ignoreDuplicates: false,
        });

      if (error) {
        throw new Error(`Upsert failed: ${error.message}`);
      }

      status.chunksUpserted += rows.length;
    }
  }
}
