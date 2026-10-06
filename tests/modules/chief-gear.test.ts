import {
  chiefGear,
  chiefGearImage,
  ChiefGearLevelQuery,
  chiefGearRarity,
  ChiefGearSlotQuery,
  chiefGearSlots,
} from '@/modules/chief-gear';
import { items } from '@/modules/items';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('chiefGearSlots', () => chiefGearSlots());
testQueryBaseContract('chiefGear', () => chiefGear());

describe('ChiefGearSlotQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = chiefGearSlots().get().slice(0, 1);
    expect(new ChiefGearSlotQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new ChiefGearSlotQuery().count()).toBeGreaterThan(0);
  });

  it('byTroopType() filters to the given troop type', () => {
    const lancerSlots = chiefGearSlots().byTroopType('Lancer');
    expect(lancerSlots.count()).toBe(2);
    expect(lancerSlots.get().every((s) => s.troopType === 'Lancer')).toBe(true);
  });
});

describe('ChiefGearLevelQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = chiefGear().get().slice(0, 1);
    expect(new ChiefGearLevelQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new ChiefGearLevelQuery().count()).toBeGreaterThan(0);
  });

  it('byTier() filters to the given tier', () => {
    const common = chiefGear().byTier('Common');
    expect(common.count()).toBe(2);
    expect(common.get().every((l) => l.tier === 'Common')).toBe(true);
  });
});

describe('Chief Gear system', () => {
  it('has 6 equip slots paired into 3 troop-type bonuses', () => {
    expect(chiefGearSlots().count()).toBe(6);
    expect(chiefGearSlots().byTroopType('Lancer').count()).toBe(2);
    expect(chiefGearSlots().byTroopType('Infantry').count()).toBe(2);
    expect(chiefGearSlots().byTroopType('Marksman').count()).toBe(2);
  });

  it('has 150 rows in the shared upgrade table', () => {
    expect(chiefGear().count()).toBe(150);
  });

  it('leaves troopsDeploymentCapacity unset until it is unlocked partway through the table', () => {
    const commonStar0 = chiefGear().find('common-star-0')!;
    expect(commonStar0.troopsDeploymentCapacity).toBeUndefined();

    const mythicT2Star3Stage1 = chiefGear().find('mythic-t2-star-3-stage-1')!;
    expect(mythicT2Star3Stage1.troopsDeploymentCapacity).toBe(10);
  });

  it('resolves every material itemId against a real cataloged item', () => {
    const allMaterialIds = chiefGear()
      .get()
      .flatMap((l) => l.materials.map((m) => m.itemId));
    expect(allMaterialIds.length).toBeGreaterThan(0);
    expect(allMaterialIds.every((id) => items().find(id) !== undefined)).toBe(true);
  });

  it('gives every slot one icon per rarity', () => {
    chiefGearSlots()
      .get()
      .forEach((slot) => {
        (['Common', 'Rare', 'Epic', 'Mythic', 'Legendary'] as const).forEach((rarity) => {
          expect(slot.images[rarity]).toMatch(
            new RegExp(`/images/chief-gear/${slot.name}-${rarity}\\.png$`),
          );
        });
      });
  });

  it('chiefGearRarity() strips a "T" sub-tier suffix down to the base rarity', () => {
    expect(chiefGearRarity('Common')).toBe('Common');
    expect(chiefGearRarity('Epic')).toBe('Epic');
    expect(chiefGearRarity('EpicT1')).toBe('Epic');
    expect(chiefGearRarity('MythicT2')).toBe('Mythic');
    expect(chiefGearRarity('LegendaryT6')).toBe('Legendary');
  });

  it('chiefGearImage() resolves a level to its slot icon by rarity, sharing one icon across all Legendary sub-tiers', () => {
    const cap = chiefGearSlots().find('cap')!;
    const legendary = chiefGear().byTier('Legendary').first()!;
    const legendaryT6 = chiefGear().find('legendary-t6-star-3-stage-0')!;
    expect(legendaryT6.tier).toBe('LegendaryT6');
    expect(chiefGearImage(cap, legendary)).toBe(cap.images.Legendary);
    expect(chiefGearImage(cap, legendaryT6)).toBe(cap.images.Legendary);
  });
});

describe('gear score', () => {
  const byId = (id: string) => chiefGear().find(id)!;

  it('gives every row a score', () => {
    expect(
      chiefGear()
        .get()
        .every((l) => l.score > 0),
    ).toBe(true);
  });

  it('has the score of each early level from the wiki and WoS Tools', () => {
    expect(
      chiefGear()
        .get()
        .slice(0, 8)
        .map((l) => l.score),
    ).toEqual([1125, 1875, 3000, 4500, 5100, 5440, 3230, 3230]);
  });

  it('splits the score of a level evenly over the steps that lead to it', () => {
    expect(byId('legendary-star-0-stage-1').score).toBe(2390);
    expect(byId('legendary-star-0-stage-2').score).toBe(2390);
    expect(byId('legendary-star-0-stage-3').score).toBe(2390);
    expect(byId('legendary-star-0-stage-0').score).toBe(2390);
    expect(byId('legendary-star-1-stage-0').score).toBe(2390);
  });

  it('adds the steps that lead to each level up to the score of that level', () => {
    const levels = chiefGear().get();
    const levelScores = new Map<string, number>([
      ['common-star-0', 1125],
      ['legendary-star-0-stage-0', 9560],
      ['legendary-star-3-stage-0', 9560],
      ['legendary-t4-star-0-stage-0', 15560],
      ['legendary-t4-star-1-stage-0', 15400],
      ['legendary-t6-star-3-stage-0', 15390],
    ]);
    const start = (id: string) => {
      const end = levels.findIndex((l) => l.id === id);
      let first = end;
      while (first > 0 && levels[first - 1].stage > 0) first--;
      return levels.slice(first, end + 1).reduce((sum, l) => sum + l.score, 0);
    };
    levelScores.forEach((score, id) => expect(start(id)).toBe(score));
  });

  it('adds up to 461,880 over all steps', () => {
    expect(
      chiefGear()
        .get()
        .reduce((sum, l) => sum + l.score, 0),
    ).toBe(461880);
  });
});
