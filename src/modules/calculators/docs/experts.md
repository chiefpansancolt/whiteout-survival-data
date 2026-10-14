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
| `learningMinutes`        | The `exp` divided by 60, rounded up: the minutes of learning time that the skills need.    |
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
rows of `events()`. King of Icefield and Hall of Chief have no such row. The `learningMinutes` of
the result are the minutes that the user needs in Learning or General Speedups. The interface
multiplies `speedupPointsPerMinute` with the minutes the user spends.

## Learning time

One minute of learning time gives 60 Skill EXP, so one EXP is one second.
`EXPERT_SKILL_EXP_PER_LEARNING_MINUTE` exports the 60. A skill level that costs 43,200 EXP takes 720
minutes, or 12 hours of learning. The result gives `learningMinutes` for each expert and for all
experts. The total is rounded up once from the total EXP, so it can be one minute below the sum of
the experts.

`EXPERT_LEARNING_QUEUE_OPTIONS` lists the sessions that an expert skill can learn, one at a time.
Each has a `label`, its `minutes`, and the `exp` that it earns, which is the minutes times 60. The
list is the package owner's, from the game.

| Option | Minutes | EXP     |
| ------ | ------- | ------- |
| 10 min | 10      | 600     |
| 2h     | 120     | 7,200   |
| 10h    | 600     | 36,000  |
| 24h    | 1,440   | 86,400  |
| 3d     | 4,320   | 259,200 |
| 5d     | 7,200   | 432,000 |

A Learning Speedup takes its minutes off the learning time, so a minute of Learning Speedup is worth
60 EXP. According to the package owner, a General Speedup counts toward skill learning at the same
rate. The calculator does not take an inventory of speedups, so `learningMinutes` is the number to
compare with the minutes that the user holds.

## Errors

An unknown expert `id` or skill `name` throws `Error`. A level that is not a whole number in range,
a goal below the current level, or an advanced flag on a level with no advancement cost throws
`RangeError`.

## Data and assumptions

The numbers come from the data behind `experts()`. One minute of learning is 60 EXP. At level 2 of
Fabian's Crisis Rescue, `experts()` has 33,053 EXP, so the learning minutes of that level round up
to 551. The talent costs nothing, because it levels with the relationship, so it is not in the
result. `EXPERT_MAX_LEVEL` exports the 100.
