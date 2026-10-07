# Hero Gear Mastery Forging

The Mastery Forging table, a system exclusive to Gold quality Hero Gear. Use it to read the cost and
the stats bonus of a mastery forging row.

## Usage

```ts
import { heroGearMasteryForging } from "whiteout-survival-data";

const levelFour = heroGearMasteryForging().byLevel(4).get();
console.log(levelFour.map((row) => row.id)); // level-4-stage-0 to level-4-stage-4

const last = heroGearMasteryForging().find("level-20-stage-0");
console.log(last?.statsUpPercent); // 200
console.log(last?.cost);
// [{ itemId: 'essence-stones', amount: 40 }, { itemId: 'custom-mythic-hero-gear-chest', amount: 2 }]
```

## Query methods

| Method       | Returns                       | Description                          |
| ------------ | ----------------------------- | ------------------------------------ |
| `byLevel(n)` | `HeroGearMasteryForgingQuery` | Every stage row of mastery level `n` |

The shared terminal methods (`get`, `first`, `find`, `findByName`, `search`, `count`) are described
in [How It Works](../../../README.md#how-it-works).

## Data

The data is in `data/chief/hero-gear-mastery-forging.json`. It has 84 rows. Levels 1 to 3 and level
20 have one row each (stage 0). Levels 4 to 19 have 5 rows each (stages 0 to 4). Each row has an
`id` such as `level-4-stage-2`, a `name`, the `level`, the `stage`, a `cost` list of
`{ itemId, amount }`, and `statsUpPercent`, the bonus to the stats of the piece. The bonus rises
from 10 at level 1 to 200 at level 20.

Every row costs Essence Stones. Custom Mythic Hero Gear Chests are added from `level-11-stage-0`.
Six rows of levels 11 to 13 have no chest cost: stages 1, 2, and 4 of level 11, stages 1 and 3 of
level 12, and stage 1 of level 13. Every row of levels 14 to 20 has a chest cost.

## Notes

The system is described in the prose of the wiki page. Mastery forging past `level-10-stage-0` needs
the piece at enhancement level 100. The rule comes from play in the game and is not stated by the
wiki or WoS Tools.

`heroGearStats()` values are multiplied by 1 plus the `statsUpPercent` of the row to get the stats
of a forged piece. See [`heroGearStats()`](../hero-gear-stats/README.md).
