import { QueryBase } from '@/common/query-base';
import { BuffCalculation, BuffCategory } from '@/types';

export function testQueryBaseContract<T extends { id: string; name: string }>(
  factoryName: string,
  factory: () => QueryBase<T>,
) {
  describe(`${factoryName}: QueryBase contract`, () => {
    it('get() returns a non-empty array', () => {
      const results = factory().get();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it('count() matches get().length', () => {
      const query = factory();
      expect(query.count()).toBe(query.get().length);
    });

    it('first() returns the first element of get()', () => {
      const query = factory();
      expect(query.first()).toBe(query.get()[0]);
    });

    it('find() locates an item by ID', () => {
      const item = factory().first()!;
      expect(factory().find(item.id)).toEqual(item);
    });

    it('find() returns undefined for non-existent ID', () => {
      expect(factory().find('__nonexistent__')).toBeUndefined();
    });

    it('findByName() is case-insensitive', () => {
      const item = factory().first()!;
      expect(factory().findByName(item.name.toUpperCase())).toEqual(item);
      expect(factory().findByName(item.name.toLowerCase())).toEqual(item);
    });

    it('search() finds items by partial name match', () => {
      const item = factory().first()!;
      const partial = item.name.slice(0, Math.max(1, Math.floor(item.name.length / 2)));
      const results = factory().search(partial);
      expect(results.some((r) => r.id === item.id)).toBe(true);
    });
  });
}

const round4 = (value: number): number => Math.round(value * 10000) / 10000;

/**
 * Removes the sources of the account (the starting March Queue and the pack) from a result, so that a
 * test of another source sees only that source.
 */
export function withoutAccountSources(result: BuffCalculation): BuffCalculation {
  const strip = (category: BuffCategory): BuffCategory => {
    const sources = category.sources.filter((s) => s.type !== 'account');
    return { ...category, sources, total: sources.reduce((sum, s) => round4(sum + s.amount), 0) };
  };
  const keep = (category: BuffCategory) => category.sources.length > 0;
  return {
    categories: result.categories.map(strip).filter(keep),
    groups: result.groups
      .map((group) => ({ ...group, categories: group.categories.map(strip).filter(keep) }))
      .filter((group) => group.categories.length > 0),
    bySource: result.bySource.filter((group) => group.id !== 'account'),
  };
}
