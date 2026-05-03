import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/ui/cn';

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow-sm',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border bg-background text-foreground',
        muted: 'border-border bg-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
