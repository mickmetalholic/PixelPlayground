'use client';

import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from '@/lib/markdown/markdown-components';

const initialMarkdown = `# Markdown Demo

| Name | Value |
| --- | --- |
| feature | GFM table |

\`\`\`ts
const hello = (name: string) => \`Hello, \${name}\`;
\`\`\`
`;

export default function PlaygroundMarkdownPage() {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const rendered = useMemo(() => markdown, [markdown]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Markdown Demo</h2>
      <textarea
        value={markdown}
        onChange={(event) => setMarkdown(event.target.value)}
        rows={10}
        className="w-full rounded border p-3 font-mono text-sm"
      />
      <article className="prose dark:prose-invert max-w-none rounded border p-4">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={markdownComponents}
        >
          {rendered}
        </ReactMarkdown>
      </article>
    </div>
  );
}
