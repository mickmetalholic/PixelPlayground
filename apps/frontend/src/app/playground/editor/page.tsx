'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createPlaygroundExtensions } from '@/lib/editor/tiptap-extensions';

export default function PlaygroundEditorPage() {
  const extensions = useMemo(() => createPlaygroundExtensions(), []);
  const editor = useEditor({
    extensions,
    content: '<p>Edit this text and use bold/italic shortcuts.</p>',
  });

  const serialized = editor?.getJSON() ?? null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Editor Demo</h2>
      <Card>
        <CardContent className="p-4">
          <EditorContent editor={editor} />
        </CardContent>
      </Card>
      <div className="flex gap-3">
        <Button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          type="button"
          variant="outline"
        >
          Bold
        </Button>
        <Button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          type="button"
          variant="outline"
        >
          Italic
        </Button>
      </div>
      <pre className="rounded-lg border border-border bg-muted/50 p-3 text-xs">
        {JSON.stringify(serialized, null, 2)}
      </pre>
    </div>
  );
}
