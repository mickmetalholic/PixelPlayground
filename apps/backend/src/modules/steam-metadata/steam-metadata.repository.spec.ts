import { SteamMetadataRepository } from './steam-metadata.repository';
import { mockGameRecords } from './steam-metadata.seed';

describe('SteamMetadataRepository', () => {
  let repo: SteamMetadataRepository;

  beforeEach(() => {
    repo = new SteamMetadataRepository();
    repo.seed(mockGameRecords);
  });

  it('is seeded with 7 mock games', () => {
    expect(repo.list()).toHaveLength(7);
  });

  it('searches by steamId', () => {
    const all = repo.list();
    const results = repo.search('1091500', all);
    expect(results).toHaveLength(1);
    expect(results[0].steamId).toBe('1091500');
  });

  it('searches by English name', () => {
    const all = repo.list();
    const results = repo.search('cyberpunk', all);
    expect(results).toHaveLength(1);
    expect(results[0].steamId).toBe('1091500');
  });

  it('searches by Chinese name', () => {
    const all = repo.list();
    const results = repo.search('星露', all);
    expect(results).toHaveLength(1);
    expect(results[0].steamId).toBe('413150');
  });

  it('returns empty for non-matching search', () => {
    const all = repo.list();
    expect(repo.search('nonexistent', all)).toHaveLength(0);
  });

  it('paginates with cursor', () => {
    const all = repo.list();
    const page1 = repo.paginate(all, 3, null);
    expect(page1.items).toHaveLength(3);
    expect(page1.hasNextPage).toBe(true);
    expect(page1.nextCursor).toBe('3');

    const page2 = repo.paginate(all, 3, '3');
    expect(page2.items).toHaveLength(3);
    expect(page2.hasNextPage).toBe(true);

    const page3 = repo.paginate(all, 3, '6');
    expect(page3.items).toHaveLength(1);
    expect(page3.hasNextPage).toBe(false);
    expect(page3.nextCursor).toBeNull();
  });

  it('finds detail by steamId', () => {
    const game = repo.findById('570');
    expect(game).toBeDefined();
    expect(game?.nameEn).toBe('Dota 2');
  });

  it('returns undefined for unknown steamId', () => {
    expect(repo.findById('999999')).toBeUndefined();
  });

  it('inserts a new AppID', () => {
    const newGame = {
      ...mockGameRecords[0],
      steamId: '999999',
      nameEn: 'New Game',
    };
    repo.upsert(newGame);

    expect(repo.findById('999999')).toBeDefined();
    expect(repo.list()).toHaveLength(8);
  });

  it('overwrites and updates lastSyncedAt for duplicate AppID', () => {
    const existingMaybe = repo.findById('570');
    expect(existingMaybe).toBeDefined();
    if (!existingMaybe) {
      throw new Error('expected seeded game 570');
    }
    const existing = existingMaybe;
    const oldSyncedAt = existing.lastSyncedAt;

    const updated = { ...existing, nameEn: 'Dota 2 Updated' };
    repo.upsert(updated);

    const storedMaybe = repo.findById('570');
    expect(storedMaybe).toBeDefined();
    if (!storedMaybe) {
      throw new Error('expected game 570 after upsert');
    }
    const stored = storedMaybe;
    expect(stored.nameEn).toBe('Dota 2 Updated');
    expect(stored.lastSyncedAt).not.toBe(oldSyncedAt);
    expect(repo.list()).toHaveLength(7);
  });
});
