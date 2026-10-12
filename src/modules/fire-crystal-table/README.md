# Fire Crystal Table

A table of the Fire Crystals and Refined Fire Crystals that each building needs to reach each Fire
Crystal level, FC 1 to FC 10. The module builds the columns, one row for each building, and a total
for each column. `fireCrystalLevels()` holds the FC 1 to FC 10 badge icons used as column headers.

## Usage

```ts
import { fireCrystalLevels, fireCrystalTable } from "whiteout-survival-data";

const table = fireCrystalTable();

// Column headers: one badge per level, then one resource icon per column
console.log(table.columns.map((c) => `${c.level.name} ${c.item.name}`));
// ['FC 1 Fire Crystal', ..., 'FC 6 Fire Crystal', 'FC 6 Refined Fire Crystal', ...]

// One row for each building. A cell lines up with the column of the same index.
const furnace = table.rows.find((row) => row.buildingId === "furnace");
console.log(furnace?.cells.slice(0, 5)); // [660, 790, 1190, 1400, 1675]

// Total of each column across the buildings
console.log(table.totals[0]); // 1970

// A segment with only some levels, for example FC 6 to FC 10
const late = fireCrystalTable(undefined, { from: 6, to: 10 });
console.log(late.columns.length, late.totals[0]); // 10 3105

console.log(fireCrystalLevels().find("fc-5")?.img); // '/images/fire-crystal/fc-5.png'
```

## Functions

| Function                            | Returns                 | Description                                                                            |
| ----------------------------------- | ----------------------- | -------------------------------------------------------------------------------------- |
| `fireCrystalTable(source?, range?)` | `FireCrystalTable`      | The table. `source` defaults to all buildings. `range` keeps the levels `from` to `to` |
| `fireCrystalLevels()`               | `FireCrystalLevelQuery` | The ten level badges. It has the shared query methods                                  |

The terminal methods `get`, `first`, `find`, `findByName`, `search`, and `count` of
`fireCrystalLevels()` are described in [How It Works](../../../README.md#how-it-works).

## Data

`fireCrystalTable()` returns `columns`, `rows`, and `totals`.

| Field     | Meaning                                                                                         |
| --------- | ----------------------------------------------------------------------------------------------- |
| `columns` | Each has a `level` badge, a `resource` (`fireCrystals` or `refinedFireCrystals`), and an `item` |
| `rows`    | Each has `buildingId`, `name`, an optional `img`, and `cells`                                   |
| `totals`  | The sum of each column, in the order of `columns`                                               |

There is a Fire Crystals column for every level. A Refined Fire Crystals column follows it for each
level where some building pays Refined Fire Crystals, which is FC 6 to FC 10. That gives 15 columns.
A cell is `null` when the building has no cost for the level, and a null cell counts as 0 in
`totals`. A row exists only for a building with a Fire Crystal cost, so the table has 8 rows:
Furnace, Embassy, Command Center, the three Camps, War Academy, and Infirmary.

## Ranges

Pass `{ from, to }` as the second argument to keep only the levels from `from` to `to`, for example
`{ from: 1, to: 5 }` and `{ from: 6, to: 10 }` for two tables. `columns`, every row, and `totals`
hold only those levels, and a Refined Fire Crystals column appears only for a level that costs any.
Every range has the same rows, so tables of one split line up. `fireCrystalTable()` throws
`RangeError` when `from` or `to` is not a level from 1 to 10, or when `from` is above `to`.

## Notes

The costs come from the level costs in `buildings()`.

The cost of a level is the sum of the five upgrades that end at its base row. FC 1 adds up `30-1` to
`30-4` and `FC 1`. FC 2 adds up `FC 1-1` to `FC 1-4` and `FC 2`. FC 6 adds up `FC 5-1` to `FC 5-4`
and `FC 6`. FC 10 has no sub-levels, so it adds up `FC 9-1` to `FC 9-4` and `FC 10`.

War Academy has no `30-1` to `30-4` levels, and its `FC 1` row has no cost, so its FC 1 cell is
`null`.
