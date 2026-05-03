import { Injectable } from '@nestjs/common';
import type {
  SteamGameDetail,
  SteamMovie,
  SteamPackageGroup,
  SteamPriceOverview,
  SteamRequirements,
  SteamSupportedLanguage,
} from '@pixel-playground/api';

function parsePriceOverview(raw: unknown): SteamPriceOverview | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.currency !== 'string' || typeof r.final !== 'number')
    return null;
  return {
    currency: r.currency,
    initial: typeof r.initial === 'number' ? r.initial : r.final,
    final: r.final,
    discountPercent:
      typeof r.discount_percent === 'number' ? r.discount_percent : 0,
    finalFormatted:
      typeof r.final_formatted === 'string'
        ? r.final_formatted
        : String(r.final),
  };
}

function parsePlatforms(raw: unknown): {
  windows: boolean;
  mac: boolean;
  linux: boolean;
} {
  if (!raw || typeof raw !== 'object')
    return { windows: false, mac: false, linux: false };
  const r = raw as Record<string, unknown>;
  return {
    windows: r.windows === true,
    mac: r.mac === true,
    linux: r.linux === true,
  };
}

function parseRequirements(raw: unknown): SteamRequirements | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const minimum = typeof r.minimum === 'string' ? r.minimum : '';
  const recommended = typeof r.recommended === 'string' ? r.recommended : '';
  if (!minimum && !recommended) return null;
  return { minimum, recommended };
}

function parseStrings(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((s): s is string => typeof s === 'string');
}

function parseCategories(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (c): c is Record<string, unknown> => typeof c === 'object' && c !== null,
    )
    .map((c) => String(c.description ?? ''))
    .filter(Boolean);
}

function parseGenres(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (g): g is Record<string, unknown> => typeof g === 'object' && g !== null,
    )
    .map((g) => String(g.description ?? ''))
    .filter(Boolean);
}

function parseScreenshots(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (s): s is Record<string, unknown> => typeof s === 'object' && s !== null,
    )
    .map((s) => (typeof s.path_full === 'string' ? s.path_full : ''))
    .filter(Boolean);
}

function parseMovies(raw: unknown): SteamMovie[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m): m is Record<string, unknown> => typeof m === 'object' && m !== null,
    )
    .map((m) => ({
      id: typeof m.id === 'number' ? m.id : 0,
      name: typeof m.name === 'string' ? m.name : '',
      thumbnail: typeof m.thumbnail === 'string' ? m.thumbnail : '',
      webm: parseMovieFormat(m.webm),
      mp4: parseMovieFormat(m.mp4),
    }));
}

function parseMovieFormat(raw: unknown): { max: string; '480': string } {
  if (!raw || typeof raw !== 'object') return { max: '', '480': '' };
  const r = raw as Record<string, unknown>;
  return {
    max: typeof r.max === 'string' ? r.max : '',
    '480': typeof r['480'] === 'string' ? r['480'] : '',
  };
}

function parseReleaseDate(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return '';
  const r = raw as Record<string, unknown>;
  return typeof r.date === 'string' ? r.date : '';
}

function parseRecommendations(raw: unknown): number | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.total === 'number') return r.total;
  return null;
}

function parseSupportedLanguages(raw: unknown): {
  languages: SteamSupportedLanguage[];
  rawString: string | undefined;
} {
  if (typeof raw !== 'string') return { languages: [], rawString: undefined };

  const rawString = raw;

  // Steam format: "English<strong>*</strong>, French<strong>*</strong>, German<strong>*</strong>"
  // Replace audio marker before stripping, then derive clean name
  const marked = raw.replace(/<strong>\*<\/strong>/g, '{audio}');
  const fragments = marked
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const languages: SteamSupportedLanguage[] = fragments.map((fragment) => {
    const hasAudio = fragment.includes('{audio}');
    const name = fragment
      .replace(/\{audio\}/g, '')
      .replace(/<[^>]*>/g, '')
      .trim();
    return {
      name,
      interface: true,
      fullAudio: hasAudio,
      subtitles: true,
    };
  });

  return { languages, rawString };
}

