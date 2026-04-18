import Link from 'next/link';

const links = [
  { href: '/playground/query', label: 'Query' },
  { href: '/playground/state', label: 'State' },
  { href: '/playground/form', label: 'Form' },
  { href: '/playground/markdown', label: 'Markdown' },
  { href: '/playground/editor', label: 'Editor' },
  { href: '/playground/ai', label: 'AI' },
];

export default function PlaygroundLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-semibold">Playground</h1>
      <nav className="mt-4 flex flex-wrap gap-3">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="underline">
            {link.label}
          </Link>
        ))}
      </nav>
      <section className="mt-8">{children}</section>
    </div>
  );
}
