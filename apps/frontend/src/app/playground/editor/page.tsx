'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { useMemo } from 'react';
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
      <div className="rounded border p-3">
        <EditorContent editor={editor} />
      </div>
      <div className="flex gap-3">
        <button
          className="rounded border px-3 py-1"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          type="button"
        >
          Bold
        </button>
        <button
          className="rounded border px-3 py-1"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          type="button"
        >
          Italic
        </button>
      </div>
      <pre className="rounded border p-3 text-xs">
        {JSON.stringify(serialized, null, 2)}
      </pre>
    </div>
  );
}
