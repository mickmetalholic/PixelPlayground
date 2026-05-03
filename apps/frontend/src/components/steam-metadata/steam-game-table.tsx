'use client';

import type { SteamGameSummary } from '@pixel-playground/api';
import { Apple, Monitor, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageWithFallback } from './steam-image-fallback';

interface SteamGameTableProps {
  className?: string;
  items: SteamGameSummary[];
  selectedId: string | null;
  onSelect: (steamId: string) => void;
}

export function SteamGameTable({
  className,
  items,
  selectedId,
  onSelect,
}: SteamGameTableProps) {
  return (
    <div className={cn('h-full overflow-auto', className)}>
      <table className="w-full min-w-[980px] border-collapse text-sm">
        <thead>
          <tr className="whitespace-nowrap border-b border-border text-left text-xs uppercase text-muted-foreground">
            <th className="sticky top-0 z-10 w-[148px] bg-card px-2 py-2 font-medium">
              Capsule
            </th>
            <th className="sticky top-0 z-10 w-[88px] bg-card px-1.5 py-2 font-medium">
              Steam ID
            </th>
            <th className="sticky top-0 z-10 min-w-[205px] bg-card px-1.5 py-2 font-medium">
              Game
            </th>
            <th className="sticky top-0 z-10 w-[102px] bg-card px-1.5 py-2 font-medium">
              Release
            </th>
            <th className="sticky top-0 z-10 min-w-[138px] bg-card px-1.5 py-2 font-medium">
              Developer
            </th>
            <th className="sticky top-0 z-10 w-[96px] bg-card px-1.5 py-2 font-medium">
              Platform
            </th>
            <th className="sticky top-0 z-10 w-[118px] bg-card px-1.5 py-2 font-medium">
              Last synced
            </th>
            <th className="sticky top-0 z-10 w-[148px] bg-card px-2 py-2 text-right font-medium">
              Price
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((game) => (
            // biome-ignore lint/a11y/useSemanticElements: table row needs click handler for row selection
            <tr
              key={game.steamId}
              className={cn(
                'cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:bg-muted/50',
                selectedId === game.steamId
                  ? 'bg-accent/10 ring-1 ring-inset ring-accent/30'
                  : '',
              )}
              tabIndex={0}
              role="button"
              onClick={() => onSelect(game.steamId)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(game.steamId);
                }
              }}
            >
              <td className="px-2 py-3 align-middle">
                <ImageWithFallback
                  src={game.capsuleImage}
                  alt={game.nameEn}
                  className="h-[52px] w-[138px] rounded-md border border-border/60 bg-muted/30 object-contain"
                  width={138}
                  height={52}
                />
              </td>
              <td className="whitespace-nowrap px-1.5 py-2 align-middle font-mono text-xs text-muted-foreground">
                {game.steamId}
              </td>
              <td className="px-1.5 py-2 align-middle">
                <div className="min-w-0">
                  <p className="truncate font-medium leading-5 text-foreground">
                    {game.nameEn}
                  </p>
                  <p className="truncate text-xs leading-4 text-muted-foreground">
                    {game.nameZh}
                  </p>
                </div>
              </td>
              <td className="whitespace-nowrap px-1.5 py-2 align-middle text-muted-foreground">
                {game.releaseDate}
              </td>
              <td className="px-1.5 py-2 align-middle text-muted-foreground">
                <span className="block max-w-[190px] truncate">
                  {game.developers[0]}
                </span>
              </td>
              <td className="px-1.5 py-2 align-middle">
                <span className="inline-flex items-center gap-1">
                  <PlatformIcon
                    active={game.platforms.windows}
                    label="Windows"
                  />
                  <PlatformIcon active={game.platforms.mac} label="macOS" />
                  <PlatformIcon active={game.platforms.linux} label="Linux" />
                </span>
              </td>
              <td className="whitespace-nowrap px-1.5 py-2 align-middle">
                <LastSyncedBadge value={game.lastSyncedAt} />
              </td>
              <td className="whitespace-nowrap px-2 py-2 text-right align-middle">
                {game.isFree ? (
                  <span className="font-medium text-green-600 dark:text-green-400">
                    Free
                  </span>
                ) : game.priceOverview ? (
                  <span className="font-medium">
                    {game.priceOverview.discountPercent > 0 ? (
                      <>
                        <span className="mr-1 rounded bg-red-100 px-1 py-0.5 text-xs text-red-700 dark:bg-red-900/40 dark:text-red-400">
                          -{game.priceOverview.discountPercent}%
                        </span>
                        <span className="text-muted-foreground line-through">
                          ${(game.priceOverview.initial / 100).toFixed(2)}
                        </span>
                        <span className="ml-1">
                          {game.priceOverview.finalFormatted}
                        </span>
                      </>
                    ) : (
                      game.priceOverview.finalFormatted
                    )}
                  </span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PlatformIcon({ active, label }: { active: boolean; label: string }) {
  const Icon =
    label === 'Windows' ? Monitor : label === 'macOS' ? Apple : Terminal;

  return (
    <span
      className={cn(
        'inline-flex size-6 items-center justify-center rounded-md border transition-colors',
        active
          ? 'border-border bg-muted/60 text-foreground'
          : 'border-transparent text-muted-foreground/25',
      )}
      title={label}
    >
      <Icon className="size-3" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

function LastSyncedBadge({ value }: { value: string }) {
  const syncedAt = new Date(value);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - syncedAt.getTime());
  const diffDays = Math.floor(diffMs / 86_400_000);

  const label =
    diffDays === 0
      ? 'Today'
      : diffDays === 1
        ? '1 day ago'
        : `${diffDays} days ago`;

  const tone =
    diffDays <= 1
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
      : diffDays <= 7
        ? 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300'
        : diffDays <= 30
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
          : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-1.5 py-1 text-xs font-medium',
        tone,
      )}
      title={syncedAt.toLocaleString()}
    >
      {label}
    </span>
  );
}
