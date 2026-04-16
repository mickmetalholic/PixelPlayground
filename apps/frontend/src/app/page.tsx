'use client';

import { trpc } from '@/trpc/client';

export default function HomePage() {
  const summaryQuery = trpc.home.summary.useQuery(undefined);

  if (summaryQuery.isLoading) {
    return <main className="p-8">Loading...</main>;
  }

  if (summaryQuery.error) {
    return (
      <main className="p-8 text-red-600">{summaryQuery.error.message}</main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Pixel Playground - tRPC demo</h1>
      <p className="mt-4">{summaryQuery.data.summary}</p>
    </main>
  );
}
