import { SkinQuery, skins } from '@/modules/skins';
import { existsSync } from 'fs';
import { join } from 'path';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('skins', () => skins());

describe('SkinQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = skins().get().slice(0, 1);
    expect(new SkinQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new SkinQuery().count()).toBeGreaterThan(0);
  });

  it('bySkinType() filters to the given skin type', () => {
    const avatarFrames = skins().bySkinType('Avatar Frame');
    expect(avatarFrames.count()).toBe(78);
    expect(avatarFrames.get().every((s) => s.skinType === 'Avatar Frame')).toBe(true);
  });
});

describe('Skin catalog', () => {
  it('tracks 223 skins across 8 skin types', () => {
    expect(skins().count()).toBe(223);
    expect(skins().bySkinType('Avatar Frame').count()).toBe(78);
    expect(skins().bySkinType('Chat').count()).toBe(4);
    expect(skins().bySkinType('Nameplate').count()).toBe(21);
    expect(skins().bySkinType('March Skin').count()).toBe(54);
    expect(skins().bySkinType('City Skin').count()).toBe(45);
    expect(skins().bySkinType('Teleport Skin').count()).toBe(6);
    expect(skins().bySkinType('Name Card').count()).toBe(13);
    expect(skins().bySkinType('Chief Profile').count()).toBe(2);
  });

  it('parses a clean Bonus line into a structured stat/value pair', () => {
    const gildedDragonboat = skins().find('gilded-dragonboat')!;
    expect(gildedDragonboat.bonus).toEqual({
      stat: 'Troops Attack',
      statKey: 'troops-attack',
      value: '+2%',
      amount: 2,
      unit: 'percent',
    });
  });

  it('leaves bonus unset for skins with no stat bonus', () => {
    const birthdayAvatarFrame = skins().find('birthday-avatar-frame')!;
    expect(birthdayAvatarFrame.bonus).toBeUndefined();
  });

  it('distinguishes same-named skins across different skin types by id', () => {
    const gardenOfDelightsFrame = skins().find('garden-of-delights-2')!;
    const gardenOfDelightsCard = skins().find('garden-of-delights')!;
    expect(gardenOfDelightsFrame.skinType).toBe('Avatar Frame');
    expect(gardenOfDelightsCard.skinType).toBe('Name Card');
    expect(gardenOfDelightsFrame.name).toBe(gardenOfDelightsCard.name);
  });
});

const nocturnal: [string, string, string, number | undefined][] = [
  ['nocturnal-rider-3', 'Name Card', 'troops-lethality', 1.5],
  ['nocturnal-rider-2', 'Nameplate', '', undefined],
  ['nocturnal-rider', 'Avatar Frame', 'troops-defense', 2],
  ['beyond-midnight', 'March Skin', 'hunting-march-speed', 5],
  ['mystic-waltz', 'City Skin', 'troops-attack', 2],
  ['umbral-laybrinth', 'City Skin', 'troops-attack', 2],
  ['phantom-waltz', 'City Skin', 'troops-attack', 2],
  ['nightmare-mansion', 'City Skin', 'troops-attack', 2],
];
const nocturnalIds = nocturnal.map((s) => s[0]);

describe('Skins from the Halloween Special Event', () => {
  it.each(nocturnal)('has %s with its type and stat', (id, skinType, statKey, amount) => {
    const skin = skins().find(id)!;
    expect(skin.skinType).toBe(skinType);
    expect(skin.bonus?.statKey ?? '').toBe(statKey);
    expect(skin.bonus?.amount).toBe(amount);
    expect(skin.sources).toEqual(['Halloween Special Event']);
    expect(skin.description).toContain(`[${skin.name}`);
  });
});

