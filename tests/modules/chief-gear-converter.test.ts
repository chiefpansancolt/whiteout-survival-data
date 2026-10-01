import { chiefGearConverter, ChiefGearConverterQuery } from '@/modules/chief-gear-converter';
import { items } from '@/modules/items';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('chiefGearConverter', () => chiefGearConverter());

describe('ChiefGearConverterQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = chiefGearConverter().get().slice(0, 1);
    expect(new ChiefGearConverterQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new ChiefGearConverterQuery().count()).toBeGreaterThan(0);
  });

  it('byFromItem() filters to conversions that consume the given item', () => {
    const fromDesignPlans = chiefGearConverter().byFromItem('design-plans');
    expect(fromDesignPlans.count()).toBe(3);
    expect(fromDesignPlans.get().every((c) => c.fromItemId === 'design-plans')).toBe(true);
  });

  it('byToItem() filters to conversions that produce the given item', () => {
    const toDesignPlans = chiefGearConverter().byToItem('design-plans');
    expect(toDesignPlans.count()).toBe(2);
    expect(toDesignPlans.get().every((c) => c.toItemId === 'design-plans')).toBe(true);
  });
});

describe('Chief Gear converter', () => {
  it('has all 7 exchange rates from the in-game converter', () => {
    expect(chiefGearConverter().count()).toBe(7);
  });

  it('resolves every fromItemId and toItemId against a real cataloged item', () => {
    const conversions = chiefGearConverter().get();
    conversions.forEach((c) => {
      expect(items().find(c.fromItemId)).toBeDefined();
      expect(items().find(c.toItemId)).toBeDefined();
    });
  });

  it('matches the exact rates and weekly limits for each conversion', () => {
    const ratesById: Record<
      string,
      { fromQuantity: number; toQuantity: number; weeklyLimit: number }
    > = {
      'design-plans-to-lunar-amber': { fromQuantity: 10, toQuantity: 1, weeklyLimit: 500 },
      'design-plans-to-polishing-solution': { fromQuantity: 1, toQuantity: 3, weeklyLimit: 500 },
      'design-plans-to-hardened-alloy': { fromQuantity: 1, toQuantity: 300, weeklyLimit: 500 },
      'polishing-solution-to-design-plans': { fromQuantity: 10, toQuantity: 1, weeklyLimit: 50 },
      'polishing-solution-to-hardened-alloy': {
        fromQuantity: 1,
        toQuantity: 50,
        weeklyLimit: 1000,
      },
      'hardened-alloy-to-design-plans': { fromQuantity: 1000, toQuantity: 1, weeklyLimit: 50 },
      'hardened-alloy-to-polishing-solution': {
        fromQuantity: 200,
        toQuantity: 1,
        weeklyLimit: 500,
      },
    };
    Object.entries(ratesById).forEach(([id, rate]) => {
      const conversion = chiefGearConverter().find(id)!;
      expect(conversion.fromQuantity).toBe(rate.fromQuantity);
      expect(conversion.toQuantity).toBe(rate.toQuantity);
      expect(conversion.weeklyLimit).toBe(rate.weeklyLimit);
    });
  });
});
