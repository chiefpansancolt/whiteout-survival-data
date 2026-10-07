# calculateKingOfIcefield

Calculates King of Icefield points for each day from how many times each scoring action was done.

## Usage

```ts
import { calculateKingOfIcefield } from "whiteout-survival-data";

const result = calculateKingOfIcefield({
  "1": { "Use 1 Fire Crystal to upgrade buildings": 10 },
});
result.event; // { base: 20000, bonus: 0, total: 20000 }
result.days[0].total; // 20000
```

## Input

| Field   | Type                                    | Meaning                                                                                      |
| ------- | --------------------------------------- | -------------------------------------------------------------------------------------------- |
| `usage` | `Record<dayId, Record<action, number>>` | Times each action was done. Days and actions that are left out count as 0. Defaults to `{}`. |

Day ids are `1` to `7`. Action text must match the `scoring` rows of the `king-of-icefield` event in
`events()`.

## Result

| Field   | Meaning                                                                                    |
| ------- | ------------------------------------------------------------------------------------------ |
| `days`  | One entry for every event day, in event order, with `lines`, `base`, `bonus`, and `total`. |
| `event` | `base`, `bonus`, and `total` over all days.                                                |

## How it works

For every day, the calculator multiplies the points of each scoring row by its count and adds the
rows. The points come from `events()`, so a data fix changes the result. No expert changes these
points, so `bonus` is always 0.

## Errors

A `RangeError` is thrown when a count is negative or not a finite number. An `Error` is thrown when
`usage` names a day or an action that the event does not have.

## Data and assumptions

The points come from the `king-of-icefield` event, which has 7 days. The result has the same shape
as the other event calculators so that one display can show all of them.
