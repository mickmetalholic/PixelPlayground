import { cn } from '@/lib/ui/cn';

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: This reusable primitive receives htmlFor at call sites.
    <label
      data-slot="label"
      className={cn(
        'flex w-fit items-center gap-2 text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Label };
