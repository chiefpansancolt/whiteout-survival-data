# calculateAllianceShowdown

Calculates Alliance Showdown personal points for each day from how many times each scoring action
was done. It can add Baldur's Dawn Hymn bonus.

## Usage

```ts
import { calculateAllianceShowdown } from "whiteout-survival-data";

const result = calculateAllianceShowdown(
  { "1": { "Escort 1 truck of any grade": 2, "Use 1 Fire Crystal to upgrade buildings": 5 } },
  { dawnHymnLevel: 3 },
);
result.dawnHymnBonusPercent; // 15
result.event.total;
```

## Input

| Field                   | Type                                    | Meaning                                                                                      |
| ----------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------- |
| `usage`                 | `Record<dayId, Record<action, number>>` | Times each action was done. Days and actions that are left out count as 0. Defaults to `{}`. |
| `options.dawnHymnLevel` | `number`                                | Level 1 to 10 of Baldur's Dawn Hymn skill. Leave out for no bonus.                           |

Day ids are `1` to `5` and `6-7`. Action text must match the `scoring` rows of the
`alliance-showdown` event in `events()`.

## Result

| Field                  | Meaning                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| `dawnHymnBonusPercent` | The bonus in percent. 0 when `dawnHymnLevel` is left out.                                  |
| `days`                 | One entry for every event day, in event order, with `lines`, `base`, `bonus`, and `total`. |
| `event`                | `base`, `bonus`, and `total` over all days.                                                |

## How it works

For every day, the calculator multiplies the points of each scoring row by its count. The points
come from `events()`. The base of a day is the sum of its rows.

Baldur's Dawn Hymn skill adds its percent to every action except the Tundra Trade Route truck
actions (escort and raid). The percent comes from the "Point Boost (%)" progression of the skill in
`experts()`, and the bonus is 5% for each level. The bonus of a day is the percent of the points of
the covered actions, rounded to a whole number.

`ALLIANCE_SHOWDOWN_TRUCK_ACTION` is exported. It is the pattern `/^(Escort|Raid) 1 truck/`, and it
matches the truck actions that the bonus skips. Use it to mark those actions in an app.

## Errors

A `RangeError` is thrown when `dawnHymnLevel` is not a whole number from 1 to 10, or when a count is
negative or not a finite number. An `Error` is thrown when `usage` names a day or an action that the
event does not have.

## Data and assumptions

The points come from the `alliance-showdown` event, which has 6 day entries (days 1 to 5 and `6-7`).
The calculator counts personal points only. No other expert bonus is included.
