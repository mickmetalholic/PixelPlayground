'use client';

import type { GameDiscountNewsCandidate } from '@pixel-playground/api';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  FilePlus2,
  Loader2,
  Save,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ImageWithFallback } from '@/components/steam-metadata/steam-image-fallback';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';

interface SteamDailyDiscountsWorkspaceProps {
  draftId?: string;
}

const typeLabel = {
  dailyDeal: 'Daily Deal',
  seasonalSale: 'Seasonal Sale',
  publisherSale: 'Publisher Sale',
  genreSale: 'Genre Sale',
  thematic: 'Thematic',
} as const;

const eventTypeLabel = {
  newHistoricLow: 'New Historic Low',
  historicLow: 'Historic Low',
  nonHistoricLow: 'Non-Historic Low',
} as const;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function SteamDailyDiscountsWorkspace({
  draftId,
}: SteamDailyDiscountsWorkspaceProps) {
  return draftId ? <DraftDetail draftId={draftId} /> : <DraftList />;
}

function DraftList() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const entriesQuery = trpc.steam.discountNews.entries.useQuery();
  const createDraft = trpc.steam.discountNews.createDraft.useMutation({
    onSuccess: async (draft) => {
      await utils.steam.discountNews.entries.invalidate();
      router.push(`/content-production/steam-daily-discounts/${draft.id}`);
    },
  });

  const entries = entriesQuery.data?.items ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Steam 每日折扣</h1>
          <p className="text-xs text-muted-foreground">
            {entries.length > 0
              ? `${entries.length} draft${entries.length !== 1 ? 's' : ''} in pool`
              : 'Create a daily discount pool to select current deals'}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => createDraft.mutate({ type: 'dailyDeal' })}
          disabled={createDraft.isPending}
        >
          {createDraft.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FilePlus2 className="size-4" />
          )}
          Create draft
        </Button>
      </div>

      {entriesQuery.isLoading && <LoadingState label="Loading drafts..." />}
      {entriesQuery.error && (
        <ErrorState message={entriesQuery.error.message} />
      )}
      {!entriesQuery.isLoading &&
        !entriesQuery.error &&
        entries.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
            <p className="text-sm font-medium">No discount news drafts</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Drafts hold selected discount events before platform publication.
            </p>
          </div>
        )}
      {!entriesQuery.isLoading && !entriesQuery.error && entries.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th className="px-3 py-2 font-medium">Draft</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Selected</th>
                <th className="px-3 py-2 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="cursor-pointer border-b border-border/50 transition-colors last:border-0 hover:bg-muted/50"
                  onClick={() =>
                    router.push(
                      `/content-production/steam-daily-discounts/${entry.id}`,
                    )
                  }
                >
                  <td className="px-3 py-3 font-mono text-xs">{entry.id}</td>
                  <td className="px-3 py-3">
                    <Badge variant="secondary">{typeLabel[entry.type]}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    <Badge
                      variant={entry.status === 'ready' ? 'default' : 'outline'}
                    >
                      {entry.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">
                    {entry.selectedDiscountEventIds.length}
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {formatDate(entry.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {createDraft.error && <ErrorState message={createDraft.error.message} />}
    </div>
  );
}

function DraftDetail({ draftId }: { draftId: string }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const entriesQuery = trpc.steam.discountNews.entries.useQuery();
  const candidatesQuery = trpc.steam.discountNews.candidates.useQuery({
    newsEntryId: draftId,
    limit: 50,
  });
  const updateSelected =
    trpc.steam.discountNews.updateSelectedEvents.useMutation({
      onSuccess: async () => {
        await Promise.all([
          utils.steam.discountNews.entries.invalidate(),
          utils.steam.discountNews.candidates.invalidate({
            newsEntryId: draftId,
          }),
        ]);
      },
    });

  const draft = entriesQuery.data?.items.find((entry) => entry.id === draftId);
  const candidates = candidatesQuery.data?.items ?? [];
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!candidatesQuery.data) return;
    setSelectedIds(
      candidatesQuery.data.items
        .filter((candidate) => candidate.alreadySelected)
        .map((candidate) => candidate.id),
    );
  }, [candidatesQuery.data]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggleSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((candidateId) => candidateId !== id)
        : [...current, id],
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mb-2 w-fit"
            onClick={() =>
              router.push('/content-production/steam-daily-discounts')
            }
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <h1 className="truncate text-xl font-semibold">
            Candidate selection
          </h1>
          <p className="text-xs text-muted-foreground">
            {draft
              ? `${draft.id} · ${typeLabel[draft.type]} · ${draft.status}`
              : draftId}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() =>
            updateSelected.mutate({
              newsEntryId: draftId,
              selectedDiscountEventIds: selectedIds,
            })
          }
          disabled={updateSelected.isPending}
        >
          {updateSelected.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : updateSelected.isSuccess ? (
            <Check className="size-4" />
          ) : (
            <Save className="size-4" />
          )}
          Save selection
        </Button>
      </div>

      {(entriesQuery.isLoading || candidatesQuery.isLoading) && (
        <LoadingState label="Loading candidates..." />
      )}
      {entriesQuery.error && (
        <ErrorState message={entriesQuery.error.message} />
      )}
      {candidatesQuery.error && (
        <ErrorState message={candidatesQuery.error.message} />
      )}
      {updateSelected.error && (
        <ErrorState message={updateSelected.error.message} />
      )}
      {!entriesQuery.isLoading && entriesQuery.data && !draft && (
        <ErrorState message={`Draft "${draftId}" was not found.`} />
      )}
      {!candidatesQuery.isLoading &&
        !candidatesQuery.error &&
        candidates.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
            <p className="text-sm font-medium">No eligible current discounts</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Current discount windows or ready-pool exclusions may leave no
              candidates.
            </p>
          </div>
        )}
      {!candidatesQuery.isLoading &&
        !candidatesQuery.error &&
        candidates.length > 0 && (
          <CandidateTable
            candidates={candidates}
            selectedSet={selectedSet}
            onToggle={toggleSelection}
          />
        )}
    </div>
  );
}

