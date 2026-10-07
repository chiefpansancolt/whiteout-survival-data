# Hero Gear Enhancement

The base 100-level enhancement table that every piece of Hero Gear climbs. Use it to read the cost
and cumulative power of an enhancement level.

## Usage

```ts
import { heroGearEnhancement } from "whiteout-survival-data";

const levelOne = heroGearEnhancement().find("level-1");
console.log(levelOne?.cost); // [{ itemId: 'enhancement-xp-component', amount: 10 }]

const levelHundred = heroGearEnhancement().byLevel(100).first();
console.log(levelHundred?.power); // 1086700
```

## Query methods

| Method       | Returns                    | Description                       |
| ------------ | -------------------------- | --------------------------------- |
| `byLevel(n)` | `HeroGearEnhancementQuery` | The row for enhancement level `n` |

The shared terminal methods (`get`, `first`, `find`, `findByName`, `search`, `count`) are described
in [How It Works](../../../README.md#how-it-works).

## Data

The data is in `data/chief/hero-gear-enhancement.json`. It has 100 rows, one for each level from 1
to 100. Each row has an `id` such as `level-1`, a `name`, the `level`, a `cost` list of
`{ itemId, amount }`, and `power`. Every level costs Enhancement XP Component
(`enhancement-xp-component` in `items()`).

## Notes

Like Chief Gear and Charms, the Hero Gear page describes shared upgrade progressions and not a
catalog of named pieces. The wiki has no detail page for a single piece of Hero Gear. The exclusive
piece of a Legendary hero is stored as `Hero.exclusiveWeapon` in [`heroes()`](../heroes/README.md).
A proposed gear quality list (Grey, Green, Blue, Purple, Gold) was left out, because it is not an
entity that is useful on its own.

`power` is cumulative from enhancement level 1 through empowerment level 100, as the wiki states it.
It is exactly 4 times the per piece power on WoS Tools at every level. The values keep the wiki
figure. Empowerment power continues from the power of level 100. See
[`heroGearEmpowerment()`](../hero-gear-empowerment/README.md).

The per piece stats of each level are in [`heroGearStats()`](../hero-gear-stats/README.md).
