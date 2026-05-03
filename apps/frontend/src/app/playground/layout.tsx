import {
  Beaker,
  Bot,
  Braces,
  FileText,
  FormInput,
  Pencil,
  Radio,
} from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const links = [
  { href: '/playground/query', label: 'Query', Icon: Radio },
  { href: '/playground/state', label: 'State', Icon: Braces },
  { href: '/playground/form', label: 'Form', Icon: FormInput },
  { href: '/playground/markdown', label: 'Markdown', Icon: FileText },
  { href: '/playground/editor', label: 'Editor', Icon: Pencil },
  { href: '/playground/ai', label: 'AI', Icon: Bot },
];

export default function PlaygroundLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Card>
          <CardHeader className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg border border-border bg-muted">
                  <Beaker className="size-5 text-primary" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    PixelPlayground
                  </p>
                  <h1 className="text-2xl font-semibold">Playground</h1>
                </div>
              </div>
              <Link
                href="/data-management/steam-game-metadata"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'text-muted-foreground hover:text-foreground',
                )}
              >
                Workspace
              </Link>
            </div>
          </CardHeader>

          <CardContent>
            <nav
              className="flex gap-2 overflow-x-auto"
              aria-label="Playground demos"
            >
              {links.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'shrink-0 text-muted-foreground hover:border-accent/50 hover:text-foreground',
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </nav>
          </CardContent>
        </Card>

        <section className="mt-6">{children}</section>
      </div>
    </div>
  );
}
