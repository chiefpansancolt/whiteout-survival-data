import { items } from '@/modules/items';
import { PetQuery, pets } from '@/modules/pets';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('pets', () => pets());

describe('PetQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = pets().get().slice(0, 1);
    expect(new PetQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new PetQuery().count()).toBeGreaterThan(0);
  });

  it('byRarity() filters to the given rarity', () => {
    const legendary = pets().byRarity('Legendary');
    expect(legendary.count()).toBe(7);
    expect(legendary.get().every((p) => p.rarity === 'Legendary')).toBe(true);
  });
});

describe('Pet roster', () => {
  it('tracks all 14 pets across 5 rarities', () => {
    expect(pets().count()).toBe(14);
    expect(pets().byRarity('Common').count()).toBe(1);
    expect(pets().byRarity('Uncommon').count()).toBe(2);
    expect(pets().byRarity('Rare').count()).toBe(2);
    expect(pets().byRarity('Epic').count()).toBe(2);
    expect(pets().byRarity('Legendary').count()).toBe(7);
  });

  it('has a levels array exactly as long as maxLevel for every pet', () => {
    expect(
      pets()
        .get()
        .every((p) => p.levels.length === p.maxLevel),
    ).toBe(true);
  });

  it('has a skill tier count equal to maxLevel / 10 for pets of different max levels', () => {
    const caveHyena = pets().findByName('Cave Hyena')!;
    expect(caveHyena.maxLevel).toBe(50);
    expect(caveHyena.skill.values).toHaveLength(5);

    const snowLeopard = pets().findByName('Snow Leopard')!;
    expect(snowLeopard.maxLevel).toBe(80);
    expect(snowLeopard.skill.values).toHaveLength(8);

    const caveLion = pets().findByName('Cave Lion')!;
    expect(caveLion.maxLevel).toBe(100);
    expect(caveLion.skill.values).toHaveLength(10);
  });

  it('has identical Attack/Defense values at every level for every pet', () => {
    expect(
      pets()
        .get()
        .every((p) => p.levels.every((l) => l.troopAttack.value === l.troopDefense.value)),
    ).toBe(true);
  });

  it('gates early pets behind a Furnace level and later pets behind a prerequisite pet', () => {
    const caveHyena = pets().findByName('Cave Hyena')!;
    expect(caveHyena.unlockRequirement.furnaceLevel).toBe(18);
    expect(caveHyena.unlockRequirement.prerequisitePet).toBeUndefined();

    const caveLion = pets().findByName('Cave Lion')!;
    expect(caveLion.unlockRequirement.prerequisitePet?.name).toBe('Snow Leopard');
    expect(pets().findByName(caveLion.unlockRequirement.prerequisitePet!.name)).toBeDefined();
  });

  it('falls back the scaling cooldown into values and populates cooldownSecondsByTier for Musk Ox', () => {
    const muskOx = pets().findByName('Musk Ox')!;
    expect(muskOx.skill.cooldownSeconds).toBeUndefined();
    expect(muskOx.skill.cooldownSecondsByTier).toHaveLength(6);
    expect(muskOx.skill.values).toEqual(muskOx.skill.cooldownSecondsByTier);
  });

  it('has a portrait for every pet, including Frost Gorilla and Frostscale Chameleon', () => {
    pets()
      .get()
      .forEach((p) => {
        expect(p.img.length).toBeGreaterThan(0);
      });
  });

  it('resolves every advancementMaterials itemId against a real cataloged item', () => {
    const allMaterialIds = pets()
      .get()
      .flatMap((p) => p.levels)
      .flatMap((l) => l.advancementMaterials ?? [])
      .map((m) => m.itemId);
    expect(allMaterialIds.length).toBeGreaterThan(0);
    expect(allMaterialIds.every((id) => items().find(id) !== undefined)).toBe(true);
  });

  it("uses the real catalog ids for Cave Hyena's Level 50 advancement materials, not raw numeric ids", () => {
    const caveHyena = pets().findByName('Cave Hyena')!;
    const level50 = caveHyena.levels.find((l) => l.level === 50)!;
    expect(level50.advancementMaterials).toEqual([
      { itemId: 'taming-manual', amount: 90 },
      { itemId: 'energizing-potion', amount: 30 },
      { itemId: 'strengthening-serum', amount: 10 },
    ]);
  });
});
