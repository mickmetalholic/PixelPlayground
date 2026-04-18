'use client';

import { useState } from 'react';
import { normalizeAiError } from '@/lib/ai/playground-ai-client';
import { trpc } from '@/trpc/client';

export default function PlaygroundAiPage() {
  const [prompt, setPrompt] = useState(
    'Explain immutable updates in one sentence.',
  );
  const mutation = trpc.playground.aiComplete.useMutation();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">AI Demo</h2>
      <textarea
        className="w-full rounded border p-3"
        rows={4}
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
      />
      <button
        type="button"
        className="rounded border px-3 py-1"
        onClick={() => mutation.mutate({ prompt })}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Requesting...' : 'Send'}
      </button>
      {mutation.data && (
        <p className="rounded border p-3">{mutation.data.output}</p>
      )}
      {mutation.error && (
        <p className="rounded border border-red-500 p-3 text-red-600">
          {normalizeAiError(mutation.error)}
        </p>
      )}
    </div>
  );
}
