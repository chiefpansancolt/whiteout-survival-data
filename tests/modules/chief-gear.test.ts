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
