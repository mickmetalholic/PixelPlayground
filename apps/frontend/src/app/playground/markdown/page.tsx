'use client';

import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
      <div className="space-y-2">
        <Label htmlFor="markdown-input">Source</Label>
        <Textarea
          id="markdown-input"
          value={markdown}
          onChange={(event) => setMarkdown(event.target.value)}
          rows={10}
          className="font-mono"
        />
      </div>
      <Card>
        <CardContent className="p-4">
          <article className="prose dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={markdownComponents}
            >
              {rendered}
            </ReactMarkdown>
          </article>
        </CardContent>
      </Card>
    </div>
  );
}
