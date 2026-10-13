# Chief Gear

The six Chief Gear equip slots and the shared upgrade table that every gear piece progresses
through. Use it to look up the materials, stat gain, power, and score of each upgrade step.

## Usage

```ts
import {
  chiefGear,
  chiefGearImage,
  chiefGearSetBonus,
  chiefGearSlots,
} from "whiteout-survival-data";

// Slots that buff Infantry
const infantrySlots = chiefGearSlots().byTroopType("Infantry").get();

// Every row of the Epic tier
const epicRows = chiefGear().byTier("Epic").get();

// Materials for one upgrade step
const step = chiefGear().find("common-star-0");
console.log(step?.materials); // [{ itemId: 'hardened-alloy', amount: 1500 }, ...]

// Icon of a slot at the rarity of a level
const cap = chiefGearSlots().find("cap");
const level = chiefGear().find("epic-t1-star-0");
if (cap && level) console.log(chiefGearImage(cap, level));

// The set bonuses of the six pieces that a chief wears, by the id of each level
const sets = chiefGearSetBonus([
  "mythic-t1-star-0",
  "mythic-t1-star-1",
  "mythic-t1-star-2",
  "epic-star-0",
  "epic-star-0",
  "epic-star-0",
]);
console.log(sets.threePiece); // { pieces: 3, stat: 'Defense', percent: 8, tierId: 'mythic-t1' }
console.log(sets.sixPiece); // { pieces: 6, stat: 'Attack', percent: 0 }
```

## Query methods

| Method                               | Returns     | Description                                         |
| ------------------------------------ | ----------- | --------------------------------------------------- |
| `chiefGearSlots().byTroopType(type)` | slot query  | Slots that buff `Lancer`, `Infantry`, or `Marksman` |
| `chiefGear().byTier(tier)`           | level query | Rows with exactly this tier label                   |

`byTier('Epic')` does not match `EpicT1`. The terminal methods `get`, `first`, `find`, `findByName`,
`search`, and `count` are described in [How It Works](../../../README.md#how-it-works).

`chiefGearSetBonuses()` is the table of the set bonus of each tier. It has the shared terminal
methods only.

Two helpers work on the results. `chiefGearRarity(tier)` removes the `T` suffix from a tier label
and returns the base rarity. `chiefGearImage(slot, level)` returns the slot icon that matches the
base rarity of a level.

## Data

`chiefGearSlots()` holds 6 slots (Cap, Watch, Coat, Pants, Ring, Weapon) from
`data/chief/gear-slots.json`. Cap and Watch buff Lancer, Coat and Pants buff Infantry, and Ring and
Weapon buff Marksman. Each slot has `images`, one icon for each of the 5 rarities (`Common`, `Rare`,
`Epic`, `Mythic`, `Legendary`).

`chiefGear()` holds 150 rows from `data/chief/gear-levels.json`. Every equipped piece uses the same
table, so the rows are upgrade steps, not named items. A row has these fields.

| Field                      | Meaning                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| `order`                    | Position in the table, from 1 in row order                                                       |
| `tier`                     | Tier label, for example `Epic` or `LegendaryT3`                                                  |
| `tierId`                   | The tier in kebab case, such as `epic-t1`. It is the `id` of the tier in `chiefGearSetBonuses()` |
| `stars`, `stage`           | Position in the tier. Both restart in each tier                                                  |
| `materials`                | Item ids from `items()` and the amount needed for the step                                       |
| `troopsDeploymentCapacity` | Deployment capacity gained. Absent for the first 26 rows                                         |
| `statTotalPercent`         | Total stat bonus at this step                                                                    |
| `powerTotal`               | Total power at this step                                                                         |
| `score`                    | Gear score that the step to this row adds                                                        |

The tiers are `Common`, `Rare`, `Epic`, `EpicT1`, `Mythic`, `MythicT1`, `MythicT2`, `Legendary`, and
`LegendaryT1` to `LegendaryT6`.

## Notes

`troopsDeploymentCapacity` starts at Mythic T2 star 3 stage 1, so the first 26 rows leave it unset.

The materials are Hardened Alloy, Polishing Solution, Design Plans, and Lunar Amber. Each one is
linked to its `items()` id by matching the material icon filename to the icon already downloaded for
that item.

The score is what events count. The rows "Raise max Chief Gear score by 1" pay 36 points per score
point in SvS and King of Icefield, 22 in Alliance Showdown, and 500 in Hall of Chief. The score does
not depend on power. A whole level scores 1,125 and 1,875 for the two Common levels, 3,000 to 5,440
for Rare, 3,230 to 4,085 for Epic, 6,250 for every Mythic level, and 9,560 for Legendary up to T3.
From Legendary T4 it is 15,560, 15,400, or 15,390. The steps that lead to a level split its score
evenly, and they add up to the level score for all 54 levels.

The set bonus is described in the section below.

A piece changes its look at the 5 rarity points only, not at each of the 150 rows. Every sub-tier
(`EpicT1`, `MythicT1`, `MythicT2`, `LegendaryT1` to `LegendaryT6`) uses the icon of its base rarity.
The star and stage counters are a UI overlay, not separate images.

## Set bonus

A chief that wears 3 pieces of the same quality gets a Defense bonus for Infantry, Lancer, and
Marksman. A chief that wears all 6 pieces of the same quality also gets an Attack bonus for all
three. The Chief profile in the game shows the values behind a triangle icon (3 pieces) and a circle
icon (6 pieces).

`chiefGearSetBonus(levelIds)` takes the ids of the `chiefGear()` levels of the pieces worn, at most
6, and returns `threePiece` and `sixPiece`. Each has `pieces`, `stat`, `percent`, and `tierId`. A
bonus that is not active has a `percent` of 0 and no `tierId`. The constant `CHIEF_GEAR_SET_BONUS`
holds the two rules: 3 pieces for `Defense`, 6 pieces for `Attack`, on all three troop types.

The percent of each tier is in `data/chief/gear-set-bonuses.json`, one entry for each of the 14
tiers with an `id`, a `name`, and the `percent`. The `id` is the `tierId` of the levels, so
`chiefGearSetBonuses().find(level.tierId)` gives the set bonus of a level. The package owner states
that each tier has one value, and the 3 piece bonus and the 6 piece bonus have the same value.

| Tier         | Percent |
| ------------ | ------- |
| Common       | 5       |
| Rare         | 5.5     |
| Epic         | 6       |
| Epic T1      | 6.5     |
| Mythic       | 7       |
| Mythic T1    | 8       |
| Mythic T2    | 9       |
| Legendary    | 10      |
| Legendary T1 | 12      |
| Legendary T2 | 14      |
| Legendary T3 | 16      |
| Legendary T4 | 18      |
| Legendary T5 | 20      |
| Legendary T6 | 22      |

The package owner read the values of Mythic T1 (8), Mythic T2 (9), Legendary T1 (12), and Legendary
T2 (14) in the game. The other values are assumptions of the owner. The step is 1 from Mythic T1 to
Mythic T2 and 2 from Legendary T1 to Legendary T2, and the other values continue that rise. Check
the other values in the game before you rely on them.

The rules of the calculation are also assumptions. Pieces count by the tier of their level, so two
levels of one tier match. The 3 piece bonus uses the highest tier that has at least 3 pieces. The 6
piece bonus needs all 6 pieces in one tier. A higher tier does not count toward a lower one.
