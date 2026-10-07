import { HeroWidgetQuery, heroWidgets } from '@/modules/hero-widgets';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('heroWidgets', () => heroWidgets());

describe('HeroWidgetQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = heroWidgets().get().slice(0, 2);
    expect(new HeroWidgetQuery(subset).count()).toBe(2);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new HeroWidgetQuery().count()).toBeGreaterThan(0);
  });

  it('byLevel() filters to the row at the given level', () => {
    const level = heroWidgets().byLevel(4);
    expect(level.count()).toBe(1);
    expect(level.first()!.widgets).toBe(20);
  });
});

describe('Hero widget levels', () => {
  it('has levels 1 to 10 that cost 5 Widgets more with each level', () => {
    const rows = heroWidgets().get();
    expect(rows.map((r) => r.level)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(rows.map((r) => r.widgets)).toEqual([5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);
    expect(rows.reduce((sum, r) => sum + r.widgets, 0)).toBe(275);
  });
});
