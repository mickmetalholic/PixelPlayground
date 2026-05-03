import { describe, expect, it } from 'vitest';
import { mockGames } from './steam-game.mock.ts';

describe('mockGameRecords', () => {
  it('contains all 7 expected app IDs', () => {
    const ids = mockGames.map((g) => g.steamId).sort();
    expect(ids).toEqual([
      '1091500',
      '2507950',
      '271590',
      '2868840',
      '413150',
      '570',
      '578080',
    ]);
  });

  it('every game has non-empty nameZh', () => {
    for (const game of mockGames) {
      expect(game.nameZh).toBeTruthy();
    }
  });

  it('every game has capsuleImage and headerImage', () => {
    for (const game of mockGames) {
      expect(game.capsuleImage).toBeTruthy();
      expect(game.headerImage).toBeTruthy();
    }
  });

  it('free games have null priceOverview, paid games have priceOverview', () => {
    for (const game of mockGames) {
      if (game.isFree) {
        expect(game.priceOverview).toBeNull();
      } else {
        expect(game.priceOverview).not.toBeNull();
        expect(game.priceOverview?.finalFormatted).toBeTruthy();
      }
    }
  });

  it('every game has short and detailed description', () => {
    for (const game of mockGames) {
      expect(game.shortDescription).toBeTruthy();
      expect(game.detailedDescription).toBeTruthy();
    }
  });

  it('every game has structured supported language capabilities', () => {
    for (const game of mockGames) {
      expect(game.supportedLanguages.length).toBeGreaterThan(0);
      for (const language of game.supportedLanguages) {
        expect(language.name).toBeTruthy();
        expect(typeof language.interface).toBe('boolean');
        expect(typeof language.fullAudio).toBe('boolean');
        expect(typeof language.subtitles).toBe('boolean');
      }
    }
  });
});
