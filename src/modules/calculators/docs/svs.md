# calculateSvs

Calculates State of Power (SvS) points for each day and phase from how many times each scoring
action was done. It can add Valeria's Well Prepared bonus.

## Usage

```ts
import { calculateSvs } from "whiteout-survival-data";

const result = calculateSvs(
  { "4": { "Use 1 Mithril": 3 }, Battle: { "Kill 1 Lv. 11 enemy Troop.": 200 } },
  { valeriaLevel: 10 },
);
result.valeriaBonusPercent; // 20
result.preparation; // { base: 432000, bonus: 86400, total: 518400 }
result.battle; // { base: 3000, bonus: 0, total: 3000 }
result.event.total; // 521400
```

## Input

| Field                  | Type                                    | Meaning                                                                                      |
| ---------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------- |
| `usage`                | `Record<dayId, Record<action, number>>` | Times each action was done. Days and actions that are left out count as 0. Defaults to `{}`. |
| `options.valeriaLevel` | `number`                                | Level 1 to 10 of Valeria's Well Prepared skill. Leave out for no bonus.                      |

Day ids are `1` to `5` and `Battle`. Action text must match the `scoring` rows of the
`svs-state-of-power` event in `events()`.

## Result

| Field                 | Meaning                                                                                                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `valeriaBonusPercent` | The bonus in percent. 0 when `valeriaLevel` is left out.                                                                                                                            |
| `days`                | One entry for every event day, in event order, with `phase` set to `preparation` or `battle`. Each day has `lines` (action, points, count, subtotal), `base`, `bonus`, and `total`. |
| `preparation`         | `base`, `bonus`, and `total` added over days 1 to 5.                                                                                                                                |
| `battle`              | `base`, `bonus`, and `total` of the Battle Phase.                                                                                                                                   |
| `event`               | `base`, `bonus`, and `total` over all days.                                                                                                                                         |

## How it works

For every day of the event, the calculator multiplies the points of each scoring row by its count.
The points come from `events()`, not from code, so a data fix changes the result. The base of a day
is the sum of its rows.

Valeria's Well Prepared skill adds its percent to the points of days 1 to 5 and never to the Battle
Phase. The percent comes from the "Preparation Phase Point gains (%)" progression of the skill in
`experts()`, and the bonus is 2% for each level. The bonus of a day is the percent of that day's
base, rounded to a whole number. The day total is the base plus the bonus. The same action on two
days is counted separately, because each day has its own rows.

`SVS_BATTLE_DAY_ID` is exported and holds `'Battle'`, the id of the day that Valeria's bonus skips.
Use it to tell the Battle Phase from the Preparation Phase in an app.

## Errors

A `RangeError` is thrown when `valeriaLevel` is not a whole number from 1 to 10, or when a count is
negative or not a finite number. An `Error` is thrown when `usage` names a day or an action that the
event does not have.

## Data and assumptions

The points come from the `svs-state-of-power` event. The calculator reads the percent of each level
from the Valeria data, so it holds no copy of the 2% steps. No other expert bonus is included.
