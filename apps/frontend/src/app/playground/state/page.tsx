'use client';

import { usePlaygroundStore } from '@/lib/state/playground.store';

export default function PlaygroundStatePage() {
  const count = usePlaygroundStore((state) => state.count);
  const increment = usePlaygroundStore((state) => state.increment);
  const reset = usePlaygroundStore((state) => state.reset);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">State Demo</h2>
      <p>Count: {count}</p>
      <div className="flex gap-4">
        <button
          type="button"
          className="rounded border px-3 py-1"
          onClick={increment}
        >
          Increment
        </button>
        <button
          type="button"
          className="rounded border px-3 py-1"
          onClick={reset}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
