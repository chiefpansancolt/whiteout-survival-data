# Chief Charm

The three Chief Charm slots and the shared upgrade table that every charm progresses through. Use it
to look up the materials, stat gain, power, and score of each charm upgrade step.

## Usage

```ts
import { chiefCharm, chiefCharmImage, chiefCharmSlots } from "whiteout-survival-data";

// Every step of charm level 11
const level11 = chiefCharm().byLevel(11).get();

// Materials for one step. Charm Secrets first appears at level 11 stage 1
const step = chiefCharm().find("level-11-stage-1");
console.log(step?.materials.map((m) => m.itemId));

// Charm that buffs Marksman, and its icon at level 18
const marksman = chiefCharmSlots().byTroopType("Marksman").first();
if (marksman) console.log(chiefCharmImage(marksman, 18));
```

## Query methods

| Method                                | Returns     | Description                                         |
| ------------------------------------- | ----------- | --------------------------------------------------- |
| `chiefCharmSlots().byTroopType(type)` | slot query  | Slots that buff `Lancer`, `Infantry`, or `Marksman` |
| `chiefCharm().byLevel(level)`         | level query | Steps of one charm level                            |

The terminal methods `get`, `first`, `find`, `findByName`, `search`, and `count` are described in
[How It Works](../../../README.md#how-it-works). `chiefCharmImage(slot, level)` returns the icon of
a slot for a level from 1 to 18.

## Data

`chiefCharmSlots()` holds 3 slots (Infantry, Lancer, Marksman) from `data/chief/charm-slots.json`.
`images` is an array of 18 icons, so the icon of level `n` is `images[n - 1]`.

`chiefCharm()` holds 75 steps from `data/chief/charm-levels.json`. The table has the same shape as
the Chief Gear table, without deployment capacity. A step has `level`, `stage`, `materials` (item
ids from `items()` with amounts), `statTotalPercent`, `powerTotal`, and `score`.

## Notes

The materials are Charm Guide, Charm Design, and Charm Secrets. Charm Secrets appears only from
level 11 stage 1. The table lists exactly the materials that the raw table gives, so a step does not
always have three.

A charm changes its look at each of its 18 levels. For that reason `images` is a plain array and not
a map by rarity, as it is for Chief Gear.

The score is what events count. The rows "Raise Chief Charm max score by 1" pay 70 points per score
point in SvS and King of Icefield, 45 in Alliance Showdown, and 1,000 in Hall of Chief. The score
does not depend on power. A whole level scores 625, 1,250, 3,125, 8,750, 11,250, 12,500, 12,500,
13,000, 14,000, 15,000, 16,000, 17,000, 18,000, 19,000, 20,000, 21,000, 22,500, and 24,300 for
levels 1 to 18. The wiki event notes confirm levels 1 to 16. Levels 17 and 18 come from WoS Tools
only. A level with several steps splits its score evenly over them, with the remainder on the first
steps, as WoS Tools does. The game does not confirm this split. The steps that lead up to a level
carry its score, so the rows `level-4-stage-1`, `level-4-stage-2`, `level-4-stage-3`, and
`level-5-stage-0` together score 11,250, the whole score of level 5.
