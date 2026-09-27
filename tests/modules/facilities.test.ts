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

  it('tracks all 8 descriptive facilities', () => {
    expect(facilities().count()).toBe(8);
  });

  it('has a non-empty description for every facility', () => {
    expect(
      facilities()
        .get()
        .every((f) => f.description.length > 0),
    ).toBe(true);
  });
});
