# calculateBeasts

Calculates how many beasts or Polar Terrors a stamina budget pays for, and the event points that
they score. You can plan some hunts first, such as the beasts of Intel missions, and see what the
stamina left pays for. It can use Gina's Endurance Training skill, which lowers the stamina of each
hunt.

## Usage

```ts
import { calculateBeasts } from "whiteout-survival-data";

const result = calculateBeasts({
  stamina: 600,
  beastLevel: 12,
  beastRuns: [
    { level: 12, count: 10 },
    { level: 26, count: 4 },
  ],
  polarTerrors: 3,
});
result.planned; // { beasts: 14, polarTerrors: 3, staminaNeeded: 215, staminaShort: 0, staminaLeft: 385 }
result.beasts; // { count: 38, staminaLeft: 5 }
result.polarTerrors; // { count: 15, staminaLeft: 10 }
result.events[0].plannedPoints; // 235500
result.events[0].beastPoints; // 606000
```

## Input

| Field            | Type         | Meaning                                                                                   |
| ---------------- | ------------ | ----------------------------------------------------------------------------------------- |
| `stamina`        | `number`     | Stamina that you have. A whole number of 0 or more. Defaults to 0.                        |
| `staminaCans`    | `number`     | Stamina cans that you have, 10 stamina each. A whole number. Defaults to 0.               |
| `beastLevel`     | `number`     | Level 1 to 30 of the beasts that the stamina left after the planned hunts.                |
| `beastRuns`      | `BeastRun[]` | Beast hunts that you plan, as `{ level, count }`. The level is 1 to 30. Defaults to none. |
| `polarTerrors`   | `number`     | Polar Terror hunts that you plan. A whole number of 0 or more. Defaults to 0.             |
| `ginaSkillLevel` | `number`     | Level 1 to 5 of Gina's Endurance Training skill. Leave out when Gina is not used.         |

Use `beastRuns` for hunts that you do anyway, such as the beasts of the Intel missions of a day.
Each run has its own level, because State of Power pays by level band. A planned hunt costs stamina
like any other hunt.

## Result

| Field                    | Meaning                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `totalStamina`           | `stamina` plus 10 for each stamina can.                                                                     |
| `ginaReductionPercent`   | The percent that Gina takes off the stamina of a hunt. 0 when Gina is not used.                             |
| `beastStaminaCost`       | The stamina of one beast after the reduction, as a whole number.                                            |
| `polarTerrorStaminaCost` | The stamina of one Polar Terror after the reduction, as a whole number.                                     |
| `planned`                | The planned hunts: `beasts` and `polarTerrors`, the `staminaNeeded`, the `staminaShort`, and `staminaLeft`. |
| `beasts`                 | `count` of beasts that the stamina left pays for, and the `staminaLeft` after them.                         |
| `polarTerrors`           | `count` of Polar Terrors that the stamina left pays for, and the `staminaLeft`.                             |
| `events`                 | One entry for each event that scores hunts. See below.                                                      |

`planned.staminaShort` is 0 when the stamina pays for the planned hunts. When the plan costs more,
it holds the stamina that is missing, `planned.staminaLeft` is 0, and `beasts` and `polarTerrors`
are 0.

Each entry of `events` has the `eventId` and `name` of the event, `pointsPerBeast` for `beastLevel`,
and `pointsPerPolarTerror`. It also has these points.

| Field               | Meaning                                                                            |
| ------------------- | ---------------------------------------------------------------------------------- |
| `beastRuns`         | The planned runs, each with `level`, `count`, `pointsPerBeast`, and `points`.      |
| `plannedPoints`     | The points of the planned beast runs and Polar Terrors.                            |
| `beastPoints`       | The planned points plus the points of hunting beasts with the stamina left.        |
| `polarTerrorPoints` | The planned points plus the points of hunting Polar Terrors with the stamina left. |

The events are State of Power (`svs-state-of-power`), Defeat Nearby Beasts, and Tundra Games, in
that order. With no planned hunts, `plannedPoints` is 0 and the stamina left is all of the stamina,
so `beastPoints` is the plan that hunts only beasts and `polarTerrorPoints` is the plan that hunts
only Polar Terrors.

## How it works

A beast costs 10 stamina and a Polar Terror costs 25. Gina's Endurance Training takes a percent off
each cost: 10%, 12%, 15%, 18%, and 20% at levels 1 to 5. The percents come from the
`Stamina Cost Reduction` effects of the skill in `heroes()`. The reduced cost is rounded to the
nearest whole number, and a half rounds up, so a Polar Terror costs 23 stamina at level 1 and 21 at
level 4.

The planned hunts cost the number of beasts times the cost of a beast, plus the number of Polar
Terrors times the cost of a Polar Terror. The stamina left is the total stamina minus that cost. The
number of extra hunts is the stamina left divided by the cost of one hunt, rounded down. The stamina
that is left after them cannot pay for one more hunt.

The points come from the scoring rows of each event in `events()`. State of Power pays a different
amount for a beast in each level band, and 30,000 for a Polar Terror. The calculator picks the row
whose level range holds the level of the run. The other two events pay the same for every beast
level.

The State of Power row for the 11,250 points reads "Lv. 20 to 25", so level 20 is in the row before
it as well. A level 20 beast scores the 10,500 of the 16 to 20 row, and levels 21 to 25 score
11,250.

`BEAST_CALCULATOR` is exported and holds the stamina of a beast and a Polar Terror, the stamina of a
can, and the top beast level. Use it to show the same choices in an app.

## Errors

A `RangeError` is thrown when `stamina`, `staminaCans`, `polarTerrors`, or the `count` of a run is
not a whole number of 0 or more. It is also thrown when `beastLevel` or the `level` of a run is not
a whole number from 1 to 30, or when `ginaSkillLevel` is not a whole number from 1 to 5.

## Data and assumptions

The stamina of a beast, a Polar Terror, and a can, and the rounding of the reduced cost, are the
statements of the package owner. The result has no Valeria bonus for State of Power. Hunts that are
not beasts or Polar Terrors, such as the Bear Hunt, are not in the calculator.
