import { facilities, FacilityQuery } from '@/modules/facilities';
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
  it('gives Dawn Academy the Furnace level that its description states', () => {
    const dawnAcademy = facilities().find('dawn-academy')!;
    expect(dawnAcademy.unlockFurnaceLevel).toBe(25);
    expect(dawnAcademy.description).toContain('Furnace Level 25');
  });

  it('gives the Chief’s House the Furnace level at which the Chief Orders unlock', () => {
    expect(facilities().find('chiefs-house')!.unlockFurnaceLevel).toBe(6);
  });

  it('leaves the unlock level out of every other facility', () => {
    const others = facilities()
      .get()
      .filter((f) => !['dawn-academy', 'chiefs-house'].includes(f.id));
    expect(others.length).toBeGreaterThan(0);
    for (const facility of others) expect(facility.unlockFurnaceLevel).toBeUndefined();
  });
});
