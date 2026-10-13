import { allianceTech } from '@/modules/alliance/tech';
import { experts } from '@/modules/experts';
import { research } from '@/modules/research';
import { skins } from '@/modules/skins';
import { vip } from '@/modules/vip';

interface Entry {
  source: string;
  category?: string;
  totalAmount?: number;
  stat: string;
  statKey?: string;
  value: string | number;
  amount?: number;
  unit?: string;
}

const entries: Entry[] = [
  ...research()
    .get()
    .flatMap((n) =>
      n.levels.flatMap((l) =>
        l.bonus.map((b) => ({ source: 'research', category: n.category, ...b })),
      ),
    ),
  ...skins()
    .get()
    .flatMap((s) => (s.bonus ? [{ source: 'skins', ...s.bonus }] : [])),
  ...experts()
    .get()
    .flatMap((e) => e.baseBonuses.map((b) => ({ source: 'experts', ...b }))),
  ...vip()
    .get()
    .flatMap((l) => l.bonuses.map((b) => ({ source: 'vip', ...b }))),
];

const kebab = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const expectedKey = (stat: string) =>
  ({ 'Troop Attack': 'troops-attack', 'Troop Defense': 'troops-defense' })[stat] ?? kebab(stat);

describe('stat keys', () => {
  const withStat = entries.filter((e) => e.stat !== 'Other');

  it('gives every bonus a key, except the Other stat that holds unlock text', () => {
    expect(entries.filter((e) => e.statKey === undefined).map((e) => e.stat)).toEqual([
      'Other',
      'Other',
      'Other',
    ]);
  });

  it('writes the key as the kebab-case stat name', () => {
    for (const entry of withStat) expect(entry.statKey).toBe(expectedKey(entry.stat));
  });

  it('gives the singular and plural troop stats of the skins the same key', () => {
    expect(entries.find((e) => e.stat === 'Troop Attack')!.statKey).toBe('troops-attack');
    expect(entries.find((e) => e.stat === 'Troops Attack')!.statKey).toBe('troops-attack');
    expect(entries.find((e) => e.stat === 'Troop Defense')!.statKey).toBe('troops-defense');
  });

  it('has 55 keys for the 57 stat names with a key', () => {
    expect(new Set(withStat.map((e) => e.stat)).size).toBe(57);
    expect(new Set(withStat.map((e) => e.statKey)).size).toBe(55);
  });

  it('uses one key for each stat name', () => {
    const keysByStat = new Map<string, Set<string | undefined>>();
    for (const entry of entries) {
      keysByStat.set(entry.stat, (keysByStat.get(entry.stat) ?? new Set()).add(entry.statKey));
    }
    for (const keys of keysByStat.values()) expect(keys.size).toBe(1);
  });

  it('keeps the key of the alliance tech stats in the same format', () => {
    const techStats = allianceTech()
      .get()
      .filter((n) => n.stat !== undefined);
    for (const node of techStats) expect(node.statKey).toBe(expectedKey(node.stat!));
  });
});

describe('bonus amounts', () => {
  const parse = (value: string | number) => {
    if (typeof value === 'number') return { amount: value, unit: 'percent' };
    const percent = /^\+?([\d,.]+)%$/.exec(value);
    if (percent) return { amount: Number(percent[1].replace(/,/g, '')), unit: 'percent' };
    const flat = /^\+?([\d,.]+)$/.exec(value);
    return flat ? { amount: Number(flat[1].replace(/,/g, '')), unit: 'flat' } : undefined;
  };

  it('reads the amount and unit from the value of every bonus except the VIP shorthands', () => {
    const checked = entries.filter((e) => e.source !== 'vip' && !e.category?.startsWith('T12 '));
    for (const entry of checked) {
      const parsed = parse(entry.value);
      expect(entry.amount).toBe(parsed?.amount);
      expect(entry.unit).toBe(parsed?.unit);
    }
  });

  it('reads the total amount of a T12 research bonus from its value, because the wiki lists the total', () => {
    const t12 = entries.filter((e) => e.category?.startsWith('T12 ') && e.amount !== undefined);
    expect(t12.length).toBeGreaterThan(1000);
    for (const entry of t12) {
      const parsed = parse(entry.value);
      expect(entry.totalAmount).toBeCloseTo(parsed!.amount, 4);
      expect(entry.unit).toBe(parsed?.unit);
    }
  });

  it('leaves the amount out of the unlock text of the Other stat', () => {
    const unlocks = entries.filter((e) => e.stat === 'Other');
    expect(unlocks.map((e) => e.value)).toEqual([
      'Unlock XI Helios Infantry',
      'Unlock XI Helios Lancer',
      'Unlock XI Helios Marksmen',
    ]);
    for (const entry of unlocks) expect(entry.amount).toBeUndefined();
  });

  it('counts the Troops Deployment Capacity values of research as flat amounts', () => {
    const capacity = entries.filter((e) => e.stat === 'Troops Deployment Capacity');
    expect(capacity.length).toBeGreaterThan(0);
    for (const entry of capacity) expect(entry.unit).toBe('flat');
  });

  it('treats the base bonus of an expert as a percent', () => {
    for (const expert of experts().get()) {
      for (const bonus of expert.baseBonuses) {
        expect(bonus.amount).toBe(bonus.value);
        expect(bonus.unit).toBe('percent');
      }
    }
  });
});

