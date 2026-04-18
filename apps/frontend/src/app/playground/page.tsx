import Link from 'next/link';

const items = [
  {
    href: '/playground/query',
    description: 'React Query loading/success/error',
  },
  {
    href: '/playground/state',
    description: 'Zustand predictable state actions',
  },
  { href: '/playground/form', description: 'React Hook Form + Zod validation' },
  {
    href: '/playground/markdown',
    description: 'React Markdown with GFM highlighting',
  },
  {
    href: '/playground/editor',
    description: 'Tiptap editing + serialized output',
  },
  { href: '/playground/ai', description: 'AI request with fallback paths' },
];

export default function PlaygroundIndexPage() {
  return (
    <div>
      <p>Select a capability demo:</p>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="font-medium underline">
              {item.href}
            </Link>
            <span className="ml-2 text-sm text-gray-500">
              {item.description}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