describe('Skins with the stat and source stated by the package owner', () => {
  const stated: [string, string, string, number | undefined, string[]][] = [
    [
      'dancing-frostglow',
      'Teleport Skin',
      'troops-lethality',
      2,
      ['Special Events', 'Frozen Supreme Bonus'],
    ],
    ['moon-bloom-name-card', 'Name Card', 'troops-lethality', 1.5, ['Special Events']],
    ['froststar-radiance-name-card', 'Name Card', 'troops-lethality', 1.5, ['Frost Star Shop']],
    ['metal-storm', 'March Skin', 'hunting-march-speed', 5, ['Special Events']],
    ['fungal-sprite', 'March Skin', 'hunting-march-speed', 5, ['Skin Shop']],
    ['dribble-wild', 'March Skin', 'hunting-march-speed', 5, ['Special Events']],
    ['pixel-jet', 'March Skin', 'hunting-march-speed', 5, ['Special Events']],
    ['sky-strider', 'March Skin', 'hunting-march-speed', 5, ['Special Events']],
    ['celestial-wonders', 'City Skin', 'troops-attack', 2, ['Special Events']],
    ['helios-outpost', 'City Skin', '', undefined, ['Special Events']],
    ['wave-raider', 'City Skin', 'troops-attack', 2, ['Fishing Tournament']],
    ['mushroom-haven', 'City Skin', 'troops-attack', 2, ['Skin Shop']],
    [
      'adventurous-trip',
      'Avatar Frame',
      'troops-defense',
      1.5,
      ['Special Events', 'Adventure Caravan'],
    ],
    ['blooming-starlight', 'Avatar Frame', 'troops-defense', 2, ['Special Events']],
    ['primal-vibe', 'Avatar Frame', 'troops-defense', 2, ['Special Events']],
    ['crystal-starlight', 'Avatar Frame', 'troops-defense', 2, ['Special Events']],
    ['joyous-surge', 'Avatar Frame', 'troops-defense', 2, ['Special Events']],
    ['goal-time', 'Avatar Frame', 'troops-defense', 2, ['Special Events']],
    ['bodkins-crowns', 'Avatar Frame', 'troops-defense', 2, ['Special Events']],
    ['moon-bloom', 'Avatar Frame', 'troops-defense', 2, ['Special Events']],
    ['frigid-night', 'Chat', 'troops-health', 1.5, ['Special Events', 'Frozen Radiance Bonus']],
    ['starburst-sky', 'Chat', 'troops-health', 1.5, ['Special Events']],
    ['ocean-exploration', 'Chat', 'troops-health', 1.5, ['Fishing Tournament']],
    ['safe-haven', 'Chat', 'troops-health', 1.5, ['Special Events']],
  ];

  it.each(stated)(
    'has %s with its type, stat, and sources',
    (id, skinType, statKey, amount, sources) => {
      const skin = skins().find(id)!;
      expect(skin.skinType).toBe(skinType);
      expect(skin.bonus?.statKey ?? '').toBe(statKey);
      expect(skin.bonus?.amount).toBe(amount);
      expect(skin.bonus?.unit ?? 'percent').toBe('percent');
      expect(skin.sources).toEqual(sources);
      expect(skin.description).toContain(`[${skin.name}`);
    },
  );

  it('has no icon for the 32 new skins and an icon file for every other skin', () => {
    const withoutImg = skins()
      .get()
      .filter((s) => s.img === undefined);
    expect(withoutImg.map((s) => s.id).sort()).toEqual(
      [...stated.map((s) => s[0]), ...nocturnalIds].sort(),
    );
    for (const skin of skins()
      .get()
      .filter((s) => s.img !== undefined)) {
      expect(existsSync(join(__dirname, '../..', skin.img!))).toBe(true);
    }
  });

  it('keeps the id and icon of the two renamed March Skins', () => {
    const adventurer = skins().find('tundra-adventure')!;
    expect(adventurer.name).toBe('Tundra Adventurer');
    expect(adventurer.img).toBe('/images/skins/tundra-adventure.png');
    expect(adventurer.description).toContain('[Tundra Adventurer March Skin]');
    expect(adventurer.description).toContain('during the Tundra Adventure event');
    const wings = skins().find('wing-of-the-icy-wind')!;
    expect(wings.name).toBe('Wings of the Icy Wind');
    expect(wings.description).toContain('[Wings of the Icy Wind March Skin]');
    expect(skins().findByName('Tundra Adventure')).toBeUndefined();
    expect(skins().findByName('Wing of the Icy Wind')).toBeUndefined();
  });
});
