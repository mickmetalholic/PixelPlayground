import { cn } from '@/lib/ui/cn';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors outline-none file:border-0 file:bg-transparent file:font-medium placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
