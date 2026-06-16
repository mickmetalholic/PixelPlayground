export interface SidebarItem {
  slug: string;
  label: string;
  href: string;
}

export interface Section {
  slug: string;
  label: string;
  defaultItem: string;
  sidebarItems: SidebarItem[];
}

export interface WorkspaceNavConfig {
  sections: Section[];
}

export const workspaceNav: WorkspaceNavConfig = {
  sections: [
    {
      slug: 'data-management',
      label: '数据管理',
      defaultItem: 'steam-game-metadata',
      sidebarItems: [
        {
          slug: 'steam-game-metadata',
          label: 'Steam 游戏元信息管理',
          href: '/data-management/steam-game-metadata',
        },
        {
          slug: 'game-discount-events',
          label: 'Game Discount Event 管理',
          href: '/data-management/game-discount-events',
        },
      ],
    },
    {
      slug: 'content-production',
      label: '内容生产',
      defaultItem: 'steam-daily-discounts',
      sidebarItems: [
        {
          slug: 'steam-daily-discounts',
          label: 'Steam 每日折扣',
          href: '/content-production/steam-daily-discounts',
        },
      ],
    },
  ],
};

export function getSection(slug: string): Section | undefined {
  return workspaceNav.sections.find((s) => s.slug === slug);
}

export function getSidebarItem(
  section: Section,
  itemSlug: string,
): SidebarItem | undefined {
  return section.sidebarItems.find((i) => i.slug === itemSlug);
}

export function getDefaultHref(slug: string): string | undefined {
  const section = getSection(slug);
  if (!section) return undefined;
  const item = section.sidebarItems.find((i) => i.slug === section.defaultItem);
  return item?.href;
}
