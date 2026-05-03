'use client';

import type {
  SteamGameDetail,
  SteamPlatforms,
  SteamSupportedLanguage,
} from '@pixel-playground/api';
import {
  AlertCircle,
  Apple,
  Calendar,
  Check,
  Clock,
  DollarSign,
  ExternalLink,
  FileText,
  Languages,
  Minus,
  Monitor,
  Store,
  Tag,
  Terminal,
  ThumbsUp,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageWithFallback } from './steam-image-fallback';

interface DetailPanelProps {
  detail: SteamGameDetail | null;
  loading: boolean;
  notFound: boolean;
  error: string | null;
  onRetry: () => void;
}

const subtleScrollbar =
  '[scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,.45)_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30';

export function DetailPanel({
  detail,
  loading,
  notFound,
  error,
  onRetry,
}: DetailPanelProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="size-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          <p className="text-sm">Loading detail...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (notFound || !detail) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <AlertCircle className="size-8" />
          <p className="text-sm">Game not found</p>
        </div>
      </div>
    );
  }

  return <DetailContent detail={detail} />;
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <AlertCircle className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent/80"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function DetailContent({ detail }: { detail: SteamGameDetail }) {
  return (
    <div className="flex flex-col gap-5">
      <ImageWithFallback
        src={detail.headerImage}
        alt={detail.nameEn}
        className="aspect-[460/215] w-full rounded-lg border border-border/60 bg-muted/30 object-contain"
        height={215}
        width={460}
      />

      <div className="flex items-start gap-4">
        <ImageWithFallback
          src={detail.capsuleImage}
          alt={detail.nameEn}
          className="mt-1 h-[54px] w-36 shrink-0 rounded-md border border-border/60 bg-muted/30 object-contain"
          height={54}
          width={144}
        />
        <div className="min-w-0">
          <h2 className="text-lg font-semibold leading-tight">
            {detail.nameEn}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{detail.nameZh}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <StatusBadge detail={detail} />
            {detail.sourceLanguageFallback && (
              <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                Name fallback
              </span>
            )}
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <MetadataItem
          icon={<Tag className="size-3.5" />}
          label="Steam ID"
          value={<code className="font-mono text-xs">{detail.steamId}</code>}
        />
        <MetadataItem
          icon={<Calendar className="size-3.5" />}
          label="Release"
          value={detail.releaseDate}
        />
        <MetadataItem
          icon={<Clock className="size-3.5" />}
          label="Last synced"
          value={formatDateTime(detail.lastSyncedAt)}
        />
        <MetadataItem
          icon={<ThumbsUp className="size-3.5" />}
          label="Recommendations"
          value={
            detail.recommendations
              ? detail.recommendations.toLocaleString()
              : 'N/A'
          }
        />
      </section>

      <Section title="People" icon={<Users className="size-4" />}>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <TextBlock label="Developers" values={detail.developers} />
          <TextBlock label="Publishers" values={detail.publishers} />
        </div>
      </Section>

      <Section title="Commercial" icon={<DollarSign className="size-4" />}>
        <div className="flex flex-col gap-3 rounded-md border border-border/70 bg-muted/20 p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            {detail.isFree ? (
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                Free to play
              </span>
            ) : detail.priceOverview ? (
              <>
                {detail.priceOverview.discountPercent > 0 && (
                  <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-xs font-semibold text-red-700 dark:text-red-300">
                    -{detail.priceOverview.discountPercent}%
                  </span>
                )}
                <span className="font-semibold">
                  {detail.priceOverview.finalFormatted}
                </span>
                {detail.priceOverview.discountPercent > 0 && (
                  <span className="text-muted-foreground line-through">
                    ${(detail.priceOverview.initial / 100).toFixed(2)}
                  </span>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">Price unavailable</span>
            )}
          </div>
          {detail.priceOverview && (
            <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
              <span>Currency: {detail.priceOverview.currency}</span>
              <span>Initial: {detail.priceOverview.initial}</span>
              <span>Final: {detail.priceOverview.final}</span>
            </div>
          )}
        </div>
      </Section>

      <Section title="Platforms" icon={<Monitor className="size-4" />}>
        <PlatformList platforms={detail.platforms} />
      </Section>

      <Section title="Genres" icon={<Tag className="size-4" />}>
        <TagList values={detail.genres} variant="fill" />
      </Section>

      <Section title="Categories" icon={<Tag className="size-4" />}>
        <TagList values={detail.categories} variant="outline" />
      </Section>

      <Section title="Descriptions" icon={<FileText className="size-4" />}>
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Short description
            </p>
            <p
              className={cn(
                'max-h-32 overflow-y-auto rounded-md border border-border/70 bg-muted/20 p-3 pr-2 text-sm leading-relaxed text-muted-foreground',
                subtleScrollbar,
              )}
            >
              {detail.shortDescription}
            </p>
          </div>

          {detail.detailedDescription && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Detailed description
              </p>
              <div
                className={cn(
                  'max-h-52 overflow-y-auto rounded-md border border-border/70 bg-muted/20 p-3 pr-2 text-sm leading-relaxed text-muted-foreground',
                  subtleScrollbar,
                )}
              >
                {detail.detailedDescription}
              </div>
            </div>
          )}
        </div>
      </Section>

      <Section title="Languages" icon={<Languages className="size-4" />}>
        <LanguageMatrix values={detail.supportedLanguages} />
      </Section>

      {detail.screenshots.length > 0 && (
        <Section title="Screenshots" icon={<FileText className="size-4" />}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {detail.screenshots.map((src, i) => (
              <ImageWithFallback
                key={src}
                src={src}
                alt={`${detail.nameEn} screenshot ${i + 1}`}
                className="aspect-video w-full rounded-md border border-border/70 bg-muted/30 object-contain"
                height={108}
                width={192}
              />
            ))}
          </div>
        </Section>
      )}

      <a
        href={detail.storeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <Store className="size-3.5" />
        View on Steam Store
        <ExternalLink className="size-3" />
      </a>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function MetadataItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2 rounded-md border border-border/70 bg-muted/20 p-2.5">
      <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="break-words text-foreground">{value}</div>
      </div>
    </div>
  );
}

