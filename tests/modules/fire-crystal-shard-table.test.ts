import { fireCrystalShardTable } from '@/modules/fire-crystal-shard-table';
import { research } from '@/modules/research';

const table = fireCrystalShardTable();
const column = (category: string, resource = 'fireCrystalShards') =>
  table.columns.findIndex((c) => c.category === category && c.resource === resource);
const row = (id: string) => table.rows.find((r) => r.id === id)!;

describe('fireCrystalShardTable', () => {
  it('has a Fire Crystal Shards column for each troop type and tier and a Refined column for T12', () => {
    expect(table.columns.map((c) => `${c.category} ${c.resource}`)).toEqual([
      'T11 Infantry fireCrystalShards',
      'T12 Infantry fireCrystalShards',
      'T12 Infantry refinedFireCrystals',
      'T11 Lancer fireCrystalShards',
      'T12 Lancer fireCrystalShards',
      'T12 Lancer refinedFireCrystals',
      'T11 Marksman fireCrystalShards',
      'T12 Marksman fireCrystalShards',
      'T12 Marksman refinedFireCrystals',
    ]);
    expect(table.columns[1]).toMatchObject({ troopType: 'Infantry', tier: 'T12' });
  });

  it('gives each column the item of its resource', () => {
    for (const c of table.columns) {
      expect(c.item.id).toBe(
        c.resource === 'fireCrystalShards' ? 'fire-crystal-shard' : 'refined-fire-crystal',
      );
    }
  });

  it('has an Unlock row, a row for each extras tier, an Extras row, and a Total row', () => {
    expect(table.rows.map((r) => r.id)).toEqual([
      'unlock',
      'tier-2',
      'tier-3',
      'tier-4',
      'tier-5',
      'tier-6',
      'tier-7',
      'tier-8',
      'extras',
      'total',
    ]);
    expect(table.rows.map((r) => r.kind)).toEqual([
      'unlock',
      'extras',
      'extras',
      'extras',
      'extras',
      'extras',
      'extras',
      'extras',
      'extrasTotal',
      'total',
    ]);
  });

  it('gives each row a cell for every column', () => {
    for (const r of table.rows) expect(r.cells).toHaveLength(table.columns.length);
  });

  it('sums tiers 1 to 5 in the T11 Unlock cells', () => {
    const t11Infantry = 258 + (1174 + 1174) + 3745 + (2417 + 2417) + 2236;
    expect(row('unlock').cells[column('T11 Infantry')]).toBe(t11Infantry);
    expect(row('unlock').cells[column('T11 Lancer')]).toBe(t11Infantry);
    expect(row('unlock').cells[column('T11 Marksman')]).toBe(t11Infantry);
  });

  it('sums tier 1 in the T12 Unlock cells', () => {
    const tier1 = 595 + 595 + 700 + 595 + 595;
    expect(row('unlock').cells[column('T12 Infantry')]).toBe(tier1);
    expect(row('unlock').cells[column('T12 Lancer')]).toBe(tier1);
    expect(row('unlock').cells[column('T12 Marksman')]).toBe(tier1);
  });

  it('adds up the nodes of an extras tier', () => {
    expect(row('tier-6').cells[column('T11 Infantry')]).toBe(2789 + 5552);
    expect(row('tier-2').cells[column('T12 Infantry')]).toBe(545 * 4);
  });

  it('leaves a cell null where the research of the tier belongs to the Unlock or does not exist', () => {
    expect(row('tier-2').cells[column('T11 Infantry')]).toBeNull();
    expect(row('tier-5').cells[column('T11 Infantry')]).toBeNull();
    expect(row('tier-8').cells[column('T11 Infantry')]).toBeNull();
    expect(row('tier-8').cells[column('T12 Infantry')]).toBe(200);
  });

  it('sums the extras tiers in the Extras row', () => {
    table.columns.forEach((_, index) => {
      const sum = table.rows
        .filter((r) => r.kind === 'extras')
        .reduce((total, r) => total + (r.cells[index] ?? 0), 0);
      expect(row('extras').cells[index]).toBe(sum);
    });
  });

  it('adds the Refined Fire Crystals of the T12 research', () => {
    const refined = (category: string) => column(category, 'refinedFireCrystals');
    expect(row('unlock').cells[refined('T12 Infantry')]).toBe(85 + 85 + 100 + 85 + 85);
    expect(row('tier-2').cells[refined('T12 Infantry')]).toBe(77 * 4);
    expect(row('tier-7').cells[refined('T12 Infantry')]).toBe(27 + 27);
    expect(row('tier-6').cells[refined('T12 Lancer')]).toBe(360 * 4);
  });

  it('has no Refined Fire Crystals column for T11, which does not cost any', () => {
    expect(column('T11 Infantry', 'refinedFireCrystals')).toBe(-1);
  });

  it('totals each resource of every node of the research line', () => {
    table.columns.forEach((c, index) => {
      const amount = research()
        .get()
        .filter((node) => node.category === c.category)
        .flatMap((node) => node.levels.flatMap((level) => level.cost))
        .filter((cost) => cost.itemId === c.item.id)
        .reduce((sum, cost) => sum + cost.amount, 0);
      expect(row('total').cells[index]).toBe(amount);
    });
  });

  describe('tiers', () => {
    it('keeps only the T11 columns and the extras tiers of T11', () => {
      const t11 = fireCrystalShardTable(undefined, ['T11']);
      expect(t11.columns.map((c) => c.category)).toEqual([
        'T11 Infantry',
        'T11 Lancer',
        'T11 Marksman',
      ]);
      expect(t11.rows.map((r) => r.id)).toEqual(['unlock', 'tier-6', 'tier-7', 'extras', 'total']);
      expect(t11.rows[0].cells).toEqual([13421, 13421, 13421]);
    });

    it('keeps only the T12 columns, with the Refined Fire Crystals columns', () => {
      const t12 = fireCrystalShardTable(undefined, ['T12']);
      expect(t12.columns).toHaveLength(6);
      expect(t12.columns.every((c) => c.tier === 'T12')).toBe(true);
      expect(t12.rows.map((r) => r.id)).toEqual([
        'unlock',
        'tier-2',
        'tier-3',
        'tier-4',
        'tier-5',
        'tier-6',
        'tier-7',
        'tier-8',
        'extras',
        'total',
      ]);
    });

    it('gives the full table for both tiers in any order', () => {
      expect(fireCrystalShardTable(undefined, ['T12', 'T11'])).toEqual(table);
      expect(fireCrystalShardTable(undefined, ['T11', 'T12'])).toEqual(table);
    });

    it('keeps the cells of the full table for the shown columns', () => {
      const t12 = fireCrystalShardTable(undefined, ['T12']);
      const total = t12.rows.find((r) => r.id === 'total')!;
      expect(total.cells[0]).toBe(68544);
      expect(total.cells[1]).toBe(3977);
    });

    it('throws RangeError when no tier is picked', () => {
      expect(() => fireCrystalShardTable(undefined, [])).toThrow(RangeError);
    });
  });

  it('costs the same for every troop type', () => {
    for (const resource of ['fireCrystalShards', 'refinedFireCrystals']) {
      for (const tier of ['T11', 'T12']) {
        const columns = table.columns
          .map((c, index) => ({ c, index }))
          .filter(({ c }) => c.tier === tier && c.resource === resource);
        for (const r of table.rows) {
          const values = columns.map(({ index }) => r.cells[index]);
          expect(new Set(values).size).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it('builds the table from a different array of research nodes', () => {
    const empty = fireCrystalShardTable([]);
    expect(empty.columns).toHaveLength(6);
    expect(empty.rows.map((r) => r.id)).toEqual(['unlock', 'extras', 'total']);
    expect(empty.rows[0].cells.every((cell) => cell === null)).toBe(true);
    expect(empty.rows[2].cells.every((cell) => cell === 0)).toBe(true);
  });
});
