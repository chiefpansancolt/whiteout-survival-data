# calculateResearch

Calculates the resources, time, and power for upgrading research lines from a current level to a
goal level.

## Usage

```ts
import { calculateResearch } from "whiteout-survival-data";

const result = calculateResearch([{ id: "assaut-techniques-i", current: 0, goal: 3 }], {
  researchSpeedPercent: 20,
  stateBuff: true,
});
result.steps; // 3
result.power; // 12600
result.baseSeconds; // 1140
result.researchSpeedPercent; // 30
result.seconds; // 876
result.buildingRequirements; // [{ id: 'research-center', level: '7' }]
```

## Input

| Field                          | Type                       | Meaning                                                                  |
| ------------------------------ | -------------------------- | ------------------------------------------------------------------------ |
| `goals`                        | `ResearchGoal[]`           | One entry for each research line to upgrade. Defaults to `[]`.           |
| `options.researchSpeedPercent` | `number`                   | Your speed as the game shows it, without the buffs below. Defaults to 0. |
| `options.stateBuff`            | `boolean`                  | Adds 10% research speed.                                                 |
| `options.vicePresident`        | `'regular'` or `'supreme'` | Adds 10% research speed (15% for supreme).                               |

A goal is `{ id, current, goal }`. The `id` comes from `research()`. The levels go from 0 (not
started) up to the number of levels of the line. Each tier of a research line is its own line with
its own levels, as in the game.

## Result

| Field                  | Meaning                                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| `items`                | One entry for each goal with `id`, `name`, `category`, `steps`, `resources`, `power`, and `baseSeconds`. |
| `steps`                | Number of levels bought.                                                                                 |
| `resources`            | Total amount of each item, as `{ itemId, amount }`.                                                      |
| `power`                | Power gained.                                                                                            |
| `baseSeconds`          | The research time of all steps added together, before the speed bonus.                                   |
| `researchSpeedPercent` | The speed in percent that `seconds` uses, with the buffs added.                                          |
| `seconds`              | The time after the speed bonus, rounded down.                                                            |
| `stepsWithoutTime`     | The number of steps that have no time in the data. They count as 0 seconds.                              |
| `unmetPrerequisites`   | Levels that need another research line at a level that the plan does not reach.                          |
| `buildingRequirements` | The highest building level that the steps need, such as `war-academy` at `FC 5`.                         |

## How it works

Only the levels after `current` up to `goal` count, so a goal equal to the current level costs
nothing. The calculator adds the cost, power, and time of those levels.

The time is the base time of all levels of all goals added together, divided by 1 plus the research
speed, and rounded down. The speed is `researchSpeedPercent` plus `stateBuff` and `vicePresident`.
`RESEARCH_CALCULATOR` is exported and holds the two buffs (`stateBuffSpeedPercent` 10 and
`vicePresidentSpeedPercent`).

A level can need another research line at a level. The calculator takes the highest of the `current`
and `goal` levels you gave for that line as the planned level, and 0 when the line is not in the
goals. When the planned level is below the need, the level goes to `unmetPrerequisites` with the
line it requires and the planned level. In the example, the first level needs
`special-defensive-training-i` at level 1, which the plan does not include.

For building prerequisites, `buildingRequirements` keeps the highest level for each building,
compared by its order in `buildings()`.

## Errors

An `Error` is thrown when a goal names a research line that does not exist. A `RangeError` is thrown
when a level is not a whole number from 0 to the number of levels of the line, when a goal is below
its current level, and when `researchSpeedPercent` is negative.

## Data and assumptions

The lines come from `research()`, which has 290 lines. Levels without a research time in the data
count as 0 seconds, and `stepsWithoutTime` tells you how many there are. Prerequisites are only
checked against the goals you pass, not against the research you already have, so add the lines you
own as goals with `current` and `goal` equal to your level to avoid false entries in
`unmetPrerequisites`.
