import { vip, VipQuery } from '@/modules/vip';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('vip', () => vip());

describe('VipQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = vip().get().slice(0, 1);
    expect(new VipQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new VipQuery().count()).toBeGreaterThan(0);
  });

  it('byLevel() filters to the given VIP level', () => {
    const vip5 = vip().byLevel(5);
    expect(vip5.count()).toBe(1);
    expect(vip5.first()!.id).toBe('vip-5');
  });

  it('atXp() returns the highest level reachable with the given XP, summing per-level costs', () => {
    // Per-level costs: 0, 2500, 5000, 12500, 30000, 40000, ... -- cumulative: 0, 2500, 7500,
    // 20000, 50000, 90000, ... VIP 6 needs 90000 total, not its own 40000.
    expect(vip().atXp(0).first()!.id).toBe('vip-1');
    expect(vip().atXp(2499).first()!.id).toBe('vip-1');
    expect(vip().atXp(2500).first()!.id).toBe('vip-2');
    expect(vip().atXp(89999).first()!.id).toBe('vip-5');
    expect(vip().atXp(90000).first()!.id).toBe('vip-6');
    expect(vip().atXp(99999999).first()!.id).toBe('vip-12');
  });

  it('atXp() returns nothing when no level in scope is reachable yet', () => {
    expect(vip().byLevel(9).atXp(0).count()).toBe(0);
  });
});

describe('VIP progression', () => {
  it('covers all 12 VIP levels', () => {
    expect(vip().count()).toBe(12);
    for (let level = 1; level <= 12; level++) {
      expect(vip().find(`vip-${level}`)).toBeDefined();
    }
  });

  it('requires no XP for VIP 1 and sums per-level costs to 4,800,000 total XP for VIP 12', () => {
    expect(vip().find('vip-1')!.xpRequired).toBe(0);
    expect(vip().find('vip-12')!.xpRequired).toBe(2400000);
    const totalXp = vip()
      .get()
      .reduce((sum, l) => sum + l.xpRequired, 0);
    expect(totalXp).toBe(4800000);
  });

  it('lists cumulative bonuses active at each level, not per-level deltas', () => {
    // The source infographic shows the *total* bonus active at each level,
    // not what changed since the previous level, so e.g. Resource Production
    // Speed appears at every level with an increasing value.
    const vip1 = vip().find('vip-1')!;
    expect(vip1.bonuses).toEqual([
      { stat: 'Resource Production Speed', value: '+2%', amount: 2, unit: 'percent' },
      { stat: 'Storehouse Capacity', value: '+100K', amount: 100000, unit: 'flat' },
    ]);

    const vip12 = vip().find('vip-12')!;
    expect(vip12.bonuses).toEqual([
      { stat: 'Troops Lethality', value: '+16%', amount: 16, unit: 'percent' },
      { stat: 'Troops Health', value: '+16%', amount: 16, unit: 'percent' },
      { stat: 'Troops Attack', value: '+16%', amount: 16, unit: 'percent' },
      { stat: 'Troops Defense', value: '+16%', amount: 16, unit: 'percent' },
      { stat: 'March Queue', value: '+1', amount: 1, unit: 'flat' },
      { stat: 'Troop Formation', value: '+2', amount: 2, unit: 'flat' },
      { stat: 'Construction Speed', value: '+20%', amount: 20, unit: 'percent' },
      { stat: 'Resource Production Speed', value: '+24%', amount: 24, unit: 'percent' },
      { stat: 'Storehouse Capacity', value: '+1.1M', amount: 1100000, unit: 'flat' },
    ]);
  });

  it('parses every bonus value into a numeric amount matching its display string', () => {
    // e.g. "+16%" -> 16/percent, "+100K" -> 100000/flat, "+1.1M" -> 1100000/flat,
    // "+1" -> 1/flat — the raw string stays as the source of truth for display.
    vip()
      .get()
      .flatMap((l) => l.bonuses)
      .forEach((b) => {
        expect(typeof b.amount).toBe('number');
        expect(['percent', 'flat']).toContain(b.unit);
        if (b.unit === 'percent') {
          expect(b.value).toBe(`+${b.amount}%`);
        }
      });
  });

  it('introduces combat stat bonuses starting at VIP 9', () => {
    for (let level = 1; level <= 8; level++) {
      const stats = vip()
        .find(`vip-${level}`)!
        .bonuses.map((b) => b.stat);
      expect(stats.some((s) => s.startsWith('Troops '))).toBe(false);
    }
    expect(
      vip()
        .find('vip-9')!
        .bonuses.map((b) => b.stat),
    ).toContain('Troops Defense');
  });
});
