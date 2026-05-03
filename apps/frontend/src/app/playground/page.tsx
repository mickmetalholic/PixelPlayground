import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

const items = [
  {
    href: '/playground/query',
    description: 'React Query loading/success/error',
  },
  {
    href: '/playground/state',
    description: 'Zustand predictable state actions',
  },
  { href: '/playground/form', description: 'React Hook Form + Zod validation' },
  {
    href: '/playground/markdown',
    description: 'React Markdown with GFM highlighting',
  },
  {
    href: '/playground/editor',
    description: 'Tiptap editing + serialized output',
  },
  { href: '/playground/ai', description: 'AI request with fallback paths' },
];

export default function PlaygroundIndexPage() {
  return (
    <div className="space-y-5">
      <div>
        <Badge variant="secondary">Capability demos</Badge>
        <h2 className="mt-3 text-xl font-semibold">
          Select a playground surface
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Each route isolates one frontend capability so styling, behavior, and
          validation can be checked without leaving the app.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <Card
            key={item.href}
            className="transition-colors hover:border-accent/50"
          >
            <CardHeader className="p-4">
              <CardTitle className="text-sm">{item.href}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
              <Link
                href={item.href}
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'mt-2 w-fit text-primary hover:text-primary',
                )}
              >
                Open
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
