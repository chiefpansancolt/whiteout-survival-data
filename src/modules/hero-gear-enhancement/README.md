# Hero Gear Enhancement

The base 100-level enhancement table that every piece of Hero Gear climbs. Use it to read the cost
and the unforged power of an enhancement level.

## Usage

```ts
import { heroGearEnhancement } from "whiteout-survival-data";

const levelOne = heroGearEnhancement().find("level-1");
console.log(levelOne?.cost); // [{ itemId: 'enhancement-xp', amount: 10 }]

const levelHundred = heroGearEnhancement().byLevel(100).first();
console.log(levelHundred?.power); // 271675
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
`{ itemId, amount }`, and `power`. Every level costs Enhancement XP. The amount is XP, so the
`itemId` is `enhancement-xp`, which is not in `items()`. A 100 Enhancement XP Component gives 100 XP
and a 10 Enhancement XP Component gives 10 XP.

## Notes

Like Chief Gear and Charms, Hero Gear has shared upgrade progressions and not a catalog of named
pieces. The exclusive piece of a Legendary hero is stored as `Hero.exclusiveWeapon` in
[`heroes()`](../heroes/README.md). A proposed gear quality list (Grey, Green, Blue, Purple, Gold)
was left out, because it is not an entity that is useful on its own.

`power` is the Power of a piece with no mastery forging at that level. A Mythic piece has 2,500
Power at level 0, and level 1 gives 2,900. The values continue through empowerment level 100, and
the Empowerment power continues from the power of level 100. See
[`heroGearEmpowerment()`](../hero-gear-empowerment/README.md).

Mastery forging multiplies the Power: a forged piece has the `power` of the level times 1 plus the
`statsUpPercent` of its [mastery forging](../hero-gear-mastery-forging/README.md) row, rounded down.
At enhancement level 100 with mastery forging 7-4 (+78%), 271,675 gives 483,581, which is the Power
shown in the game. `calculateHeroGear()` applies the forging.

The per piece stats of each level are in [`heroGearStats()`](../hero-gear-stats/README.md).