function TextBlock({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="rounded-md border border-border/70 bg-muted/20 p-3">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm leading-relaxed text-foreground">
        {values.length > 0 ? values.join(', ') : 'N/A'}
      </p>
    </div>
  );
}

function TagList({
  values,
  variant,
}: {
  values: string[];
  variant: 'fill' | 'outline';
}) {
  if (values.length === 0) {
    return <p className="text-sm text-muted-foreground">N/A</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((value) => (
        <span
          key={value}
          className={cn(
            'rounded-md px-2 py-1 text-xs',
            variant === 'fill'
              ? 'bg-muted text-muted-foreground'
              : 'border border-border text-muted-foreground',
          )}
        >
          {value}
        </span>
      ))}
    </div>
  );
}

function PlatformList({ platforms }: { platforms: SteamPlatforms }) {
  const platformItems = [
    { label: 'Windows', active: platforms.windows, icon: Monitor },
    { label: 'macOS', active: platforms.mac, icon: Apple },
    { label: 'Linux', active: platforms.linux, icon: Terminal },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {platformItems.map(({ label, active, icon: Icon }) => (
        <span
          key={label}
          className={cn(
            'inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium',
            active
              ? 'border-border bg-muted/60 text-foreground'
              : 'border-border/50 text-muted-foreground/45',
          )}
        >
          <Icon className="size-3.5" />
          {label}
        </span>
      ))}
    </div>
  );
}

function LanguageMatrix({ values }: { values: SteamSupportedLanguage[] }) {
  if (values.length === 0) {
    return <p className="text-sm text-muted-foreground">N/A</p>;
  }

  return (
    <div
      className={cn(
        'max-h-64 overflow-auto rounded-md border border-border/70 bg-muted/20 text-sm',
        subtleScrollbar,
      )}
    >
      <table className="w-full min-w-[360px] border-collapse">
        <thead>
          <tr className="sticky top-0 bg-card text-left text-xs uppercase text-muted-foreground">
            <th className="px-3 py-2 font-medium">Language</th>
            <th className="px-2 py-2 text-center font-medium">Interface</th>
            <th className="px-2 py-2 text-center font-medium">Full audio</th>
            <th className="px-2 py-2 text-center font-medium">Subtitles</th>
          </tr>
        </thead>
        <tbody>
          {values.map((language) => (
            <tr key={language.name} className="border-t border-border/60">
              <td className="px-3 py-2 text-foreground">{language.name}</td>
              <td className="px-2 py-2 text-center">
                <CapabilityIcon active={language.interface} />
              </td>
              <td className="px-2 py-2 text-center">
                <CapabilityIcon active={language.fullAudio} />
              </td>
              <td className="px-2 py-2 text-center">
                <CapabilityIcon active={language.subtitles} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CapabilityIcon({ active }: { active: boolean }) {
  return active ? (
    <Check className="mx-auto size-3.5 text-emerald-600 dark:text-emerald-400" />
  ) : (
    <Minus className="mx-auto size-3.5 text-muted-foreground/45" />
  );
}

function StatusBadge({ detail }: { detail: SteamGameDetail }) {
  const ready = detail.metadataStatus === 'ready';

  return (
    <span
      className={cn(
        'rounded-md border px-2 py-0.5 text-xs font-medium',
        ready
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
          : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
      )}
    >
      {ready ? 'Ready' : 'Fallback'}
    </span>
  );
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}
