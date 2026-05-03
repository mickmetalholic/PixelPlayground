import { SteamMetadataNormalizer } from './steam-metadata.normalizer';

describe('SteamMetadataNormalizer', () => {
  const normalizer = new SteamMetadataNormalizer();

  const validPayload: Record<string, unknown> = {
    type: 'game',
    name: 'Test Game',
    steam_appid: 12345,
    is_free: false,
    short_description: 'A short description.',
    detailed_description: 'A detailed description.',
    supported_languages: 'English<strong>*</strong>, French<strong>*</strong>',
    header_image: 'https://example.com/header.jpg',
    capsule_image: 'https://example.com/capsule.jpg',
    developers: ['Dev1'],
    publishers: ['Pub1'],
    price_overview: {
      currency: 'USD',
      initial: 999,
      final: 499,
      discount_percent: 50,
      final_formatted: '$4.99',
    },
    platforms: { windows: true, mac: false, linux: false },
    categories: [{ id: 1, description: 'Single-player' }],
    genres: [{ id: '1', description: 'Action' }],
    screenshots: [{ id: 0, path_full: 'https://example.com/screenshot.jpg' }],
    release_date: { coming_soon: false, date: '2024-01-15' },
    recommendations: { total: 5000 },
  };

  it('normalizes a successful appdetails payload', () => {
    const result = normalizer.normalize(validPayload, '12345');

    expect(result.steamId).toBe('12345');
    expect(result.nameEn).toBe('Test Game');
    expect(result.isFree).toBe(false);
    expect(result.shortDescription).toBe('A short description.');
    expect(result.developers).toEqual(['Dev1']);
    expect(result.publishers).toEqual(['Pub1']);
    expect(result.genres).toEqual(['Action']);
    expect(result.categories).toEqual(['Single-player']);
    expect(result.priceOverview?.final).toBe(499);
    expect(result.platforms.windows).toBe(true);
    expect(result.platforms.mac).toBe(false);
    expect(result.storeUrl).toBe('https://store.steampowered.com/app/12345');
  });

  it('preserves raw payload in rawSteamData', () => {
    const result = normalizer.normalize(validPayload, '12345');
    expect(result.rawSteamData).toBeDefined();
    expect(result.rawSteamData?.name).toBe('Test Game');
    expect(result.rawSteamData?.steam_appid).toBe(12345);
  });

  it('returns safe fallback values for missing fields', () => {
    const result = normalizer.normalize(
      { type: 'game' } as Record<string, unknown>,
      '99999',
    );

    expect(result.nameEn).toBe('App 99999');
    expect(result.shortDescription).toBe('');
    expect(result.developers).toEqual([]);
    expect(result.genres).toEqual([]);
    expect(result.priceOverview).toBeNull();
    expect(result.recommendations).toBeNull();
    expect(result.screenshots).toEqual([]);
    expect(result.categories).toEqual([]);
    expect(result.platforms).toEqual({
      windows: false,
      mac: false,
      linux: false,
    });
  });

  it('parses language capabilities with audio markers', () => {
    const payload: Record<string, unknown> = {
      ...validPayload,
      supported_languages:
        'English<strong>*</strong>, French, German<strong>*</strong>',
    };
    const result = normalizer.normalize(payload, '12345');

    expect(result.supportedLanguages).toHaveLength(3);
    const english = result.supportedLanguages.find((l) => l.name === 'English');
    expect(english?.fullAudio).toBe(true);
    const french = result.supportedLanguages.find((l) => l.name === 'French');
    expect(french?.fullAudio).toBe(false);
  });

  it('retains raw language string', () => {
    const payload: Record<string, unknown> = {
      ...validPayload,
      supported_languages: 'English<strong>*</strong>, German',
    };
    const result = normalizer.normalize(payload, '12345');
    expect(result.supportedLanguagesRaw).toBe(
      'English<strong>*</strong>, German',
    );
  });
});
