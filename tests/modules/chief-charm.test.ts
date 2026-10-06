import {
  chiefCharm,
  chiefCharmImage,
  ChiefCharmLevelQuery,
  ChiefCharmSlotQuery,
  chiefCharmSlots,
} from '@/modules/chief-charm';
import { events } from '@/modules/events';
import { items } from '@/modules/items';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('chiefCharm', () => chiefCharm());
testQueryBaseContract('chiefCharmSlots', () => chiefCharmSlots());

describe('ChiefCharmSlotQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = chiefCharmSlots().get().slice(0, 1);
    expect(new ChiefCharmSlotQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new ChiefCharmSlotQuery().count()).toBeGreaterThan(0);
  });

  it('byTroopType() filters to the given troop type', () => {
    const infantry = chiefCharmSlots().byTroopType('Infantry');
    expect(infantry.count()).toBe(1);
    expect(infantry.first()!.name).toBe('Infantry');
  });
});

describe('ChiefCharmLevelQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = chiefCharm().get().slice(0, 1);
    expect(new ChiefCharmLevelQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new ChiefCharmLevelQuery().count()).toBeGreaterThan(0);
  });

  it('byLevel() filters to the given charm level', () => {
    const level11 = chiefCharm().byLevel(11);
    expect(level11.count()).toBe(5);
    expect(level11.get().every((l) => l.level === 11)).toBe(true);
  });
});

describe('Chief Charm system', () => {
  it('has 75 rows in the shared upgrade table', () => {
    expect(chiefCharm().count()).toBe(75);
  });

  it('resolves every material itemId against a real cataloged item', () => {
    const allMaterialIds = chiefCharm()
      .get()
      .flatMap((l) => l.materials.map((m) => m.itemId));
    expect(allMaterialIds.length).toBeGreaterThan(0);
    expect(allMaterialIds.every((id) => items().find(id) !== undefined)).toBe(true);
  });

  it('introduces Charm Secrets as a third material only from level 11 stage 1 onward', () => {
    const level1 = chiefCharm().find('level-1')!;
    expect(level1.materials.map((m) => m.itemId)).toEqual(['charm-guide', 'charm-design']);

    const level11Stage1 = chiefCharm().find('level-11-stage-1')!;
    expect(level11Stage1.materials.map((m) => m.itemId)).toEqual([
      'charm-guide',
      'charm-design',
      'charm-secrets',
    ]);
  });

  it('has 3 troop-type slots, one icon per level 1-18', () => {
    expect(chiefCharmSlots().count()).toBe(3);
    chiefCharmSlots()
      .get()
      .forEach((slot) => {
        expect(slot.images).toHaveLength(18);
        slot.images.forEach((img, index) => {
          expect(img).toBe(`/images/chief-charm/${slot.name}-${index + 1}.png`);
        });
      });
  });

  it('chiefCharmImage() resolves a slot to its icon for a given level', () => {
    const infantry = chiefCharmSlots().byTroopType('Infantry').first()!;
    expect(chiefCharmImage(infantry, 1)).toBe('/images/chief-charm/Infantry-1.png');
    expect(chiefCharmImage(infantry, 18)).toBe('/images/chief-charm/Infantry-18.png');
  });
});

describe('charm score', () => {
  const MAIN_LEVEL_SCORES = [
    625, 1250, 3125, 8750, 11250, 12500, 12500, 13000, 14000, 15000, 16000, 17000, 18000, 19000,
    20000, 21000, 22500, 24300,
  ];

  it('gives every entry a score', () => {
    const levels = chiefCharm().get();
    expect(levels).toHaveLength(75);
    levels.forEach((l) => expect(l.score).toBeGreaterThan(0));
  });

  it('adds the steps that lead to each level up to the score of that level', () => {
    let index = 0;
    MAIN_LEVEL_SCORES.forEach((score, i) => {
      const steps = i + 1 <= 4 ? 1 : i + 1 <= 11 ? 4 : i + 1 <= 16 ? 5 : 9;
      const group = chiefCharm()
        .get()
        .slice(index, index + steps);
      expect(group.reduce((sum, l) => sum + l.score, 0)).toBe(score);
      expect(group[steps - 1].level).toBe(i + 1);
      expect(group[steps - 1].stage).toBe(0);
      index += steps;
    });
    expect(index).toBe(75);
  });

  it('splits the score of a level evenly with the remainder on the first steps', () => {
    const level5 = chiefCharm()
      .get()
      .filter(
        (l) =>
          l.id === 'level-4-stage-1' ||
          l.id === 'level-4-stage-2' ||
          l.id === 'level-4-stage-3' ||
          l.id === 'level-5-stage-0',
      )
      .map((l) => l.score);
    expect(level5).toEqual([2813, 2813, 2812, 2812]);
  });

  it('adds up to 249,800 over all steps', () => {
    expect(
      chiefCharm()
        .get()
        .reduce((sum, l) => sum + l.score, 0),
    ).toBe(249800);
  });

  it('matches the main level scores in the King of Icefield note from the wiki', () => {
    const note = events().find('king-of-icefield')!.days![3].note!;
    const wiki = [
      ...note.split('Chief Charm score for each level up:')[1].matchAll(/Lv\. \d+ ([\d,]+)/g),
    ].map((m) => Number(m[1].replace(/,/g, '')));
    expect(wiki).toEqual(MAIN_LEVEL_SCORES.slice(0, 16));
  });
});
