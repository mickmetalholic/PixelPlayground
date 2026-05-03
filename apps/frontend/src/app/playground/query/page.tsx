'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/trpc/client';

export default function PlaygroundQueryPage() {
  const query = trpc.playground.todoPreview.useQuery();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Query Demo</h2>
      {query.isLoading && (
        <Badge variant="muted">Loading todo preview...</Badge>
      )}
      {query.isError && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="space-y-3 p-4">
            <p className="text-sm text-destructive">{query.error.message}</p>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => query.refetch()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}
      {query.data && (
        <Card>
          <CardContent className="grid gap-2 p-4 text-sm">
            <p>ID: {query.data.id}</p>
            <p>Title: {query.data.title}</p>
            <p>Status: {query.data.completed ? 'completed' : 'pending'}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
