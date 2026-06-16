'use client';

import type { GameDiscountEventListItem } from '@pixel-playground/api';
import { ImageWithFallback } from '@/components/steam-metadata/steam-image-fallback';
import { cn } from '@/lib/utils';

interface DiscountEventTableProps {
  className?: string;
  items: GameDiscountEventListItem[];
}

const typeBadgeConfig = {
  newHistoricLow: {
    label: 'New Historic Low',
    className:
      'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300',
  },
  historicLow: {
    label: 'Historic Low',
    className:
      'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300',
  },
  nonHistoricLow: {
    label: 'Non-Historic Low',
    className: 'border-muted-foreground/20 bg-muted text-muted-foreground',
  },
} as const;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function DiscountEventTable({
  className,
  items,
}: DiscountEventTableProps) {
  return (
    <div className={cn('overflow-auto', className)}>
      <table className="w-full min-w-[1100px] border-collapse text-sm">
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
            <th className="sticky top-0 z-10 bg-card px-1.5 py-2 font-medium">
              Period
            </th>
            <th className="sticky top-0 z-10 w-[80px] bg-card px-1.5 py-2 font-medium">
              Discount
            </th>
            <th className="sticky top-0 z-10 w-[100px] bg-card px-1.5 py-2 font-medium">
              Sale Price
            </th>
            <th className="sticky top-0 z-10 w-[160px] bg-card px-2 py-2 font-medium">
              Type
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((event) => {
            const typeCfg = typeBadgeConfig[event.type];
            return (
              <tr
                key={event.id}
                className="border-b border-border/50 transition-colors hover:bg-muted/50"
              >
                <td className="px-2 py-3 align-middle">
                  <ImageWithFallback
                    src={event.game.capsuleImage}
                    alt={event.game.nameEn}
                    className="h-[52px] w-[138px] rounded-md border border-border/60 bg-muted/30 object-contain"
                    width={138}
                    height={52}
                  />
                </td>
                <td className="whitespace-nowrap px-1.5 py-2 align-middle font-mono text-xs text-muted-foreground">
                  {event.steamId}
                </td>
                <td className="px-1.5 py-2 align-middle">
                  <div className="min-w-0">
                    <p className="truncate font-medium leading-5 text-foreground">
                      {event.game.nameEn}
                    </p>
                    <p className="truncate text-xs leading-4 text-muted-foreground">
                      {event.game.nameZh}
                    </p>
                  </div>
                </td>
                <td className="whitespace-nowrap px-1.5 py-2 align-middle text-xs text-muted-foreground">
                  {formatDate(event.startAt)} - {formatDate(event.endAt)}
                </td>
                <td className="whitespace-nowrap px-1.5 py-2 align-middle">
                  <span className="rounded bg-red-100 px-1 py-0.5 text-xs text-red-700 dark:bg-red-900/40 dark:text-red-400">
                    -{event.discountPercent}%
                  </span>
                </td>
                <td className="whitespace-nowrap px-1.5 py-2 align-middle font-medium">
                  {event.discountedPrice.finalFormatted}
                </td>
                <td className="whitespace-nowrap px-2 py-2 align-middle">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium',
                      typeCfg.className,
                    )}
                  >
                    {typeCfg.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
