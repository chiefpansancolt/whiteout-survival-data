# Hero Gear Slots

The four equip slots of Hero Gear, with an icon for each: Goggles, Gloves, Belt, and Boots. Use it
to list the slots and show their icons. A hero has one piece of gear in each slot.

## Usage

```ts
import { heroGearSlots, heroGearStats } from "whiteout-survival-data";

console.log(heroGearSlots().count()); // 4
console.log(
  heroGearSlots()
    .get()
    .map((slot) => slot.name),
); // ['Goggles', 'Gloves', 'Belt', 'Boots']

const belt = heroGearSlots().find("belt");
console.log(belt?.images.lancer); // '/images/hero-gear/belt-lancer.png'

// The stats of one slot for a troop type
const stats = heroGearStats().bySlot("belt").byTroopType("lancer").first();
console.log(stats?.combatStat, stats?.percentStat); // 'Defense' 'Health'
```

## Query methods

`heroGearSlots()` has no filters of its own. The shared terminal methods (`get`, `first`, `find`,
`findByName`, `search`, `count`) are described in [How It Works](../../../README.md#how-it-works).

## Data

The data is in `data/chief/hero-gear-slots.json`. It has 4 entries in the order of the game. Each
entry has an `id` (`goggles`, `gloves`, `belt`, or `boots`), a `name`, and `images`, the icon of the
piece for `infantry`, `lancer`, and `marksman`. The `id` of a slot is the `slot` of
[`heroGearStats()`](../hero-gear-stats/README.md), which has the stats of each slot for the three
troop types. A slot and a troop type give the `id` of an entry there, such as `belt-lancer`, so
every entry of `heroGearStats()` has an icon.

## Notes

The 12 icons are in `images/hero-gear/`, named like `belt-lancer.png`. They are cropped from a
screenshot of the Gear tab of the Backpack in the game, which the package owner supplied. Each icon
is a 276 by 276 pixel PNG of one tile with its troop badge in the corner.

The background of the screen is clear. A flood fill removes the plain blue of the background, and
along a thin band at the edge the blue is taken out of each pixel to give a soft edge, so there is
no blue halo. The tile keeps its faint shadow at the bottom and right as a partly clear edge. The
colors are converted to sRGB, because the screenshot has a Display P3 profile.

The badge tells the types apart: a shield is Infantry, a spear is Lancer, and a crossbow is
Marksman. That reading of the badges is the package's, and the pieces differ by type in the same way
in the screenshot.
