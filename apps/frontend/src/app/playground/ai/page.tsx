'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
      <div className="space-y-2">
        <Label htmlFor="ai-prompt">Prompt</Label>
        <Textarea
          id="ai-prompt"
          rows={4}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
        />
      </div>
      <Button
        type="button"
        onClick={() => mutation.mutate({ prompt })}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Requesting...' : 'Send'}
      </Button>
      {mutation.data && (
        <Card>
          <CardContent className="p-4 text-sm leading-6">
            {mutation.data.output}
          </CardContent>
        </Card>
      )}
      {mutation.error && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">
            {normalizeAiError(mutation.error)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
