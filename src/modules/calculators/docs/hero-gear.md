# calculateHeroGear

Calculates the resources, power, stats, and event points to level one hero gear piece through
mastery forging, enhancement, and empowerment.

## Usage

```ts
import { calculateHeroGear } from "whiteout-survival-data";

const result = calculateHeroGear({
  piece: { slot: "goggles", troopType: "infantry" },
  masteryForging: { current: null, goal: "level-3" },
  enhancement: { current: 0, goal: 100 },
  empowerment: { current: 0, goal: 20 },
});

result.resources; // essence-stones 60, enhancement-xp-component 125970, mithril 10, and more
result.power; // 1712700
result.eventPoints.svs; // 1680000
result.stats?.goal; // { combatStat: 538, health: 5265, percentStat: 78 }
```

## Input

`calculateHeroGear(goal)` plans one piece at a time. Every field is optional. A track that is left
out adds nothing.

| Field            | Type                  | Meaning                                                                                                   |
| ---------------- | --------------------- | --------------------------------------------------------------------------------------------------------- |
| `masteryForging` | `{ current, goal }`   | Row `id` values from `heroGearMasteryForging()`. `current` is `null` for a piece with no mastery forging. |
| `enhancement`    | `{ current, goal }`   | Levels 0 to 100, from `heroGearEnhancement()`.                                                            |
| `empowerment`    | `{ current, goal }`   | Levels 0 to 100, from `heroGearEmpowerment()`. Starts after enhancement level 100.                        |
| `piece`          | `{ slot, troopType }` | Adds the stats gain to the result. The slot is `goggles`, `gloves`, `belt`, or `boots`.                   |

## Result

| Field                       | Meaning                                                                                                                                   |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `masteryForging`            | `steps`, `resources`, and `statsUpPercent` of the track.                                                                                  |
| `enhancement`               | `steps`, `resources`, and `power` of the track.                                                                                           |
| `empowerment`               | `steps`, `resources`, and `power` of the track.                                                                                           |
| `resources`                 | Essence Stones, Custom Mythic Hero Gear Chests, Enhancement XP Components, and Mithril as `itemId` amounts, for all tracks.               |
| `power`                     | Power gained from enhancement and empowerment.                                                                                            |
| `currentPower`, `goalPower` | Power of the piece before and after the plan. Level 0 has no power.                                                                       |
| `eventPoints`               | Points in `svs`, `allianceShowdown`, and `kingOfIcefield`.                                                                                |
| `unmetRequirements`         | Requirements that the plan does not meet: tracks that need enhancement level 100, and empowerment that needs mastery forging at level 10. |
| `stats`                     | Stats of the piece, or `null` when the goal has no `piece`.                                                                               |

## How it works

The steps of a track are the rows after the current one up to and including the goal.

Mastery forging costs Essence Stones, with Custom Mythic Hero Gear Chests at the higher rows.
Enhancement costs Enhancement XP Components. After enhancement level 100 the piece is empowered.
Empowerment level 1 costs Mythic chests. Levels 20, 40, 60, 80, and 100 (the step from 19 to 20, 39
to 40, and so on) also cost Mithril. The empowerment power continues from the power of enhancement
level 100.

Mastery forging past `level-10-stage-0` and empowerment need enhancement at level 100.
`HERO_GEAR_ENHANCEMENT_REQUIREMENT` exports this rule as `{ afterRowId, enhancementLevel }`.
Empowerment also needs mastery forging at Level 10, the row `level-10-stage-0`.
`HERO_GEAR_EMPOWERMENT_REQUIREMENT` exports both parts: the `enhancementLevel` and the
`masteryForgingRowId`. The calculator does not throw for these rules. It lists the unmet ones in
`unmetRequirements`. An entry with an `enhancementLevel` is the enhancement rule, and it appears
when the goal has an `enhancement` range that ends below 100. An entry with a `masteryForgingRowId`
is the mastery forging rule for empowerment, and it appears when the goal has an `empowerment` goal
above 0 and a `masteryForging` range that ends below `level-10-stage-0`. A goal with no
`enhancement` range, or no `masteryForging` range, is not checked for that rule, because the
calculator does not know that state of the piece.

`eventPoints` scores the Essence Stones and the Mithril, read from the scoring rows of each event.

When the goal names a `piece`, `stats` holds the stats before the plan (`current`), after the plan
(`goal`), and the `gain`. Each block has `combatStat` (Attack for Goggles and Boots, Defense for
Gloves and Belt), flat `health`, and `percentStat` (Lethality for Goggles and Boots, Health for
Gloves and Belt). `combatStatName` and `percentStatName` give the names. `stats.milestones` lists
the Mithril bonuses that the plan unlocks, at empowerment levels 20, 40, 60, 80, and 100. The values
come from `heroGearStats()`, multiplied by the mastery forging (1 plus the `statsUpPercent` of the
row) and rounded down. Level 0 has no stats. A track that is not in the goal counts as level 0 with
no mastery forging. Give `enhancement: { current: 100, goal: 100 }` to get the stats of a mastery
forging only plan.

## Errors

An unknown mastery forging row throws `Error`. An enhancement or empowerment level that is not a
whole number from 0 to 100, or a goal below the current state, throws `RangeError`.

## Data and assumptions

`HERO_GEAR_MAX_ENHANCEMENT_LEVEL` and `HERO_GEAR_MAX_EMPOWERMENT_LEVEL` export the two 100s.

Empowerment needs a Mythic piece at Enhancement Level 100 and Mastery Level 10. Mastery Level 10 is
the row `level-10-stage-0`, which has a `statsUpPercent` of 100. The server must also be old enough
for the ascension, and the gear must be Mythic. The calculator checks neither of these. The
enhancement requirement comes from in-game play. Empowerment is Ascended +1 to +100 on a single 0 to
200 enhancement scale.

The `power` values are cumulative from enhancement level 1 through empowerment level 100.

Widgets are not part of this calculator. [calculateHeroUpgrade](hero-upgrade.md) plans the Widgets
for the exclusive weapon of a hero.
