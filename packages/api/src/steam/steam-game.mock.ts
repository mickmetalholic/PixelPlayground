import type {
  SteamGameDetail,
  SteamSupportedLanguage,
} from './steam-game.types';

type LanguageCapabilities = Omit<SteamSupportedLanguage, 'name'>;

function steamUrl(appId: string): string {
  return `https://store.steampowered.com/app/${appId}`;
}

function capsule(appId: string): string {
  return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/capsule_184x69.jpg`;
}

function header(appId: string): string {
  return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;
}

function screenshot(appId: string, index: number): string {
  const assets = ['library_hero.jpg', 'capsule_616x353.jpg', 'header.jpg'];
  const asset = assets[index] ?? assets[0];
  return `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/${asset}`;
}

function supportedLanguages(
  names: string[],
  capabilities: LanguageCapabilities,
): SteamSupportedLanguage[] {
  return names.map((name) => ({ name, ...capabilities }));
}

const interfaceAudioSubtitles = {
  interface: true,
  fullAudio: true,
  subtitles: true,
};

const interfaceSubtitles = {
  interface: true,
  fullAudio: false,
  subtitles: true,
};

const interfaceAudio = {
  interface: true,
  fullAudio: true,
  subtitles: false,
};

export const mockGameRecords: SteamGameDetail[] = [
  {
    steamId: '1091500',
    nameEn: 'Cyberpunk 2077',
    nameZh: '赛博朋克 2077',
    capsuleImage: capsule('1091500'),
    headerImage: header('1091500'),
    releaseDate: '2020-12-10',
    developers: ['CD PROJEKT RED'],
    publishers: ['CD PROJEKT RED'],
    genres: ['RPG', 'Open World', 'Action'],
    isFree: false,
    priceOverview: {
      currency: 'USD',
      initial: 5999,
      final: 2999,
      discountPercent: 50,
      finalFormatted: '$29.99',
    },
    platforms: { windows: true, mac: false, linux: false },
    metadataStatus: 'ready',
    sourceLanguageFallback: false,
    shortDescription:
      'Cyberpunk 2077 is an open-world, action-adventure RPG set in the megalopolis of Night City, where you play as a cyber-enhanced mercenary.',
    detailedDescription:
      "Cyberpunk 2077 is an open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification. You play as V, a mercenary outlaw going after a one-of-a-kind implant that is the key to immortality. You can customize your character's cyberware, skillset and playstyle, and explore the vast city where the choices you make shape the story and the world around you.",
    categories: [
      'Single-player',
      'Steam Achievements',
      'Full controller support',
    ],
    supportedLanguages: supportedLanguages(
      [
        'English',
        'French',
        'Italian',
        'German',
        'Spanish - Spain',
        'Japanese',
        'Polish',
        'Portuguese - Brazil',
        'Russian',
        'Chinese - Simplified',
        'Korean',
      ],
      interfaceAudioSubtitles,
    ),
    recommendations: 780483,
    screenshots: [
      screenshot('1091500', 0),
      screenshot('1091500', 1),
      screenshot('1091500', 2),
    ],
    storeUrl: steamUrl('1091500'),
    lastSyncedAt: '2026-05-03T00:00:00Z',
  },
  {
    steamId: '570',
    nameEn: 'Dota 2',
    nameZh: '刀塔 2',
    capsuleImage: capsule('570'),
    headerImage: header('570'),
    releaseDate: '2013-07-09',
    developers: ['Valve'],
    publishers: ['Valve'],
    genres: ['MOBA', 'Strategy', 'Action', 'Free to Play'],
    isFree: true,
    priceOverview: null,
    platforms: { windows: true, mac: true, linux: true },
    metadataStatus: 'ready',
    sourceLanguageFallback: false,
    shortDescription:
      'Every day, millions of players worldwide enter the battle of the Ancients. Dota 2 is the deepest multi-player action RTS game ever made.',
    detailedDescription:
      'Dota 2 is a competitive game of action and strategy, played professionally by millions of players worldwide. Choose from over 120 heroes to form two teams of five and battle through unique phases, objectives, and ever-evolving strategies. The game is constantly updated with new content, seasonal events, and a massive esports ecosystem.',
    categories: [
      'Multi-player',
      'Online PvP',
      'Steam Trading Cards',
      'In-App Purchases',
    ],
    supportedLanguages: supportedLanguages(
      [
        'English',
        'French',
        'Italian',
        'German',
        'Spanish - Spain',
        'Chinese - Simplified',
        'Chinese - Traditional',
        'Korean',
        'Russian',
        'Portuguese - Brazil',
      ],
      interfaceAudioSubtitles,
    ),
    recommendations: 1980342,
    screenshots: [
      screenshot('570', 0),
      screenshot('570', 1),
      screenshot('570', 2),
    ],
    storeUrl: steamUrl('570'),
    lastSyncedAt: '2026-05-03T00:00:00Z',
  },
  {
    steamId: '578080',
    nameEn: 'PUBG: BATTLEGROUNDS',
    nameZh: '绝地求生',
    capsuleImage: capsule('578080'),
    headerImage: header('578080'),
    releaseDate: '2017-12-21',
    developers: ['KRAFTON, Inc.'],
    publishers: ['KRAFTON, Inc.'],
    genres: ['Battle Royale', 'Action', 'Shooter', 'Multi-player'],
    isFree: true,
    priceOverview: null,
    platforms: { windows: true, mac: false, linux: false },
    metadataStatus: 'ready',
    sourceLanguageFallback: false,
    shortDescription:
      'Play PUBG: BATTLEGROUNDS for free. Land on strategic locations, loot weapons and supplies, and survive to become the last team standing.',
    detailedDescription:
      'PUBG: BATTLEGROUNDS is a battle royale shooter where up to 100 players parachute onto a remote island and fight to be the last player or team standing. Players must locate and scavenge their own weapons, vehicles, and supplies in an ever-shrinking play area. Experience the thrill of intense firefights, strategic positioning, and the constant tension of survival in this genre-defining game.',
    categories: [
      'Multi-player',
      'Online PvP',
      'In-App Purchases',
      'Steam Achievements',
    ],
    supportedLanguages: supportedLanguages(
      [
        'English',
        'French',
        'German',
        'Spanish - Spain',
        'Japanese',
        'Korean',
        'Chinese - Simplified',
        'Chinese - Traditional',
        'Russian',
        'Arabic',
        'Turkish',
      ],
      interfaceSubtitles,
    ),
    recommendations: 1900000,
    screenshots: [
      screenshot('578080', 0),
      screenshot('578080', 1),
      screenshot('578080', 2),
    ],
    storeUrl: steamUrl('578080'),
    lastSyncedAt: '2026-05-03T00:00:00Z',
  },
  {
    steamId: '2868840',
    nameEn: 'Content Warning',
    nameZh: '内容警告',
    capsuleImage: capsule('2868840'),
    headerImage: header('2868840'),
    releaseDate: '2024-04-01',
    developers: ['Skog, Zorro, Wilnyl, Philip, thePetHen'],
    publishers: ['Landfall Publishing'],
    genres: ['Co-op', 'Horror', 'Comedy', 'Multi-player'],
    isFree: false,
    priceOverview: {
      currency: 'USD',
      initial: 499,
      final: 499,
      discountPercent: 0,
      finalFormatted: '$4.99',
    },
    platforms: { windows: true, mac: false, linux: false },
    metadataStatus: 'ready',
    sourceLanguageFallback: false,
    shortDescription:
      "Film your friends getting scared. Get famous. Become rich. A co-op horror comedy game where you record your friends' terror and post it online.",
    detailedDescription:
      'Content Warning is a co-op horror comedy game where you and your friends film scary content to go viral on the internet. Dive into the eerie world beneath your quaint village, capture your friends getting absolutely terrified, and post the footage online. The more views you get, the more famous you become. Buy better filming equipment, explore deeper into the unknown, and keep your channel alive.',
    categories: ['Multi-player', 'Co-op', 'Online Co-op', 'Steam Achievements'],
    supportedLanguages: supportedLanguages(
      [
        'English',
        'French',
        'German',
        'Spanish - Spain',
        'Japanese',
        'Chinese - Simplified',
        'Korean',
        'Russian',
      ],
      interfaceSubtitles,
    ),
    recommendations: 127894,
    screenshots: [
      screenshot('2868840', 0),
      screenshot('2868840', 1),
      screenshot('2868840', 2),
    ],
    storeUrl: steamUrl('2868840'),
    lastSyncedAt: '2026-05-03T00:00:00Z',
  },
  {
    steamId: '2507950',
    nameEn: 'Manor Lords',
    nameZh: '庄园领主',
    capsuleImage: capsule('2507950'),
    headerImage: header('2507950'),
    releaseDate: '2024-04-26',
    developers: ['Slavic Magic'],
    publishers: ['Hooded Horse'],
    genres: ['Strategy', 'City Builder', 'Simulation', 'Medieval'],
    isFree: false,
    priceOverview: {
      currency: 'USD',
      initial: 3999,
      final: 3599,
      discountPercent: 10,
      finalFormatted: '$35.99',
    },
    platforms: { windows: true, mac: false, linux: false },
    metadataStatus: 'ready',
    sourceLanguageFallback: false,
    shortDescription:
      'A medieval strategy game with in-depth city building, large-scale tactical battles, and complex economic and social simulations.',
    detailedDescription:
      'Manor Lords is a medieval strategy game featuring deep city building, large-scale tactical battles, and complex economic and social simulations. Rule your lands as a medieval lord - grow your settlement, manage resources, and wage war. The game combines gridless city building with realistic medieval town growth, where the prosperity of your people determines your military strength and expansion capabilities.',
    categories: ['Single-player', 'Steam Achievements', 'Steam Cloud'],
    supportedLanguages: supportedLanguages(
      [
        'English',
        'French',
        'German',
        'Spanish - Spain',
        'Chinese - Simplified',
        'Japanese',
        'Korean',
        'Russian',
        'Turkish',
      ],
      interfaceSubtitles,
    ),
    recommendations: 98934,
    screenshots: [
      screenshot('2507950', 0),
      screenshot('2507950', 1),
      screenshot('2507950', 2),
    ],
    storeUrl: steamUrl('2507950'),
    lastSyncedAt: '2026-05-03T00:00:00Z',
  },
  {
    steamId: '271590',
    nameEn: 'Grand Theft Auto V',
    nameZh: '侠盗猎车手 V',
    capsuleImage: capsule('271590'),
    headerImage: header('271590'),
    releaseDate: '2015-04-14',
    developers: ['Rockstar North'],
    publishers: ['Rockstar Games'],
    genres: ['Action', 'Open World', 'Adventure'],
    isFree: false,
    priceOverview: {
      currency: 'USD',
      initial: 2999,
      final: 1499,
      discountPercent: 50,
      finalFormatted: '$14.99',
    },
    platforms: { windows: true, mac: false, linux: false },
    metadataStatus: 'ready',
    sourceLanguageFallback: false,
    shortDescription:
      'Grand Theft Auto V for PC offers players the option to explore the massive world of Los Santos and Blaine County.',
    detailedDescription:
      'Grand Theft Auto V for PC offers players the option to explore the award-winning world of Los Santos and Blaine County in resolutions up to 4k and beyond, as well as the chance to experience the game running at 60 frames per second. The game features three unique protagonists - Michael, Franklin, and Trevor - and a sprawling open world where heists, side missions, and countless activities await.',
    categories: [
      'Single-player',
      'Multi-player',
      'Steam Achievements',
      'Full controller support',
    ],
    supportedLanguages: supportedLanguages(
      [
        'English',
        'French',
        'Italian',
        'German',
        'Spanish - Spain',
        'Japanese',
        'Korean',
        'Russian',
        'Chinese - Simplified',
        'Chinese - Traditional',
      ],
      interfaceSubtitles,
    ),
    recommendations: 1642341,
    screenshots: [
      screenshot('271590', 0),
      screenshot('271590', 1),
      screenshot('271590', 2),
    ],
    storeUrl: steamUrl('271590'),
    lastSyncedAt: '2026-05-03T00:00:00Z',
  },
  {
    steamId: '413150',
    nameEn: 'Stardew Valley',
    nameZh: '星露谷物语',
    capsuleImage: capsule('413150'),
    headerImage: header('413150'),
    releaseDate: '2016-02-27',
    developers: ['ConcernedApe'],
    publishers: ['ConcernedApe'],
    genres: ['RPG', 'Simulation', 'Farming', 'Indie'],
    isFree: false,
    priceOverview: {
      currency: 'USD',
      initial: 1499,
      final: 1499,
      discountPercent: 0,
      finalFormatted: '$14.99',
    },
    platforms: { windows: true, mac: true, linux: true },
    metadataStatus: 'ready',
    sourceLanguageFallback: false,
    shortDescription:
      "You've inherited your grandfather's old farm plot in Stardew Valley. Armed with hand-me-down tools, you set out to begin your new life.",
    detailedDescription:
      "Stardew Valley is an open-ended country-life RPG where you inherit your grandfather's old farm plot in Stardew Valley. You'll learn to live off the land, raise animals, build relationships with the townsfolk, and uncover the secrets of the valley. With over 50 hours of content, the game offers farming, mining, fishing, foraging, crafting, and social simulation in a charming pixel-art world.",
    categories: [
      'Single-player',
      'Multi-player',
      'Co-op',
      'Steam Achievements',
    ],
    supportedLanguages: supportedLanguages(
      [
        'English',
        'French',
        'German',
        'Spanish - Spain',
        'Japanese',
        'Chinese - Simplified',
        'Korean',
        'Russian',
        'Portuguese - Brazil',
        'Turkish',
      ],
      interfaceAudio,
    ),
    recommendations: 734291,
    screenshots: [
      screenshot('413150', 0),
      screenshot('413150', 1),
      screenshot('413150', 2),
    ],
    storeUrl: steamUrl('413150'),
    lastSyncedAt: '2026-05-03T00:00:00Z',
  },
];

export const mockGames: SteamGameDetail[] = mockGameRecords;

export function getAllGames(): SteamGameDetail[] {
  return mockGames;
}
