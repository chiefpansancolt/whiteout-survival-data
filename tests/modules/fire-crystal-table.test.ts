import { buildings } from '@/modules/buildings';
import {
  FireCrystalLevelQuery,
  fireCrystalLevels,
  fireCrystalTable,
} from '@/modules/fire-crystal-table';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('fireCrystalLevels', () => fireCrystalLevels());

describe('FireCrystalLevelQuery', () => {
  it('lists the ten levels in order', () => {
    expect(
      fireCrystalLevels()
        .get()
        .map((l) => l.level),
    ).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('accepts an explicit source array', () => {
    expect(new FireCrystalLevelQuery(fireCrystalLevels().get().slice(0, 2)).count()).toBe(2);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new FireCrystalLevelQuery().count()).toBe(10);
  });
});

describe('fireCrystalTable', () => {
  const table = fireCrystalTable();

  it('has a Fire Crystals column for every level and Refined Fire Crystals columns from FC 6', () => {
    expect(
      table.columns.map((c) => `${c.level.level}${c.resource === 'fireCrystals' ? 'F' : 'R'}`),
    ).toEqual([
      '1F',
      '2F',
      '3F',
      '4F',
      '5F',
      '6F',
      '6R',
      '7F',
      '7R',
      '8F',
      '8R',
      '9F',
      '9R',
      '10F',
      '10R',
    ]);
  });

  it('gives each column the item of its resource', () => {
    for (const column of table.columns) {
      expect(column.item.id).toBe(
        column.resource === 'fireCrystals' ? 'fire-crystal' : 'refined-fire-crystal',
      );
    }
  });

  it('has a row for each building with a Fire Crystal cost', () => {
    expect(table.rows.map((r) => r.buildingId)).toEqual([
      'furnace',
      'embassy',
      'command-center',
      'infantry-camp',
      'marksman-camp',
      'lancer-camp',
      'war-academy',
      'infirmary',
    ]);
  });

  it('keeps the name and image of the building', () => {
    const furnace = table.rows.find((r) => r.buildingId === 'furnace')!;
    expect(furnace.name).toBe('Furnace');
    expect(furnace.img).toBe(buildings().find('furnace')!.img);
  });

  it('sums the five upgrades that end at each level', () => {
    const upgradeLabels = (level: number) => {
      const previous = level === 1 ? '30' : `FC ${level - 1}`;
      const base = `FC ${level}`;
      return [1, 2, 3, 4].map((n) => `${previous}-${n}`).concat(base);
    };
    const costOf = (buildingId: string, label: string, costName: string) =>
      buildings()
        .find(buildingId)!
        .levels.find((l) => l.label === label)
        ?.cost.find((c) => c.name === costName)?.count ?? 0;

    for (const row of table.rows) {
      table.columns.forEach((column, index) => {
        const costName =
          column.resource === 'fireCrystals' ? 'Fire Crystals' : 'Refined Fire Crystals';
        const expected = upgradeLabels(column.level.level).reduce(
          (sum, label) => sum + costOf(row.buildingId, label, costName),
          0,
        );
        expect(row.cells[index] ?? 0).toBe(expected);
      });
    }
  });

  it('adds the five equal upgrades of the Furnace for FC 1 to FC 5', () => {
    const furnace = table.rows.find((r) => r.buildingId === 'furnace')!;
    expect(furnace.cells.slice(0, 5)).toEqual([132 * 5, 158 * 5, 238 * 5, 280 * 5, 335 * 5]);
  });

  it('leaves a cell null where the building has no cost for the level', () => {
    const warAcademy = table.rows.find((r) => r.buildingId === 'war-academy')!;
    expect(warAcademy.cells[0]).toBeNull();
    expect(warAcademy.cells[1]).toBe(71 * 5);
  });

  it('totals each column without the null cells', () => {
    expect(table.totals).toHaveLength(table.columns.length);
    table.totals.forEach((total, index) => {
      const sum = table.rows.reduce((s, row) => s + (row.cells[index] ?? 0), 0);
      expect(total).toBe(sum);
    });
  });

  it('builds the table from a different array of buildings', () => {
    const furnace = buildings().find('furnace')!;
    const single = fireCrystalTable([furnace]);
    expect(single.rows).toHaveLength(1);
    expect(single.totals).toEqual(single.rows[0].cells);
  });

  describe('range', () => {
    const levelsOf = (t: typeof table) => [...new Set(t.columns.map((c) => c.level.level))];

    it('keeps only the columns of the levels in the range', () => {
      const segment = fireCrystalTable(undefined, { from: 6, to: 8 });
      expect(levelsOf(segment)).toEqual([6, 7, 8]);
      expect(segment.columns).toHaveLength(6);
    });

    it('keeps the cells and totals of the full table for those columns', () => {
      const segment = fireCrystalTable(undefined, { from: 3, to: 6 });
      const firstIndex = table.columns.findIndex((c) => c.level.level === 3);
      const lastIndex = table.columns.findIndex(
        (c) => c.level.level === 6 && c.resource === 'refinedFireCrystals',
      );
      expect(segment.totals).toEqual(table.totals.slice(firstIndex, lastIndex + 1));
      segment.rows.forEach((row, index) => {
        expect(row.cells).toEqual(table.rows[index].cells.slice(firstIndex, lastIndex + 1));
      });
    });

    it('keeps the same rows in every range', () => {
      const early = fireCrystalTable(undefined, { from: 1, to: 1 });
      expect(early.rows.map((r) => r.buildingId)).toEqual(table.rows.map((r) => r.buildingId));
      expect(early.columns).toHaveLength(1);
    });

    it('gives the full table for the range of all levels', () => {
      expect(fireCrystalTable(undefined, { from: 1, to: 10 })).toEqual(table);
    });

    it('throws RangeError for a level that does not exist', () => {
      expect(() => fireCrystalTable(undefined, { from: 0, to: 5 })).toThrow(RangeError);
      expect(() => fireCrystalTable(undefined, { from: 1, to: 11 })).toThrow(RangeError);
    });

    it('throws RangeError when from is above to', () => {
      expect(() => fireCrystalTable(undefined, { from: 6, to: 5 })).toThrow(RangeError);
    });
  });

  it('leaves out buildings with no Fire Crystal cost', () => {
    const sawmill = buildings().find('sawmill')!;
    expect(fireCrystalTable([sawmill]).rows).toEqual([]);
  });
});
