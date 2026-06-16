'use client';

import { AlertCircle, Loader2, TicketPercent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';
import { DiscountEventTable } from './discount-event-table';

const DEFAULT_LIMIT = 50;
const subtleScrollbar =
  '[scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,.45)_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/45';

export function GameDiscountEventsWorkspace() {
  const {
    data: listData,
    isLoading: listLoading,
    error: listError,
    refetch: refetchList,
  } = trpc.steam.discountEvents.useQuery(
    { limit: DEFAULT_LIMIT },
    { placeholderData: (prev) => prev },
  );

  const items = listData?.items ?? [];
  const total = listData?.total ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="shrink-0">
        <h1 className="text-xl font-semibold">Game Discount Event 管理</h1>
        <p className="text-xs text-muted-foreground">
          {total > 0
            ? `${total} discount event${total !== 1 ? 's' : ''} tracked`
            : 'Viewing Steam discount events'}
        </p>
      </div>

      {/* Table card */}
      <div className="min-h-0 min-w-0 overflow-hidden rounded-lg border border-border bg-card">
        {listLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              <p className="text-sm">Loading discount events...</p>
            </div>
          </div>
        )}

        {!listLoading && listError && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <AlertCircle className="size-8 text-destructive" />
              <p className="text-sm text-muted-foreground">
                {listError.message ?? 'Failed to load discount events.'}
              </p>
              <button
                type="button"
                onClick={() => refetchList()}
                className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent/80"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!listLoading && !listError && items.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <TicketPercent className="size-8" />
              <p className="text-sm">No discount events found</p>
            </div>
          </div>
        )}

        {!listLoading && !listError && items.length > 0 && (
          <DiscountEventTable className={cn(subtleScrollbar)} items={items} />
        )}
      </div>
    </div>
  );
}
