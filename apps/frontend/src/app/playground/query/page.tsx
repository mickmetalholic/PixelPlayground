'use client';

import { trpc } from '@/trpc/client';

export default function PlaygroundQueryPage() {
  const query = trpc.playground.todoPreview.useQuery();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Query Demo</h2>
      {query.isLoading && <p>Loading todo preview...</p>}
      {query.isError && (
        <div className="space-y-2 text-red-600">
          <p>{query.error.message}</p>
          <button
            type="button"
            className="underline"
            onClick={() => query.refetch()}
          >
            Retry
          </button>
        </div>
      )}
      {query.data && (
        <div className="rounded border p-3">
          <p>ID: {query.data.id}</p>
          <p>Title: {query.data.title}</p>
          <p>Status: {query.data.completed ? 'completed' : 'pending'}</p>
        </div>
      )}
    </div>
  );
}
