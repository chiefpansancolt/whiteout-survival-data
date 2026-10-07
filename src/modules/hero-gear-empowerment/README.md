# Hero Gear Empowerment

The 100-level empowerment table that follows enhancement level 100. Use it to read the cost and
cumulative power of an empowerment level.

## Usage

```ts
import { heroGearEmpowerment } from "whiteout-survival-data";

const levelTwenty = heroGearEmpowerment().byLevel(20).first();
console.log(levelTwenty?.cost);
// [{ itemId: 'custom-mythic-hero-gear-chest', amount: 3 }, { itemId: 'mithril', amount: 10 }]

const last = heroGearEmpowerment().find("level-100");
console.log(last?.power); // 4216700
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
`power`. Level 1 costs 2 Custom Mythic Hero Gear Chests. Levels 20, 40, 60, 80, and 100 cost Custom
Mythic Hero Gear Chests and Mithril. Every other level costs Enhancement XP Component.

| Level | Chests | Mithril |
| ----- | ------ | ------- |
| 20    | 3      | 10      |
| 40    | 5      | 20      |
| 60    | 5      | 30      |
| 80    | 10     | 40      |
| 100   | 10     | 50      |

## Notes

The wiki gives this table no explanatory paragraph, unlike Enhancement and Mastery Forging. The
table is modeled as scraped. The cost items match `items()`, but the source does not say which
in-game action uses the table.

An empowered piece has reached enhancement level 100. The `power` values are cumulative from
enhancement level 1 through empowerment level 100, as the wiki states them, so they continue from
the power of enhancement level 100. They are exactly 4 times the per piece power on WoS Tools. WoS
Tools shows empowerment as Ascended +1 to +100 on a single 0 to 200 enhancement scale. The milestone
bonuses at levels 20, 40, 60, 80, and 100 are in [`heroGearStats()`](../hero-gear-stats/README.md).
