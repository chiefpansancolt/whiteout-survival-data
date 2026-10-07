# calculateHallOfChief

Calculates Hall of Chief points for each stage from how many times each scoring action was done.

## Usage

```ts
import { calculateHallOfChief } from "whiteout-survival-data";

const result = calculateHallOfChief({
  "s1-1": { "Raise 1 Power through Construction": 1000 },
});
result.days[0].total; // 45000
result.event.total; // 45000
```

## Input

| Field   | Type                                      | Meaning                                                                                        |
| ------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `usage` | `Record<stageId, Record<action, number>>` | Times each action was done. Stages and actions that are left out count as 0. Defaults to `{}`. |

Stage ids look like `s1-1` (season 1, stage 1). Action text must match the `scoring` rows of the
`hall-of-chief` event in `events()`.

## Result

| Field   | Meaning                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------ |
| `days`  | One entry for every stage, in event order. Each has `day` (the stage id), `name`, `lines`, `base`, `bonus`, and `total`. |
| `event` | `base`, `bonus`, and `total` over all stages.                                                                            |

## How it works

For every stage, the calculator multiplies the points of each scoring row by its count and adds the
rows. The points come from `events()`. No expert changes these points, so `bonus` is always 0.

The event ranks every stage on its own. Read the total of one stage in `days` and do not rely on
`event`, which is only the sum of all stages.

## Errors

A `RangeError` is thrown when a count is negative or not a finite number. An `Error` is thrown when
`usage` names a stage or an action that the event does not have.

## Data and assumptions

The points come from the `hall-of-chief` event, which has 13 stages (`s1-1` to `s1-6` and `s2-1` to
`s2-7`). The stage names are not shown on the wiki, so the data names them by season and stage. The
result keeps the field name `days` so that it matches the other event calculators.
