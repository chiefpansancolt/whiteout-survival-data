# Troops

The cost, training time, power, and unlock requirements of every tier for the three troop types:
Infantry, Lancer, and Marksman. The troop calculator reads this table.

## Usage

```ts
import { highestTierAtCampLevel, troopPower, troops } from "whiteout-survival-data";

const infantry = troops().find("infantry");
console.log(infantry?.tiers.length); // 12

const tier12 = infantry?.tiers.find((tier) => tier.tier === 12);
console.log(tier12?.trainingTimeSeconds); // 215
console.log(tier12?.promotionCost?.map((material) => material.amount)); // [ 3476, 2613, 604, 120 ]
console.log(tier12?.power); // 178

// The power of one troop at a Fire Crystal level, for tiers 10 and 11
console.log(troopPower(infantry!, 11, 10)); // 148
console.log(troopPower(infantry!, 11)); // 80, the base power

// The highest tier that a camp level can train
console.log(highestTierAtCampLevel(infantry!, 19)?.tier); // 7

// What tier 11 needs
console.log(infantry?.tiers[10].unlockRequirements);
// [ { type: 'building', id: 'war-academy', level: 'FC 1' }, { type: 'research', id: 'helios-infantry', level: 1 } ]

console.log(
  troops()
    .get()
    .map((troop) => troop.name),
);
```

## Query methods

`troops()` has no filters of its own. The shared terminal methods (`get`, `first`, `find`,
`findByName`, `search`, `count`) are described in [How It Works](../../../README.md#how-it-works).

`troopPower(troop, tier, fireCrystalLevel)` returns the power of one troop of a tier at a Fire
Crystal level. Level 0, the default, is the base power. A tier that does not change with the Fire
Crystal level returns its base power at any level. The result is `undefined` for an unknown tier, or
for a level above 10 on tier 10 or 11.

`highestTierAtCampLevel(troop, campLevel)` returns the highest tier that the camp of the troop type
can train at a camp level, or `undefined` below camp level 1. It never returns tier 11 or 12,
because those tiers do not depend on the camp level.

## Data

The data is in `data/chief/troops.json`. It has 3 entries (`infantry`, `lancer`, `marksman`), each
with `tiers` 1 to 12. A tier has `cost`, the meat, wood, coal, and iron for one troop, as
`{ itemId, amount }` entries. It also has `trainingTimeSeconds`, the seconds to train one troop with
no training speed bonus. Tier 12 also has `promotionCost`, the resources to promote one troop from
tier 11 to tier 12. No other tier has this field.

A tier has `power`, the power of one troop at Fire Crystal level 0. The three types have the same
power at each tier:

| Tier  | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  | 11  | 12  |
| ----- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Power | 3   | 4   | 6   | 9   | 13  | 20  | 28  | 38  | 50  | 66  | 80  | 178 |

Tiers 1 to 10 have `unlockCampLevel`, the level of the camp of the type that unlocks the tier: 1, 4,
7, 11, 13, 16, 19, 22, 26, and 30. Tiers 11 and 12 have `unlockRequirements` instead, in the same
shape as the requirements of `research()`. Tier 11 needs the War Academy at `FC 1` and the Helios
research of the type. Tier 12 needs the War Academy at `FC 10` and the Exalted research of the type.
The `id` of a research requirement is the capstone node: `helios-infantry` and `exalted-infantry`,
and the same for the other two types.

## Notes

The training time of a tier is the same for all three types, and the costs differ. `promotionCost`
is stored because it is not the difference of the two training costs.

Tiers 10 and 11 have `fireCrystalPower`, a list of `{ level, power }` entries for Fire Crystal
levels 1 to 10. Level 0 is the `power` of the tier. The three types have the same values, and the
base values agree with `power`. Tier 12 does not change with the Fire Crystal level and has no
table, so tier 12 has no `fireCrystalPower`.

The camp levels are the same for the Infantry, Lancer, and Marksman camps.

Tier 11 requires War Academy Fire Crystal level 1 and completing Helios Research level 5 for that
troop type. Helios Research level 5 is the research tier of `helios-infantry` in `research()`. Tier
12 needs War Academy FC10 plus the Exalted research tracks. The Exalted research tracks end in the
node `exalted-infantry`, so the package links to that node. It is not known whether tiers 11 and 12
also need a camp level.

The tier 12 costs are partly derived. The Marksman promotion cost was measured in the game, and the
Infantry and Lancer promotion costs were scaled from it.

Power of one troop at each Fire Crystal level, for tiers 10 and 11:

| Tier | FC 0 | FC 1 | FC 2 | FC 3 | FC 4 | FC 5 | FC 6 | FC 7 | FC 8 | FC 9 | FC 10 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ----- |
| 10   | 66   | 71   | 76   | 83   | 88   | 94   | 99   | 104  | 110  | 115  | 121   |
| 11   | 80   | 86   | 92   | 100  | 106  | 114  | 120  | 126  | 135  | 141  | 148   |
