# calculateTroops

Calculates the troops that the infantry, lancer, and marksman camps train or promote, with the
resources and the time. It works like the Camp Configuration on WoS Tools.

## Usage

```ts
import { calculateTroops } from "whiteout-survival-data";

const result = calculateTroops({
  camps: {
    infantry: {
      level: "30",
      runs: [{ action: { mode: "training", tier: 10 }, count: "max", batches: 2 }],
    },
    lancer: { level: "30" },
    marksman: { level: "30" },
  },
});
result.capacity; // 627
result.totals; // { infantry: 1254, lancer: 0, marksman: 0, total: 1254 }
result.resources; // meat 3,496,152, wood 2,622,114, coal 611,952, iron 127,908
result.totalSeconds; // 190608
```

## Input

`calculateTroops(input)` takes one object.

| Field                  | Type                                 | Meaning                                                                            |
| ---------------------- | ------------------------------------ | ---------------------------------------------------------------------------------- |
| `camps`                | `Record<TroopType, Camp>`            | A config for each of `infantry`, `lancer`, and `marksman`. All three are required. |
| `researchCapacity`     | `number`                             | Training capacity from research. Defaults to 0.                                    |
| `ministerOfEducation`  | `'regular'` or `'supreme'`           | Adds 200 capacity (300 for supreme) and 50% training speed (75% for supreme).      |
| `capacityBoost`        | `boolean`                            | Multiplies the total capacity by 3.                                                |
| `trainingSpeedPercent` | `number`                             | Your speed as the game shows it, without the buffs below. Defaults to 0.           |
| `vicePresident`        | `'regular'` or `'supreme'`           | Adds 10% training speed (15% for supreme).                                         |
| `mobilize`             | `boolean`                            | Adds 30% training speed.                                                           |
| `advancedTraining`     | `boolean`                            | Adds 20% training speed.                                                           |
| `costReductionPercent` | `Partial<Record<TroopType, number>>` | Percent off the resource cost for each troop type, 0 to 75. Defaults to 0.         |

A camp is `{ level, runs? }`. `level` is a level `label` from `buildings()` for that camp, such as
`30` or `FC 3-2`. `runs` is a list, and a camp with no runs only adds its level to the shared
capacity. A run is `{ action, count, batches? }`.

| Run field | Meaning                                                                                       |
| --------- | --------------------------------------------------------------------------------------------- |
| `action`  | `{ mode: 'training', tier }` or `{ mode: 'promotion', fromTier, toTier }`. Tiers are 1 to 12. |
| `count`   | Troops in each batch, or `'max'` for the capacity.                                            |
| `batches` | Number of batches. Defaults to 1.                                                             |

A camp can train and promote, so it can have several runs, each with its own count and batches.

## Result

| Field                  | Meaning                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| `capacity`             | The most troops a camp can queue in one batch. All three camps share it.                                      |
| `camps`                | For each type, `runs` (`troopsPerBatch`, `batches`, `seconds`, in input order) and the `seconds` of the camp. |
| `tiers`                | One row for each tier 1 to 12 with the change in troops of each type and `total`.                             |
| `totals`               | The change in troops for each type and in all, summed over the tiers.                                         |
| `trainingSpeedPercent` | The speed in percent that the times use, with the buffs added.                                                |
| `resources`            | Meat, wood, coal, and iron as `{ itemId, amount }`, rounded to whole numbers.                                 |
| `totalSeconds`         | The seconds of the three camps added together. This is the speedup time you need.                             |
| `longestCampSeconds`   | The seconds of the camp that takes the longest, since the camps train at the same time.                       |

## How it works

All three camps share one capacity: the capacity of the three camp levels added together, plus
`researchCapacity` and the `ministerOfEducation` capacity, times 3 with `capacityBoost`. The boost
applies after the bonuses are added.

Training adds troops at its tier. Promotion takes them from `fromTier` and adds them to `toTier`, so
a promotion adds none to the total. A run changes the tiers by `count` times `batches`.

The cost of a run is the cost of one troop from `troops()` times the troops, less
`costReductionPercent` for that troop type. A promotion adds up the steps from tier to tier. A step
costs the difference of the two training costs, or the `promotionCost` of the tier when the data has
one (tier 12). The seconds of a promotion step are the difference of the two training times.

The seconds of a batch are the training time of one troop times the troops, divided by 1 plus the
training speed, rounded down. The speed is `trainingSpeedPercent` plus the buffs. A run multiplies
the batch seconds by its batches, and a camp adds up its runs. The resources are rounded once per
resource at the end, not per run.

`TROOP_CALCULATOR` is exported so an app can offer the same choices. It holds `troopTypes`,
`minTier` (1), `maxTier` (12, read from the troop data), `capacityBoostMultiplier` (3), the Minister
of Education capacity and speed, the Vice President speed, `mobilizeSpeedPercent`,
`advancedTrainingSpeedPercent`, and `maxCostReductionPercent` (75).

## Errors

An `Error` is thrown when a camp `level` does not exist for that camp. A `RangeError` is thrown when
a count is not a whole number of 0 or more, or is above the capacity. It is also thrown when
`batches` is not a whole number of 1 or more, when a tier is not a whole number from 1 to 12, when a
promotion does not go to a higher tier, when `trainingSpeedPercent` is negative, and when a cost
reduction is not from 0 to 75.

## Data and assumptions

Camp capacity comes from `trainingCapacity` of the camp levels in `buildings()`. Costs and training
times come from `troops()`. The buff values come from the game and live in `TROOP_CALCULATOR`. The
calculator does not check that the research capacity or the training speed match your account. Pass
the values the game shows.
