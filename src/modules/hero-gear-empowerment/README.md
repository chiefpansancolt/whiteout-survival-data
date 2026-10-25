# Hero Gear Empowerment

The 100-level empowerment table that follows enhancement level 100. Use it to read the cost and
unforged power of an empowerment level.

## Usage

```ts
import { heroGearEmpowerment } from "whiteout-survival-data";

const levelTwenty = heroGearEmpowerment().byLevel(20).first();
console.log(levelTwenty?.cost);
// [{ itemId: 'custom-mythic-hero-gear-chest', amount: 3 }, { itemId: 'mithril', amount: 10 }]

const last = heroGearEmpowerment().find("level-100");
console.log(last?.power); // 1054175
```

## Query methods

| Method       | Returns                    | Description                       |
| ------------ | -------------------------- | --------------------------------- |
| `byLevel(n)` | `HeroGearEmpowermentQuery` | The row for empowerment level `n` |

The shared terminal methods (`get`, `first`, `find`, `findByName`, `search`, `count`) are described
in [How It Works](../../../README.md#how-it-works).

## Data

The data is in `data/chief/hero-gear-empowerment.json`. It has 100 rows, one for each level from 1
to 100. Each row has an `id`, a `name`, the `level`, a `cost` list of `{ itemId, amount }`, and
`power`. The rows of levels 20, 40, 60, 80, and 100 also have `milestonePower`. Level 1 costs 2
Custom Mythic Hero Gear Chests. Levels 20, 40, 60, 80, and 100 cost Custom Mythic Hero Gear Chests
and Mithril. Every other level costs Enhancement XP, with the `itemId` `enhancement-xp`, which is
not in `items()`.

| Level | Chests | Mithril |
| ----- | ------ | ------- |
| 20    | 3      | 10      |
| 40    | 5      | 20      |
| 60    | 5      | 30      |
| 80    | 10     | 40      |
| 100   | 10     | 50      |

## Notes

The cost items match `items()`, except `enhancement-xp`.

An empowered piece has reached enhancement level 100. The `power` values are the Power of a piece
with no mastery forging. They continue from the power of enhancement level 100, and mastery forging
multiplies them. See [`heroGearEnhancement()`](../hero-gear-enhancement/README.md). The milestone
bonuses at levels 20, 40, 60, 80, and 100 are in [`heroGearStats()`](../hero-gear-stats/README.md).

`milestonePower` is the flat Power of an empowerment milestone, 200,000 at each of levels 20, 40,
60, 80, and 100. The Power of a piece adds it for every milestone reached, after the mastery
forging, so the forging does not multiply it. The package owner checked the Power of pieces at
empowerment levels 20, 40, 60, 80, and 100 in the game. They were 200,000 for each milestone
reached, so 200,000, 400,000, 600,000, 800,000, and 1,000,000 above the forged Power from the table.