describe('research bonus totals', () => {
  it('adds up the amounts of each stat over the levels of a node', () => {
    for (const node of research().get()) {
      const running = new Map<string, number>();
      for (const level of node.levels) {
        for (const bonus of level.bonus) {
          if (bonus.amount === undefined) {
            expect(bonus.totalAmount).toBeUndefined();
            continue;
          }
          const sum = (running.get(bonus.stat) ?? 0) + bonus.amount;
          running.set(bonus.stat, sum);
          expect(bonus.totalAmount).toBeCloseTo(sum, 4);
        }
      }
    }
  });

  it('gives the total of a node with a repeated value', () => {
    const totals = research()
      .find('assaut-techniques-i')!
      .levels.map((l) => l.bonus[0].totalAmount);
    expect(totals).toEqual([0.5, 1, 1.5]);
  });

  it('gives the total of a node with a bigger last step', () => {
    const levels = research().find('bulwark-formations-i')!.levels;
    expect(levels.map((l) => l.bonus[0].amount)).toEqual([1.25, 1.25, 1.5]);
    expect(levels.map((l) => l.bonus[0].totalAmount)).toEqual([1.25, 2.5, 4]);
  });

  it('gives the T12 research the gain of each level as the amount and the wiki value as the total', () => {
    const levels = research().find('exalted-shoulderguard')!.levels;
    expect(levels.map((l) => l.bonus[0].value)).toEqual([
      '3.00%',
      '6.00%',
      '9.00%',
      '12.00%',
      '15.00%',
    ]);
    expect(levels.map((l) => l.bonus[0].amount)).toEqual([3, 3, 3, 3, 3]);
    expect(levels.map((l) => l.bonus[0].totalAmount)).toEqual([3, 6, 9, 12, 15]);
  });

  it('gives a Molten II line 50 levels of 1 percent and a total of 50 percent', () => {
    for (const id of ['molten-blades-ii', 'molten-plating-ii', 'molten-shields-ii']) {
      const levels = research().find(id)!.levels;
      expect(levels).toHaveLength(50);
      expect(levels.every((l) => l.bonus[0].amount === 1)).toBe(true);
      expect(levels[49].bonus[0].totalAmount).toBe(50);
    }
  });

  it('gives every T12 bonus with several levels one constant gain', () => {
    for (const node of research()
      .get()
      .filter((n) => n.category.startsWith('T12 '))) {
      for (const [index, first] of node.levels[0].bonus.entries()) {
        if (first.amount === undefined || node.levels.length < 2) continue;
        const gains = new Set(node.levels.map((l) => l.bonus[index].amount));
        expect([node.id, first.statKey, gains.size]).toEqual([node.id, first.statKey, 1]);
      }
    }
  });

  it('keeps one stat for every level of a line, with Infantry Health on all levels of Molten Plating II', () => {
    const stats = research()
      .find('molten-plating-ii')!
      .levels.map((l) => l.bonus[0].statKey);
    expect(new Set(stats)).toEqual(new Set(['infantry-health']));
  });

  it('adds up each stat of a level with two stats on its own', () => {
    const levels = research().find('helios-infantry-training')!.levels;
    expect(levels[1].bonus.map((b) => [b.stat, b.amount, b.totalAmount])).toEqual([
      ['Helios Infantry Training Cost Reduction', 5, 10],
      ['Troops Deployment Capacity', 100, 200],
    ]);
  });
});
