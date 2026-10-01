import { chiefCharmConverter, ChiefCharmConverterQuery } from '@/modules/chief-charm-converter';
import { items } from '@/modules/items';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('chiefCharmConverter', () => chiefCharmConverter());

describe('ChiefCharmConverterQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = chiefCharmConverter().get().slice(0, 1);
    expect(new ChiefCharmConverterQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new ChiefCharmConverterQuery().count()).toBeGreaterThan(0);
  });

  it('byFromItem() filters to conversions that consume the given item', () => {
    const fromCharmGuide = chiefCharmConverter().byFromItem('charm-guide');
    expect(fromCharmGuide.count()).toBe(2);
    expect(fromCharmGuide.get().every((c) => c.fromItemId === 'charm-guide')).toBe(true);
  });

  it('byToItem() filters to conversions that produce the given item', () => {
    const toCharmSecrets = chiefCharmConverter().byToItem('charm-secrets');
    expect(toCharmSecrets.count()).toBe(2);
    expect(toCharmSecrets.get().every((c) => c.toItemId === 'charm-secrets')).toBe(true);
  });
});

describe('Chief Charm converter', () => {
  it('has all 4 exchange rates from the in-game converter', () => {
    expect(chiefCharmConverter().count()).toBe(4);
  });

  it('resolves every fromItemId and toItemId against a real cataloged item', () => {
    const conversions = chiefCharmConverter().get();
    conversions.forEach((c) => {
      expect(items().find(c.fromItemId)).toBeDefined();
      expect(items().find(c.toItemId)).toBeDefined();
    });
  });

  it('has no weekly limit, unlike the Chief Gear converter', () => {
    expect(
      chiefCharmConverter()
        .get()
        .every((c) => c.weeklyLimit === undefined),
    ).toBe(true);
  });

  it('matches the exact rates for each conversion', () => {
    const ratesById: Record<string, { fromQuantity: number; toQuantity: number }> = {
      'charm-guide-to-charm-design': { fromQuantity: 2, toQuantity: 1 },
      'charm-design-to-charm-guide': { fromQuantity: 2, toQuantity: 1 },
      'charm-guide-to-charm-secrets': { fromQuantity: 40, toQuantity: 1 },
      'charm-design-to-charm-secrets': { fromQuantity: 40, toQuantity: 1 },
    };
    Object.entries(ratesById).forEach(([id, rate]) => {
      const conversion = chiefCharmConverter().find(id)!;
      expect(conversion.fromQuantity).toBe(rate.fromQuantity);
      expect(conversion.toQuantity).toBe(rate.toQuantity);
    });
  });

  it('maps "Jewel Secrets" from the source table to the existing Charm Secrets item', () => {
    const toSecrets = chiefCharmConverter().byToItem('charm-secrets').get();
    expect(toSecrets).toHaveLength(2);
    expect(items().find('charm-secrets')!.name).toBe('Charm Secrets');
  });
});
