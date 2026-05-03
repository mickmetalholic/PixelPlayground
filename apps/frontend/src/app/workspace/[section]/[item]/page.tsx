import { notFound } from 'next/navigation';
import { WorkspaceShell } from '@/components/workspace/shell';
import { getSection, getSidebarItem } from '@/lib/workspace/config';

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ section: string; item: string }>;
}) {
  const { section: sectionSlug, item: itemSlug } = await params;

  const section = getSection(sectionSlug);
  if (!section) {
    notFound();
  }

  const sidebarItem = getSidebarItem(section, itemSlug);
  if (!sidebarItem) {
    notFound();
  }

  return <WorkspaceShell sectionSlug={sectionSlug} itemSlug={itemSlug} />;
}
