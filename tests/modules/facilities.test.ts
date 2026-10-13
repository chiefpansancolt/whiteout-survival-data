import { facilities, FacilityQuery } from '@/modules/facilities';
import { pets } from '@/modules/pets';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('facilities', () => facilities());

describe('FacilityQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = facilities().get().slice(0, 1);
    expect(new FacilityQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new FacilityQuery().count()).toBeGreaterThan(0);
  });

  it('tracks all 9 descriptive facilities', () => {
    expect(facilities().count()).toBe(9);
  });

  it('has a non-empty description for every facility', () => {
    expect(
      facilities()
        .get()
        .every((f) => f.description.length > 0),
    ).toBe(true);
  });
});

describe('facility unlock levels', () => {
  it('gives each facility the Furnace level at which it unlocks', () => {
    expect(
      facilities()
        .get()
        .map((f) => [f.id, f.unlockFurnaceLevel]),
    ).toEqual([
      ['hero-hall', 4],
      ['dawn-academy', 25],
      ['beast-cage', 18],
      ['lighthouse', 7],
      ['arena', 8],
      ['chiefs-house', 6],
      ['explorers-cabin', 4],
      ['suggestion-box', 2],
      ['enlistment-office', 11],
    ]);
  });

  it('gives Dawn Academy the Furnace level that its description states', () => {
    const dawnAcademy = facilities().find('dawn-academy')!;
    expect(dawnAcademy.unlockFurnaceLevel).toBe(25);
    expect(dawnAcademy.description).toContain('Furnace Level 25');
  });

  it('gives the Chief’s House the Furnace level at which the Chief Orders unlock', () => {
    expect(facilities().find('chiefs-house')!.unlockFurnaceLevel).toBe(6);
  });

  it('gives the Beast Cage the Furnace level that the pets list', () => {
    const petLevels = new Set(
      pets()
        .get()
        .map((p) => p.unlockRequirement.furnaceLevel)
        .filter((level) => level !== undefined),
    );
    expect([...petLevels]).toEqual([facilities().find('beast-cage')!.unlockFurnaceLevel]);
  });

  it('keeps every unlock level within the 30 Furnace levels', () => {
    for (const facility of facilities().get()) {
      expect(facility.unlockFurnaceLevel).toBeGreaterThanOrEqual(1);
      expect(facility.unlockFurnaceLevel).toBeLessThanOrEqual(30);
    }
  });
});
