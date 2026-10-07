# Alliance Territory

The build-cost table for the Alliance Territory banner, by level range. Use it to find what a banner
level costs in resources.

## Usage

```ts
import { allianceBanner } from "whiteout-survival-data";

// The range that contains banner level 14
allianceBanner().atLevel(14).first()?.name; // 'Level 11-15'

// Cost to build a banner at level 125
allianceBanner().atLevel(125).first()?.cost;
// [{ itemId: 'meat', amount: 49500 }, { itemId: 'wood', amount: 49500 }, { itemId: 'coal', amount: 10000 }]

// All ranges
allianceBanner().count(); // 37
```

## Query methods

| Method       | Returns               | Description                                        |
| ------------ | --------------------- | -------------------------------------------------- |
| `atLevel(n)` | `AllianceBannerQuery` | Keeps the range where `minLevel <= n <= maxLevel`. |

The shared terminal methods (`get`, `first`, `find`, `findByName`, `search`, `count`) are described
in [How It Works](../../../../README.md#how-it-works).

## Data

The data is in `data/alliance/alliance-territory.json`. It has 37 entries, one per level range. Each
entry has `id` (such as `level-11-15`), `name`, `minLevel`, `maxLevel`, and `cost`, a list of
`{ itemId, amount }` where `itemId` is an id from `items()`. The first range, Level 0-10, has an
empty `cost`.

## Notes

The source is `https://www.whiteoutsurvival.wiki/territory/alliance-territory/`. The page has no
per-level table. Banners are built and leveled within level ranges, and every level in a range costs
the same. For this reason the type stores `minLevel` and `maxLevel` and not a single `level`.

Meat and Wood are always required in equal amounts. Coal is added from Level 121-130, and Iron from
Level 146-150. The wiki row for Level 51-60 lists the Meat icon twice instead of Meat then Wood. The
amounts are equal either way, so the second `itemId` is corrected to `wood`.
