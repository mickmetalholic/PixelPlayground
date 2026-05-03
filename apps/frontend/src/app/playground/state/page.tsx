'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePlaygroundStore } from '@/lib/state/playground.store';

export default function PlaygroundStatePage() {
  const count = usePlaygroundStore((state) => state.count);
  const increment = usePlaygroundStore((state) => state.increment);
  const reset = usePlaygroundStore((state) => state.reset);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">State Demo</h2>
      <Badge variant="secondary">Count: {count}</Badge>
      <div className="flex gap-4">
        <Button type="button" onClick={increment}>
          Increment
        </Button>
        <Button type="button" variant="outline" onClick={reset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
