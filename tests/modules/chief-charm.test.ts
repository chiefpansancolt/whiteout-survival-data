import { chiefCharm, ChiefCharmLevelQuery } from '@/modules/chief-charm';
import { items } from '@/modules/items';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('chiefCharm', () => chiefCharm());

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
});
