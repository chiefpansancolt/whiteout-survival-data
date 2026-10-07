# calculateChiefCharm

Calculates the materials, charm score, power, and event points for upgrading Chief Charms from a
start level to an end level.

## Usage

```ts
import { calculateChiefCharm } from "whiteout-survival-data";

const result = calculateChiefCharm([{ from: null, to: "level-2" }]);
result.steps; // 2
result.materials; // [{ itemId: 'charm-guide', amount: 45 }, { itemId: 'charm-design', amount: 20 }]
result.score; // 1875
result.power; // 288000
result.eventPoints.svs; // 131250
```

## Input

| Field    | Type             | Meaning                                                                     |
| -------- | ---------------- | --------------------------------------------------------------------------- |
| `ranges` | `UpgradeRange[]` | One range for each charm to upgrade. Defaults to `[]`, which costs nothing. |

Each range is `{ from, to }`. Both are level `id` values from `chiefCharm()`, such as `level-1` or
`level-17-stage-8`. Use `from: null` for a charm that has no level yet, so the first level counts as
a step. A range with the same `from` and `to` costs nothing.

## Result

| Field         | Meaning                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `steps`       | Number of levels bought, counting every stage inside a level.                                                                    |
| `materials`   | Total amount of each item, as `{ itemId, amount }`, added over all ranges.                                                       |
| `score`       | Charm score gained.                                                                                                              |
| `power`       | Power gained. For each range, the `powerTotal` of the last level minus the `powerTotal` of the first level (0 for `from: null`). |
| `eventPoints` | Points in `svs`, `allianceShowdown`, `kingOfIcefield`, and `hallOfChief`.                                                        |

## How it works

The levels of `chiefCharm()` form one ordered list. For a range, the calculator buys every level
after `from` up to and including `to`. It adds the materials and the score of those levels, and the
power gain is the difference of the cumulative `powerTotal` values. Ranges are added together.

Event points are the score times the points that the "Raise Chief Charm max score" row pays in each
event. The calculator reads that row from the `scoring` lists of `svs-state-of-power`,
`alliance-showdown`, `king-of-icefield`, and `hall-of-chief` in `events()`. In the example, a score
of 1,875 is worth 70 points per score in SvS, which gives 131,250.

## Errors

An `Error` is thrown when a range names a level that does not exist. A `RangeError` is thrown when a
range goes down, with `to` before `from`.

## Data and assumptions

The levels come from `chiefCharm()`, which has 75 levels from `level-1` to `level-18-stage-0`. The
score and power are the stored values of the data. The calculator does not know which charm a range
belongs to, so a caller keeps track of that.
