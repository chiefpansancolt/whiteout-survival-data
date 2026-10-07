# calculatePets

Calculates the pet food, advancement items, stat gains, and event points to level pets from a
current level to a goal level.

## Usage

```ts
import { calculatePets } from "whiteout-survival-data";

const result = calculatePets([{ id: "cave-hyena", current: 1, goal: 25 }]);

result.resources; // [{ itemId: 'pet-food', amount: 7145 }, { itemId: 'taming-manual', amount: 45 }]
result.advancements; // 2 (at levels 10 and 20)
result.troopAttack; // 2.05
result.power; // 147600
result.eventPoints.svs; // 75000
```

## Input

`calculatePets(goals)` takes a list with one entry for each pet. The list defaults to empty.

| Field             | Type    | Meaning                                                                                   |
| ----------------- | ------- | ----------------------------------------------------------------------------------------- |
| `id`              | string  | Pet `id` from `pets()`.                                                                   |
| `current`         | number  | Level of the pet now, from 1 to the max level of the pet.                                 |
| `goal`            | number  | Level to reach, from `current` to the max level of the pet.                               |
| `currentAdvanced` | boolean | Optional. True when the pet is already advanced at `current`.                             |
| `goalAdvanced`    | boolean | Optional. True to pay for the advancement at `goal` too. Both flags are false by default. |

An advanced flag is valid only on a level that is a multiple of `PET_ADVANCEMENT_INTERVAL` (10).

## Result

The result has one entry in `items` for each goal, and the same fields summed over all goals.

| Field              | Meaning                                                                        |
| ------------------ | ------------------------------------------------------------------------------ |
| `levels`           | Levels gained.                                                                 |
| `advancements`     | Advancements paid for.                                                         |
| `resources`        | `itemId` and `amount` pairs: pet food and the advancement items.               |
| `troopAttack`      | Gain in Troop Attack in percent, rounded to 2 decimals.                        |
| `troopDefense`     | Gain in Troop Defense in percent, rounded to 2 decimals.                       |
| `power`            | Gain in troops power.                                                          |
| `advancementScore` | Pet advancement score of the advancements paid for.                            |
| `eventPoints`      | Event points of the score for `svs`, `allianceShowdown`, and `kingOfIcefield`. |

Each item also has the pet `id` and `name`.

## How it works

Each level after `current` up to `goal` costs the pet food of that level. A pet advances at every
level that is a multiple of 10 and needs the advancement to go past that level. A range that starts
at or passes such a level pays for the advancement items of that level. A goal that is a multiple of
10 pays for its advancement only when `goalAdvanced` is true. Use it for the final advancement at
the max level. A pet that is already advanced at its current level (`currentAdvanced`) does not pay
for that advancement again.

The stat gains are the difference between the stats of the two states. An advanced state uses the
advanced (refined) values of the level. Each advancement paid for adds its `advancementScore`.

The event points are the score times the points of the "Pet advancement score increases by 1" row in
the scoring rows of `events()`. The rows pay 50 in SvS, 30 in Alliance Showdown, and 50 in King of
Icefield for each point of score.

## Errors

An unknown pet `id` throws `Error`. A level that is not a whole number from 1 to the max level of
the pet, a goal below the current level, or an advanced flag on a level that is not a multiple of 10
throws `RangeError`.

## Data and assumptions

The numbers come from the data behind `pets()` and from the scoring rows of `events()`. Pets have no
training time in the data, so the result has no time. `PET_ADVANCEMENT_INTERVAL` exports the 10, so
an app can show the same advancement levels.
