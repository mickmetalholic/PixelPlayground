import type { SteamGameDetail } from '@pixel-playground/api';

export class SteamMetadataRepository {
  private store = new Map<string, SteamGameDetail>();

  seed(records: SteamGameDetail[]): void {
    for (const record of records) {
      this.store.set(record.steamId, record);
    }
  }

  list(): SteamGameDetail[] {
    return Array.from(this.store.values());
  }

  search(query: string, items: SteamGameDetail[]): SteamGameDetail[] {
    const q = query.toLowerCase();
    return items.filter(
      (g) =>
        g.steamId.includes(q) ||
        g.nameEn.toLowerCase().includes(q) ||
        g.nameZh.toLowerCase().includes(q),
    );
  }

  paginate(
    items: SteamGameDetail[],
    limit: number,
    cursor: string | null,
  ): {
    items: SteamGameDetail[];
    nextCursor: string | null;
    hasNextPage: boolean;
    total: number;
  } {
    const total = items.length;
    const startIndex = cursor ? Number.parseInt(cursor, 10) : 0;
    const endIndex = startIndex + limit;
    const pageItems = items.slice(startIndex, endIndex);
    const hasNextPage = endIndex < total;

    return {
      items: pageItems,
      nextCursor: hasNextPage ? String(endIndex) : null,
      hasNextPage,
      total,
    };
  }

  findById(steamId: string): SteamGameDetail | undefined {
    return this.store.get(steamId);
  }

  upsert(record: SteamGameDetail): void {
    this.store.set(record.steamId, {
      ...record,
      lastSyncedAt: new Date().toISOString(),
    });
  }
}
