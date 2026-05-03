import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  getDefaultHref,
  getSection,
  workspaceNav,
} from '@/lib/workspace/config';

export function WorkspaceShell({
  sectionSlug,
  itemSlug,
}: {
  sectionSlug: string;
  itemSlug: string;
}) {
  const currentSection = getSection(sectionSlug);

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Top navigation */}
      <header className="border-b">
        <nav className="flex items-center gap-1 px-4 py-2">
          {workspaceNav.sections.map((section) => {
            const isActive = section.slug === sectionSlug;
            const href = getDefaultHref(section.slug) ?? '#';
            return (
              <Link
                key={section.slug}
                href={href}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-neutral-100 text-neutral-900'
                    : 'text-neutral-500 hover:text-neutral-700',
                )}
              >
                {section.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        {/* Left sidebar */}
        {currentSection && (
          <aside className="w-full border-b md:w-56 md:border-b-0 md:border-r md:shrink-0">
            <nav className="flex flex-row gap-1 overflow-x-auto p-2 md:flex-col">
              {currentSection.sidebarItems.map((item) => {
                const isActive = item.slug === itemSlug;
                return (
                  <Link
                    key={item.slug}
                    href={item.href}
                    className={cn(
                      'shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors md:shrink',
                      isActive
                        ? 'bg-neutral-100 text-neutral-900 font-medium'
                        : 'text-neutral-500 hover:text-neutral-700',
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main work area */}
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-5xl" />
        </main>
      </div>
    </div>
  );
}
