# VIP

The VIP 1 to 12 progression: the XP each level costs and the bonuses it unlocks. Use it to see what
a VIP level gives or which level a total XP amount reaches.

## Usage

```ts
import { vip } from "whiteout-survival-data";

// One level and its bonuses
const vip9 = vip().byLevel(9).first();
console.log(vip9?.bonuses.map((b) => `${b.stat} ${b.value}`));

// The level reached with 1,000,000 total XP
console.log(vip().atXp(1_000_000).first()?.name); // 'VIP 9'

// Total XP to reach VIP 12 from the start
const totalXp = vip()
  .get()
  .reduce((sum, level) => sum + level.xpRequired, 0);
console.log(totalXp); // 4800000
```

## Query methods

| Method           | Returns   | Description                                              |
| ---------------- | --------- | -------------------------------------------------------- |
| `byLevel(level)` | VIP query | The given VIP level                                      |
| `atXp(totalXp)`  | VIP query | The highest level that the total XP reaches, or no level |

`atXp` adds up `xpRequired` from the first level and keeps the last level that the total XP covers.
The terminal methods `get`, `first`, `find`, `findByName`, `search`, and `count` are described in
[How It Works](../../../README.md#how-it-works).

## Data

The module holds 12 levels from `data/vip.json`. Each level has these fields.

| Field        | Meaning                                                                    |
| ------------ | -------------------------------------------------------------------------- |
| `level`      | VIP level from 1 to 12                                                     |
| `xpRequired` | XP to go from the previous level to this one. It is `0` for VIP 1          |
| `bonuses`    | Total bonuses active at this level, not the change from the previous level |

A bonus has `stat`, `value`, `amount`, and `unit`. `value` is the display string of the source, for
example `"+16%"`, `"+1"`, or `"+1.1M"`. `amount` and `unit` are the parsed form: `16` and
`'percent'`, `1` and `'flat'`, or `1100000` and `'flat'`. The `K` and `M` capacity suffixes are
expanded to the full number. Use `amount` and `unit` to add up or compare bonuses, and `value` to
display them.

## Notes

The data comes from `https://www.whiteoutsurvival.wiki/vip/`. The page has no HTML table. The data
is a single official infographic image, and it is complete and precise for all 12 levels.

`xpRequired` is not a running total. The source image shows `-` for VIP 1, which is stored as `0`.
The sum of all `xpRequired` values is 4,800,000, the XP needed to reach VIP 12 from the start.

Bonuses accumulate. Resource Production Speed appears at every level with a higher value. Storehouse
Capacity, March Queue, and Troop Formation also grow this way. The combat bonuses start at VIP 9
with Troops Defense. Troops Attack, Health, and Lethality join at VIP 10, 11, and 12.
