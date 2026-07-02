import { notFound } from 'next/navigation';
import { WorkspaceShell } from '@/components/workspace/shell';
import { getSection, getSidebarItem } from '@/lib/workspace/config';

export default async function WorkspaceDraftPage({
  params,
}: {
  params: Promise<{ section: string; item: string; draftId: string }>;
}) {
  const { section: sectionSlug, item: itemSlug, draftId } = await params;

  const section = getSection(sectionSlug);
  if (!section) {
    notFound();
  }

  const sidebarItem = getSidebarItem(section, itemSlug);
  if (!sidebarItem || itemSlug !== 'steam-daily-discounts') {
    notFound();
  }

  return (
    <WorkspaceShell
      sectionSlug={sectionSlug}
      itemSlug={itemSlug}
      draftId={draftId}
    />
  );
}
