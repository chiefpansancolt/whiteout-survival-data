# calculateBuildings

Calculates the resources, build time, power, and event points to upgrade buildings, including the
buildings that the upgrades need first.

## Usage

```ts
import { calculateBuildings } from "whiteout-survival-data";

const result = calculateBuildings([{ id: "furnace", current: "4", goal: "6" }], {
  buildingLevels: { furnace: "4" },
  constructionSpeedPercent: 50,
});

result.steps.length; // 7: Furnace 5, Iron Mine 1 to 5, Furnace 6
result.resources; // wood 29225, coal 5770, iron 960, as itemId and amount
result.power; // 13810
result.baseSeconds; // 2518
result.seconds; // 1678, after the 50% bonus
result.unmetPrerequisites; // Hero Hall 1 and Shelter 3 at level 3
```

## Input

`calculateBuildings(goals, options)` takes a list of goals and an options object. Both default to
empty.

| Field                              | Type                            | Meaning                                                                        |
| ---------------------------------- | ------------------------------- | ------------------------------------------------------------------------------ |
| `id`                               | string                          | Building `id` from `buildings()`. Each building can appear once.               |
| `current`                          | string or null                  | Level `label` now. Use `null` for a building that is not built.                |
| `goal`                             | string                          | Level `label` to reach, such as `"30"`, `"30-1"`, or `"FC 3"`.                 |
| `options.buildingLevels`           | record of `id` to level `label` | Buildings you already have. A building that is not listed counts as not built. |
| `options.constructionSpeedPercent` | number                          | Total construction speed bonus in percent. Defaults to 0.                      |

## Result

| Field                    | Meaning                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| `steps`                  | Each level built, with `buildingId`, `level`, `prerequisite`, `cost`, `power`, and `baseSeconds`. |
| `resources`              | Wood, Coal, Iron, Meat, Fire Crystals, and Refined Fire Crystals as `itemId` amounts.             |
| `power`                  | Power gained. Each step adds its power minus the power of the level before it.                    |
| `baseSeconds`            | Build time before the speed bonus.                                                                |
| `seconds`                | Build time after the bonus, rounded down.                                                         |
| `speedupMinutesNeeded`   | Minutes of speedups that cover `seconds`, rounded up.                                             |
| `speedupPointsPerMinute` | Points for each speedup minute in `svs` and `kingOfIcefield`.                                     |
| `eventPoints`            | `svs` and `kingOfIcefield` points, and the `hallOfChief` list.                                    |
| `unmetPrerequisites`     | Prerequisites on a building that is not in `buildings()`.                                         |

## How it works

Each goal adds the levels after `current` up to `goal`. A level can need other buildings at a level.
The calculator adds the steps of those buildings first when they are below that level, so the totals
are the true cost. A step that comes from a prerequisite has `prerequisite` set to true.

The speed bonuses add up. A bonus of 50% turns 10 hours into 6 hours 40 minutes.

Speedups are not an input. The result gives `speedupMinutesNeeded` and `speedupPointsPerMinute`, and
the interface multiplies the points with the minutes the user spends.

SvS and King of Icefield score each Fire Crystal and each Refined Fire Crystal, read from the
scoring rows of `events()`. Hall of Chief scores each point of power gained.
`eventPoints.hallOfChief` lists each multiplier (`pointsPerPower`) with the event days that use it
and the points it gives.

## Errors

An unknown building `id`, a goal for a building that appears twice, or a building with a cost that
is not a resource throws `Error`. An unknown level `label`, a goal below the current level, or a
speed that is negative or not a finite number throws `RangeError`.

## Data and assumptions

A prerequisite on a building that is not in the data (the Hero Hall and the numbered Shelters on
some Furnace levels) adds no steps and appears in `unmetPrerequisites`. Only buildings with resource
costs can be calculated. The Daybreak Island buildings have costs such as Blueprints, so they throw
`Error`.
