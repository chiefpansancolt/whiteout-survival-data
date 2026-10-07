# Chief Gear

The six Chief Gear equip slots and the shared upgrade table that every gear piece progresses
through. Use it to look up the materials, stat gain, power, and score of each upgrade step.

## Usage

```ts
import { chiefGear, chiefGearImage, chiefGearSlots } from "whiteout-survival-data";

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
```

## Query methods

| Method                               | Returns     | Description                                         |
| ------------------------------------ | ----------- | --------------------------------------------------- |
| `chiefGearSlots().byTroopType(type)` | slot query  | Slots that buff `Lancer`, `Infantry`, or `Marksman` |
| `chiefGear().byTier(tier)`           | level query | Rows with exactly this tier label                   |

`byTier('Epic')` does not match `EpicT1`. The terminal methods `get`, `first`, `find`, `findByName`,
`search`, and `count` are described in [How It Works](../../../README.md#how-it-works).

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

| Field                      | Meaning                                                            |
| -------------------------- | ------------------------------------------------------------------ |
| `tier`                     | Tier label of the source wiki, for example `Epic` or `LegendaryT3` |
| `stars`, `stage`           | Position in the tier. Both restart in each tier                    |
| `materials`                | Item ids from `items()` and the amount needed for the step         |
| `troopsDeploymentCapacity` | Deployment capacity gained. Absent for the first 26 rows           |
| `statTotalPercent`         | Total stat bonus at this step                                      |
| `powerTotal`               | Total power at this step                                           |
| `score`                    | Gear score that the step to this row adds                          |

The tiers are `Common`, `Rare`, `Epic`, `EpicT1`, `Mythic`, `MythicT1`, `MythicT2`, `Legendary`, and
`LegendaryT1` to `LegendaryT6`.

## Notes

The wiki gives `troopsDeploymentCapacity` only from Mythic T2 star 3 stage 1, so the first 26 rows
leave it unset.

The materials are Hardened Alloy, Polishing Solution, Design Plans, and Lunar Amber. Each one is
linked to its `items()` id by matching the material icon filename to the icon already downloaded for
that item.

The score is what events count. The rows "Raise max Chief Gear score by 1" pay 36 points per score
point in SvS and King of Icefield, 22 in Alliance Showdown, and 500 in Hall of Chief. The score does
not depend on power. A whole level scores 1,125 and 1,875 for the two Common levels, 3,000 to 5,440
for Rare, 3,230 to 4,085 for Epic, 6,250 for every Mythic level, and 9,560 for Legendary up to T3.
From Legendary T4 it is 15,560, 15,400, or 15,390. The steps that lead to a level split its score
evenly, and they add up to the level score for all 54 levels. The wiki event note confirms the
scores from Common to Legendary (1,125 up to 9,560). The Legendary T4 to T6 scores and the split
into steps come from WoS Tools only.

The slots were entered by hand from the prose of the wiki page, because no table lists them. The
3-piece and 6-piece set bonus from the same page is not modeled. The wiki describes it only as
"raise ... by x%" and gives no numbers.

A piece changes its look at the 5 rarity points only, not at each of the 150 rows. Every sub-tier
(`EpicT1`, `MythicT1`, `MythicT2`, `LegendaryT1` to `LegendaryT6`) uses the icon of its base rarity.
The star and stage counters on the source calculator are a UI overlay, not separate images.
