import { allianceBanner, AllianceBannerQuery } from '@/modules/alliance/territory';
import { items } from '@/modules/items';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('allianceBanner', () => allianceBanner());

describe('AllianceBannerQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = allianceBanner().get().slice(0, 1);
    expect(new AllianceBannerQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new AllianceBannerQuery().count()).toBeGreaterThan(0);
  });

  it('atLevel() finds the range containing the given level', () => {
    const range = allianceBanner().atLevel(13);
    expect(range.count()).toBe(1);
    expect(range.first()!.id).toBe('level-11-15');
  });

  it('atLevel() returns nothing past the last tracked range', () => {
    expect(allianceBanner().atLevel(9999).count()).toBe(0);
  });
});

describe('Alliance Territory banner', () => {
  it('covers 37 level ranges from 0-10 to 276-285', () => {
    expect(allianceBanner().count()).toBe(37);
    expect(allianceBanner().find('level-0-10')).toBeDefined();
    expect(allianceBanner().find('level-276-285')).toBeDefined();
  });

  it('has no build cost for the starting range', () => {
    expect(allianceBanner().find('level-0-10')!.cost).toEqual([]);
  });

  it('resolves every cost itemId against a real cataloged item', () => {
    const allItemIds = allianceBanner()
      .get()
      .flatMap((l) => l.cost.map((c) => c.itemId));
    expect(allItemIds.length).toBeGreaterThan(0);
    expect(allItemIds.every((id) => items().find(id) !== undefined)).toBe(true);
  });

  it('requires equal Meat and Wood at every level that has a cost', () => {
    allianceBanner()
      .get()
      .filter((l) => l.cost.length > 0)
      .forEach((l) => {
        const meat = l.cost.find((c) => c.itemId === 'meat')!;
        const wood = l.cost.find((c) => c.itemId === 'wood')!;
        expect(wood.amount).toBe(meat.amount);
      });
  });

  it('corrects a wiki copy-paste error at Level 51-60 (Meat icon used twice instead of Wood)', () => {
    const level51to60 = allianceBanner().find('level-51-60')!;
    expect(level51to60.cost).toEqual([
      { itemId: 'meat', amount: 25000 },
      { itemId: 'wood', amount: 25000 },
    ]);
  });

  it('introduces Coal at Level 121-130 and Iron at Level 146-150', () => {
    const level111to120 = allianceBanner().find('level-111-120')!;
    expect(level111to120.cost.some((c) => c.itemId === 'coal')).toBe(false);

    const level121to130 = allianceBanner().find('level-121-130')!;
    expect(level121to130.cost.some((c) => c.itemId === 'coal')).toBe(true);
    expect(level121to130.cost.some((c) => c.itemId === 'iron')).toBe(false);

    const level146to150 = allianceBanner().find('level-146-150')!;
    expect(level146to150.cost.map((c) => c.itemId)).toEqual(['meat', 'wood', 'coal', 'iron']);
  });
});
