import { QueryBase } from '@/common/query-base';

/**
 * Standard assertions every QueryBase subclass should pass.
 * Call from each module's test file with the factory function.
 */
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