function CandidateTable({
  candidates,
  selectedSet,
  onToggle,
}: {
  candidates: GameDiscountNewsCandidate[];
  selectedSet: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="overflow-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[1180px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
            <th className="sticky top-0 z-10 w-[64px] bg-card px-3 py-2 font-medium">
              Pick
            </th>
            <th className="sticky top-0 z-10 w-[148px] bg-card px-2 py-2 font-medium">
              Capsule
            </th>
            <th className="sticky top-0 z-10 min-w-[220px] bg-card px-2 py-2 font-medium">
              Game
            </th>
            <th className="sticky top-0 z-10 bg-card px-2 py-2 font-medium">
              Period
            </th>
            <th className="sticky top-0 z-10 w-[88px] bg-card px-2 py-2 font-medium">
              Discount
            </th>
            <th className="sticky top-0 z-10 w-[110px] bg-card px-2 py-2 font-medium">
              Price
            </th>
            <th className="sticky top-0 z-10 w-[150px] bg-card px-2 py-2 font-medium">
              Type
            </th>
            <th className="sticky top-0 z-10 w-[100px] bg-card px-2 py-2 font-medium">
              Score
            </th>
            <th className="sticky top-0 z-10 min-w-[220px] bg-card px-2 py-2 font-medium">
              Reason
            </th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => (
            <tr
              key={candidate.id}
              className={cn(
                'border-b border-border/50 transition-colors last:border-0 hover:bg-muted/50',
                selectedSet.has(candidate.id) ? 'bg-accent/10' : '',
              )}
            >
              <td className="px-3 py-3 align-middle">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={selectedSet.has(candidate.id)}
                  onChange={() => onToggle(candidate.id)}
                  aria-label={`Select ${candidate.game.nameEn}`}
                />
              </td>
              <td className="px-2 py-3 align-middle">
                <ImageWithFallback
                  src={candidate.game.capsuleImage}
                  alt={candidate.game.nameEn}
                  className="h-[52px] w-[138px] rounded-md border border-border/60 bg-muted/30 object-contain"
                  width={138}
                  height={52}
                />
              </td>
              <td className="px-2 py-3 align-middle">
                <p className="truncate font-medium">{candidate.game.nameEn}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {candidate.game.nameZh}
                </p>
              </td>
              <td className="whitespace-nowrap px-2 py-3 align-middle text-xs text-muted-foreground">
                {formatDate(candidate.startAt)} - {formatDate(candidate.endAt)}
              </td>
              <td className="px-2 py-3 align-middle">
                <span className="rounded bg-red-100 px-1 py-0.5 text-xs text-red-700 dark:bg-red-900/40 dark:text-red-400">
                  -{candidate.discountPercent}%
                </span>
              </td>
              <td className="whitespace-nowrap px-2 py-3 align-middle font-medium">
                {candidate.discountedPrice.finalFormatted}
              </td>
              <td className="px-2 py-3 align-middle">
                <Badge variant="outline">
                  {eventTypeLabel[candidate.type]}
                </Badge>
              </td>
              <td className="whitespace-nowrap px-2 py-3 align-middle font-mono text-xs">
                {candidate.score}
              </td>
              <td className="px-2 py-3 align-middle text-xs text-muted-foreground">
                {candidate.reason}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      {label}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
