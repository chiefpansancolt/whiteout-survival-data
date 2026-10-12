# calculateExperts

Calculates the Books of Knowledge, expert sigils, skill EXP, and affinity points to level experts
and their skills.

## Usage

```ts
import { calculateExperts } from "whiteout-survival-data";

const result = calculateExperts([
  {
    id: "cyrille",
    level: { current: 1, goal: 20 },
    skills: [{ name: "Entrapment", current: 1, goal: 5 }],
  },
]);

result.books; // 700
result.sigils; // 5
result.exp; // 36000
result.affinity; // 6560
```

## Input

`calculateExperts(goals)` takes a list with one entry for each expert. The list defaults to empty.

| Field    | Type                | Meaning                                                                  |
| -------- | ------------------- | ------------------------------------------------------------------------ |
| `id`     | string              | Expert `id` from `experts()`.                                            |
| `level`  | object              | Optional affinity level range. Leave it out to skip the affinity levels. |
| `skills` | list of skill goals | Optional. Leave it out to skip the skills.                               |

The `level` range is `{ current, goal, currentAdvanced?, goalAdvanced? }`. Levels go from 1 to
`EXPERT_MAX_LEVEL` (100). `currentAdvanced` is true when the expert is already advanced at
`current`. `goalAdvanced` is true to pay for the advancement at `goal` too. Both flags are false by
default.

A skill goal is `{ name, current, goal }`. The `name` is the skill name from `experts()`. Levels go
from 1 to the max level of the skill.

## Result

The result has one entry in `items` for each expert, and the same fields summed over all experts.

| Field                    | Meaning                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| `books`                  | Books of Knowledge for the skill levels.                                                   |
| `sigils`                 | Expert sigils for the advancements.                                                        |
| `exp`                    | Skill EXP for the skill levels.                                                            |
| `affinity`               | Affinity points for the affinity levels.                                                   |
| `levels`                 | Affinity levels gained.                                                                    |
| `advancements`           | Advancements paid for.                                                                     |
| `skillLevels`            | Skill levels gained, for all skills.                                                       |
| `speedupPointsPerMinute` | Points for each minute of speedups to learn expert skills in `svs` and `allianceShowdown`. |
| `eventPoints`            | Points for the `books` and `sigils` in `svs` and `allianceShowdown`.                       |

Each item also has the expert `id` and `name`.

## How it works

A skill level costs books and skill EXP. Only the levels after `current` up to `goal` count.

An expert advances at every affinity level that has an `advancementCost` (10, 20, and so on up
to 100) and needs the sigils to go past that level. A range that starts at or passes such a level
pays for the advancement. A goal at such a level pays only when `goalAdvanced` is true. Use it for
the final advancement at level 100. An expert that is already advanced at its current level
(`currentAdvanced`) does not pay again. The affinity points are the sum of the affinity needed for
each level gained.

## Event points

SvS and Alliance Showdown score each Book of Knowledge and each expert sigil, read from the scoring
rows of `events()`. King of Icefield and Hall of Chief have no such row. The result does not give
the speedup minutes, because the package has no value for the EXP that a minute of learning speedup
gives. The interface multiplies `speedupPointsPerMinute` with the minutes the user spends.

## Errors

An unknown expert `id` or skill `name` throws `Error`. A level that is not a whole number in range,
a goal below the current level, or an advanced flag on a level with no advancement cost throws
`RangeError`.

## Data and assumptions

The numbers come from the data behind `experts()`. The talent costs nothing, because it levels with
the relationship, so it is not in the result. The result has no event points. `EXPERT_MAX_LEVEL`
exports the 100.
