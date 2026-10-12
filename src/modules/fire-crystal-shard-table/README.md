# Fire Crystal Shard Table

A table of the Fire Crystal Shards and Refined Fire Crystals that the T11 and T12 troop research
costs. There is one column for each troop type, tier, and resource. The left side splits the cost
into the Unlock and the extras. The module builds the rows and the totals.

## Usage

```ts
import { fireCrystalShardTable } from "whiteout-survival-data";

const table = fireCrystalShardTable();

console.log(table.columns.map((c) => `${c.category} ${c.item.name}`).slice(0, 3));
// ['T11 Infantry Fire Crystal Shard', 'T12 Infantry Fire Crystal Shard', 'T12 Infantry Refined Fire Crystal']

const unlock = table.rows.find((row) => row.id === "unlock");
console.log(unlock?.cells.slice(0, 3)); // [13421, 3080, 440]

const total = table.rows.find((row) => row.id === "total");
console.log(total?.cells.slice(0, 3)); // [27314, 68544, 3977]

// Only T11, or only T12
const t11 = fireCrystalShardTable(undefined, ["T11"]);
console.log(
  t11.columns.length,
  t11.rows.map((row) => row.id),
); // 3 ['unlock', 'tier-6', 'tier-7', 'extras', 'total']
```

## Functions

| Function                                 | Returns                 | Description                                                                                                |
| ---------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| `fireCrystalShardTable(source?, tiers?)` | `FireCrystalShardTable` | The table. `source` defaults to all research nodes from `research()`. `tiers` defaults to `['T11', 'T12']` |

## Data

`fireCrystalShardTable()` returns `columns` and `rows`.

| Field     | Meaning                                                                                    |
| --------- | ------------------------------------------------------------------------------------------ |
| `columns` | Each has `troopType`, `tier` (`T11` or `T12`), `category`, `resource`, and the `item` icon |
| `rows`    | Each has `id`, `name`, `kind`, and `cells`, a value for each column in order               |

`resource` is `fireCrystalShards` or `refinedFireCrystals`. Each troop type has a Fire Crystal
Shards column for T11 and for T12, and a Refined Fire Crystals column for T12. T11 costs no Refined
Fire Crystals, so it has no such column. That gives 9 columns.

The rows come in this order. `kind` is the value in brackets.

| Row                        | Meaning                                                         |
| -------------------------- | --------------------------------------------------------------- |
| `unlock` (`unlock`)        | The sum of the research that unlocks the troop                  |
| `tier-2` and up (`extras`) | The cost of the research after the Unlock in that research tier |
| `extras` (`extrasTotal`)   | The sum of the extras rows                                      |
| `total` (`total`)          | The Unlock plus the extras                                      |

A cell is `null` when the column has no cost for the row, and a null cell counts as 0 in the sums.

## Tiers

Pass `['T11']`, `['T12']`, or `['T11', 'T12']` as the second argument to keep only those tiers. The
columns, the extras rows, and the totals then hold only those tiers. The extras rows list only the
research tiers that cost something in the shown columns, so T11 alone has Tier 6 and Tier 7. The
order of the array does not matter. `fireCrystalShardTable()` throws `RangeError` when the array
holds no tier.

## Notes

The costs come from the research costs in `research()`.

The Unlock row sums research tiers 1 to 5 for T11, which ends with the Helios node that unlocks the
troop. For T12 it sums tier 1, the five Exalted items that the Exalted capstone requires. The
capstone has no known cost and adds 0. The extras are the later tiers: 6 and 7 for T11, and 2 to 8
for T12. A tier row is `null` in a column where the tier belongs to the Unlock or does not exist.
