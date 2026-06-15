import { ChevronDown, ChevronUp } from 'lucide-react';
import { memo, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';

import { cn } from '@/lib/cn.js';

export interface DataGridColumn<T> {
  key: string;
  header: string;
  accessor: (item: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  width?: string;
}

export interface DataGridProps<T> {
  data: T[];
  columns: DataGridColumn<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  highlightRow?: (item: T) => boolean;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

const alignClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

function DataGridInner<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  highlightRow,
  loading = false,
  emptyMessage = 'Nenhum registro encontrado',
  className,
}: DataGridProps<T>): JSX.Element {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return data;
    return [...data].sort((a, b) => {
      const av = String(col.accessor(a));
      const bv = String(col.accessor(b));
      const cmp = av.localeCompare(bv, 'pt-BR', { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, columns, sortKey, sortDir]);

  const handleSort = (key: string, sortable?: boolean): void => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  if (loading) {
    return (
      <div className={cn('space-y-2', className)} aria-busy="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-10 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto rounded-xl border border-white/8', className)}>
      <table className="w-full min-w-[480px] text-sm" role="table" aria-label="Tabela de dados">
        <thead>
          <tr className="border-b border-white/8 bg-bg-elevated/80">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40',
                  alignClass[col.align ?? 'left'],
                  col.sortable && 'cursor-pointer select-none hover:text-white/70',
                )}
                style={col.width ? { width: col.width } : undefined}
                onClick={() => handleSort(col.key, col.sortable)}
                aria-sort={
                  sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined
                }
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable &&
                    sortKey === col.key &&
                    (sortDir === 'asc' ? (
                      <ChevronUp className="h-3 w-3" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="h-3 w-3" aria-hidden="true" />
                    ))}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-white/40">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((item) => {
              const key = keyExtractor(item);
              const highlighted = highlightRow?.(item) ?? false;
              const interactive = Boolean(onRowClick);
              return (
                <tr
                  key={key}
                  className={cn(
                    'border-b border-white/5 transition-colors',
                    highlighted && 'bg-brand-gold-muted/40',
                    interactive && 'cursor-pointer hover:bg-white/5',
                  )}
                  {...(interactive
                    ? {
                        onClick: () => onRowClick?.(item),
                        tabIndex: 0 as const,
                        onKeyDown: (e: KeyboardEvent) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onRowClick?.(item);
                          }
                        },
                      }
                    : {})}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn('px-4 py-3 text-white/80', alignClass[col.align ?? 'left'])}
                    >
                      {col.accessor(item)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export const DataGrid = memo(DataGridInner) as typeof DataGridInner;
