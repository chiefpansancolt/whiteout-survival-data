# Troops

The cost and training time of every tier for the three troop types: Infantry, Lancer, and Marksman.
The troop calculator reads this table.

## Usage

```ts
import { troops } from "whiteout-survival-data";

const infantry = troops().find("infantry");
console.log(infantry?.tiers.length); // 12

const tier12 = infantry?.tiers.find((tier) => tier.tier === 12);
console.log(tier12?.trainingTimeSeconds); // 215
console.log(tier12?.promotionCost?.map((material) => material.amount)); // [ 3476, 2613, 604, 120 ]

console.log(
  troops()
    .get()
    .map((troop) => troop.name),
);
```

## Query methods

`troops()` has no filters of its own. The shared terminal methods (`get`, `first`, `find`,
`findByName`, `search`, `count`) are described in [How It Works](../../../README.md#how-it-works).

## Data

The data is in `data/chief/troops.json`. It has 3 entries (`infantry`, `lancer`, `marksman`), each
with `tiers` 1 to 12. A tier has `cost`, the meat, wood, coal, and iron for one troop, as
`{ itemId, amount }` entries. It also has `trainingTimeSeconds`, the seconds to train one troop with
no training speed bonus. Tier 12 also has `promotionCost`, the resources to promote one troop from
tier 11 to tier 12. No other tier has this field.

## Notes

The data comes from WoS Tools. The training time of a tier is the same for all three types, and the
costs differ. `promotionCost` is stored because it is not the difference of the two training costs.

The tier 12 costs are partly derived on WoS Tools. The Marksman promotion cost was measured in the
game, and the Infantry and Lancer promotion costs were scaled from it.
