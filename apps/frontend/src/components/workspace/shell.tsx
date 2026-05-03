import {
  ChevronRight,
  Database,
  FileText,
  FolderKanban,
  Gauge,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  getDefaultHref,
  getSection,
  getSidebarItem,
  workspaceNav,
} from '@/lib/workspace/config';

const sectionIcons = {
  'data-management': Database,
  'content-production': FileText,
} as const;

const workspacePanels = {
  'steam-game-metadata': {
    eyebrow: 'Data Pipeline',
    title: 'Steam 游戏元信息管理',
    description:
      '整理、校验并同步 Steam 游戏基础资料，为内容生产和自动化流程提供稳定的数据底座。',
    accent: 'from-pink-500 to-cyan-500',
    stats: [
      { label: 'Source Health', value: 'Ready' },
      { label: 'Schema Mode', value: 'Strict' },
      { label: 'Queue', value: '0 pending' },
    ],
    actions: ['检查缺失字段与异常值', '同步商店元信息', '生成内容生产数据包'],
  },
  'steam-daily-discounts': {
    eyebrow: 'Content Flow',
    title: 'Steam 每日折扣',
    description:
      '将折扣数据转化为可发布的内容线索，保持选题、文案和素材准备的节奏一致。',
    accent: 'from-cyan-500 to-amber-400',
    stats: [
      { label: 'Brief Status', value: 'Drafting' },
      { label: 'Channels', value: 'Multi' },
      { label: 'Review', value: 'Needed' },
    ],
    actions: ['筛选高价值折扣', '生成今日内容摘要', '整理发布检查项'],
  },
} as const;

export function WorkspaceShell({
  sectionSlug,
  itemSlug,
}: {
  sectionSlug: string;
  itemSlug: string;
}) {
  const currentSection = getSection(sectionSlug);
  const currentItem = currentSection
    ? getSidebarItem(currentSection, itemSlug)
    : undefined;
  const panel =
    workspacePanels[itemSlug as keyof typeof workspacePanels] ??
    workspacePanels['steam-game-metadata'];

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <Link
            href="/data-management/steam-game-metadata"
            className="flex w-fit items-center gap-3 rounded-lg outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <span className="grid size-9 place-items-center rounded-lg border border-border bg-card shadow-sm">
              <Sparkles className="size-4 text-primary" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-tight">
                PixelPlayground
              </span>
              <span className="block text-xs text-muted-foreground">
                Creative operations console
              </span>
            </span>
          </Link>

          <nav
            className="flex min-w-0 gap-2 overflow-x-auto"
            aria-label="Workspace sections"
          >
            {workspaceNav.sections.map((section) => {
              const isActive = section.slug === sectionSlug;
              const href = getDefaultHref(section.slug) ?? '#';
              const Icon =
                sectionIcons[section.slug as keyof typeof sectionIcons] ??
                FolderKanban;

              return (
                <Link
                  key={section.slug}
                  href={href}
                  className={cn(
                    buttonVariants({
                      variant: isActive ? 'default' : 'outline',
                      size: 'lg',
                    }),
                    'shrink-0',
                    isActive
                      ? 'border-primary/30 shadow-sm'
                      : 'text-muted-foreground hover:border-accent/50 hover:text-foreground',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {section.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="flex min-h-[calc(100dvh-73px)] flex-col lg:flex-row">
        {currentSection && (
          <aside className="border-b border-border/80 bg-card/60 lg:w-72 lg:shrink-0 lg:border-r lg:border-b-0">
            <div className="border-b border-border/70 px-4 py-4 lg:px-5">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Workspace
              </p>
              <h2 className="mt-1 text-base font-semibold">
                {currentSection.label}
              </h2>
            </div>

            <nav
              className="flex gap-2 overflow-x-auto p-3 lg:flex-col lg:overflow-visible"
              aria-label={`${currentSection.label} tools`}
            >
              {currentSection.sidebarItems.map((item) => {
                const isActive = item.slug === itemSlug;
                return (
                  <Link
                    key={item.slug}
                    href={item.href}
                    className={cn(
                      buttonVariants({
                        variant: isActive ? 'secondary' : 'ghost',
                        size: 'lg',
                      }),
                      'group min-h-11 shrink-0 justify-between border px-3 py-2 lg:w-full lg:shrink',
                      isActive
                        ? 'border-accent/40 shadow-sm'
                        : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted/70 hover:text-foreground',
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="min-w-0 truncate">{item.label}</span>
                    <ChevronRight
                      className={cn(
                        'size-4 shrink-0 transition-transform',
                        isActive
                          ? 'text-accent'
                          : 'text-muted-foreground group-hover:translate-x-0.5',
                      )}
                      aria-hidden="true"
                    />
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <Card className="overflow-hidden">
              <div className={cn('h-1.5 bg-gradient-to-r', panel.accent)} />
              <CardContent className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:p-6">
                <div>
                  <Badge variant="muted" className="uppercase">
                    <Gauge className="size-4 text-accent" aria-hidden="true" />
                    {panel.eyebrow}
                  </Badge>
                  <h1 className="mt-3 text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
                    {currentItem?.label ?? panel.title}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {panel.description}
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                  {panel.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-lg border border-border bg-muted/45 px-3 py-2"
                    >
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="mt-1 font-mono text-sm font-semibold">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <section className="grid gap-4 md:grid-cols-3">
              {panel.actions.map((action, index) => (
                <Card
                  key={action}
                  className="transition-colors hover:border-accent/50"
                >
                  <CardHeader className="p-4">
                    <Badge variant="outline" className="font-mono">
                      Step {index + 1}
                    </Badge>
                    <CardTitle className="mt-2 text-sm">{action}</CardTitle>
                    <CardDescription>
                      使用左侧工具进入对应流程，保持数据、内容和检查项同步推进。
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