@Injectable()
export class SteamMetadataNormalizer {
  normalize(rawData: Record<string, unknown>, appId: string): SteamGameDetail {
    const name =
      typeof rawData.name === 'string' ? rawData.name : `App ${appId}`;
    const { languages, rawString } = parseSupportedLanguages(
      rawData.supported_languages,
    );

    return {
      steamId: appId,
      nameEn: name,
      nameZh: name,
      capsuleImage:
        typeof rawData.capsule_image === 'string' ? rawData.capsule_image : '',
      headerImage:
        typeof rawData.header_image === 'string' ? rawData.header_image : '',
      releaseDate: parseReleaseDate(rawData.release_date),
      developers: parseStrings(rawData.developers),
      publishers: parseStrings(rawData.publishers),
      genres: parseGenres(rawData.genres),
      isFree: rawData.is_free === true,
      priceOverview: parsePriceOverview(rawData.price_overview),
      platforms: parsePlatforms(rawData.platforms),
      metadataStatus: 'ready',
      sourceLanguageFallback:
        rawData.type !== 'game' || !rawData.supported_languages,
      lastSyncedAt: new Date().toISOString(),
      shortDescription:
        typeof rawData.short_description === 'string'
          ? rawData.short_description
          : '',
      detailedDescription:
        typeof rawData.detailed_description === 'string'
          ? rawData.detailed_description
          : '',
      categories: parseCategories(rawData.categories),
      supportedLanguages: languages,
      supportedLanguagesRaw: rawString,
      recommendations: parseRecommendations(rawData.recommendations),
      screenshots: parseScreenshots(rawData.screenshots),
      movies: parseMovies(rawData.movies),
      packages: Array.isArray(rawData.packages)
        ? rawData.packages.filter((p): p is number => typeof p === 'number')
        : [],
      packageGroups: parsePackageGroups(rawData.package_groups),
      pcRequirements: parseRequirements(rawData.pc_requirements),
      macRequirements: parseRequirements(rawData.mac_requirements),
      linuxRequirements: parseRequirements(rawData.linux_requirements),
      storeUrl: `https://store.steampowered.com/app/${appId}`,
      rawSteamData: rawData,
    };
  }
}

function parsePackageGroups(raw: unknown): SteamPackageGroup[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (g): g is Record<string, unknown> => typeof g === 'object' && g !== null,
    )
    .map((g) => ({
      name: typeof g.name === 'string' ? g.name : '',
      title: typeof g.title === 'string' ? g.title : '',
      description: typeof g.description === 'string' ? g.description : '',
      selectionText:
        typeof g.selection_text === 'string' ? g.selection_text : '',
      saveText: typeof g.save_text === 'string' ? g.save_text : '',
      displayType: typeof g.display_type === 'number' ? g.display_type : 0,
      isSubscription: g.is_subscription === true,
      subs: Array.isArray(g.subs)
        ? g.subs
            .filter(
              (s): s is Record<string, unknown> =>
                typeof s === 'object' && s !== null,
            )
            .map((s) => ({
              packageid: typeof s.packageid === 'number' ? s.packageid : 0,
              percent_savings_text:
                typeof s.percent_savings_text === 'string'
                  ? s.percent_savings_text
                  : '',
              percent_savings:
                typeof s.percent_savings === 'number' ? s.percent_savings : 0,
              option_text:
                typeof s.option_text === 'string' ? s.option_text : '',
              option_description:
                typeof s.option_description === 'string'
                  ? s.option_description
                  : '',
              can_get_free_license:
                typeof s.can_get_free_license === 'string'
                  ? s.can_get_free_license
                  : '',
              is_free_license: s.is_free_license === true,
              price_in_cents_with_discount:
                typeof s.price_in_cents_with_discount === 'number'
                  ? s.price_in_cents_with_discount
                  : 0,
            }))
        : [],
    }));
}
