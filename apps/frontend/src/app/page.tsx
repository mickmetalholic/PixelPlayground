'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/home/summary')
      .then(async (r) => {
        const data = (await r.json()) as { summary?: string; message?: string };
        if (!r.ok) {
          setError(data.message ?? `HTTP ${r.status}`);
          return;
        }
        setSummary(data.summary ?? '');
      })
      .catch(() => setError('Request failed'));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-semibold">
        Pixel Playground — Frontend (BFF demo)
      </h1>
      <p className="mt-4 max-w-lg text-center text-sm text-zinc-600">
        下方数据来自同源{' '}
        <code className="rounded bg-zinc-100 px-1">/api/home/summary</code>，由
        Route Handler 服务端请求{' '}
        <code className="rounded bg-zinc-100 px-1">NEST_ORIGIN</code> 上的
        Nest。
      </p>
      <p className="mt-6 font-mono text-lg">
        {error && <span className="text-red-600">{error}</span>}
        {!error && summary === null && 'Loading…'}
        {!error && summary !== null && summary}
      </p>
    </main>
  );
}
