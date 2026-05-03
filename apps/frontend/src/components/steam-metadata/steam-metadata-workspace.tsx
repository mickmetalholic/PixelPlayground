'use client';

import { AlertCircle, Gamepad2, Loader2, Search, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';
import { DetailPanel } from './steam-game-detail-panel';
import { SteamGameTable } from './steam-game-table';

const DEFAULT_LIMIT = 50;
const subtleScrollbar =
  '[scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,.45)_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/45';

export function SteamMetadataWorkspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialQuery = searchParams.get('q') ?? '';
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Sync searchInput -> activeQuery with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveQuery(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Sync activeQuery to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeQuery) {
      params.set('q', activeQuery);
    } else {
      params.delete('q');
    }
    const next = `${pathname}?${params.toString()}`;
    router.replace(next, { scroll: false });
  }, [activeQuery, pathname, router, searchParams]);

  // tRPC query for game list
  const {
    data: listData,
    isLoading: listLoading,
    error: listError,
    refetch: refetchList,
  } = trpc.steam.games.useQuery(
    { q: activeQuery, limit: DEFAULT_LIMIT },
    { placeholderData: (prev) => prev },
  );

  const items = listData?.items ?? [];
  const total = listData?.total ?? 0;

  // Select first item by default or handle selection removal
  useEffect(() => {
    if (items.length === 0) {
      setSelectedId(null);
      return;
    }

    setSelectedId((prev) => {
      if (prev && items.some((i) => i.steamId === prev)) return prev;
      return items[0]?.steamId ?? null;
    });
  }, [items]);

  // tRPC query for game detail (only when selectedId is set)
  const {
    data: detail,
    isLoading: detailLoading,
    error: detailRawError,
    refetch: refetchDetail,
  } = trpc.steam.detail.useQuery(
    { steamId: selectedId as string },
    { enabled: !!selectedId },
  );

  const detailNotFound =
    !!detailRawError && detailRawError.data?.code === 'NOT_FOUND';
  const detailError = detailNotFound
    ? null
    : detailRawError
      ? (detailRawError.message ?? 'Failed to load game detail.')
      : null;

  const handleSelect = useCallback((steamId: string) => {
    setSelectedId(steamId);
  }, []);

  const handleRetryList = useCallback(() => {
    refetchList();
  }, [refetchList]);

  const handleRetryDetail = useCallback(() => {
    refetchDetail();
  }, [refetchDetail]);

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      {/* Header area */}
      <div className="shrink-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Steam 游戏元信息管理</h1>
            <p className="text-xs text-muted-foreground">
              {total > 0
                ? `${total} game${total !== 1 ? 's' : ''} indexed`
                : 'Mock data source — tRPC backed'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              Mock source
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              tRPC search
            </Badge>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative shrink-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by Steam ID, English name, or Chinese name..."
          className="pl-9 pr-8"
        />
        {searchInput && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Main content: table + detail panel */}
      <div
        className={cn(
          'grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(380px,460px)] lg:grid-rows-1 2xl:grid-cols-[minmax(0,1fr)_minmax(440px,520px)]',
          selectedId
            ? 'grid-rows-[minmax(240px,42%)_minmax(0,1fr)]'
            : 'grid-rows-[minmax(0,1fr)]',
        )}
      >
        {/* List section */}
        <div className="min-h-0 min-w-0 overflow-hidden rounded-lg border border-border bg-card">
          {listLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                <p className="text-sm">Loading games...</p>
              </div>
            </div>
          )}

          {!listLoading && listError && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <AlertCircle className="size-8 text-destructive" />
                <p className="text-sm text-muted-foreground">
                  {listError.message ?? 'Failed to load games.'}
                </p>
                <button
                  type="button"
                  onClick={handleRetryList}
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
                <Gamepad2 className="size-8" />
                <p className="text-sm">No games found</p>
                {activeQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="text-xs text-accent hover:text-accent/80"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>
          )}

          {!listLoading && !listError && items.length > 0 && (
            <SteamGameTable
              className={subtleScrollbar}
              items={items}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          )}
        </div>

        {/* Detail panel */}
        {selectedId && (
          <div className="min-h-0 min-w-0">
            <div
              className={`h-full min-h-0 overflow-y-auto rounded-lg border border-border bg-card p-4 pr-3 ${subtleScrollbar}`}
            >
              <DetailPanel
                detail={detail ?? null}
                loading={detailLoading}
                notFound={detailNotFound}
                error={detailError}
                onRetry={handleRetryDetail}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
