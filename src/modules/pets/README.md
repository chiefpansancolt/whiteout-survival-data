# Pets

The 14 pets tamed at the Beast Cage, each with one troop bonus skill and a level table. Use it to
read pet unlock rules, skill values, and the cost and bonus of each pet level.

## Usage

```ts
import { pets } from "whiteout-survival-data";

// The Legendary pets
const legendary = pets().byRarity("Legendary").get();

// What the first pets need to unlock
const hyena = pets().find("cave-hyena");
console.log(hyena?.unlockRequirement); // { daysRequired: 54, furnaceLevel: 18 }

// The advancement score of the level 10 advancement
console.log(hyena?.levels[9].advancementScore); // 500
```

## Query methods

| Method        | Returns    | Description                                                     |
| ------------- | ---------- | --------------------------------------------------------------- |
| `byRarity(r)` | `PetQuery` | Pets of rarity `r`: Common, Uncommon, Rare, Epic, or Legendary. |

The shared terminal methods `get`, `first`, `find`, `findByName`, `search`, and `count` are
described in [How It Works](../../../README.md#how-it-works).

## Data

Pets are in `data/chief/pets.json`. There are 14 pets across 5 rarities: Common (1), Uncommon (2),
Rare (2), Epic (2), and Legendary (7). `maxLevel` follows rarity: 50, 60, 70, 80, and 100. Each
pet's single `skill` scales in tiers of `maxLevel / 10`. These are the same every-10-levels
milestones as the Advancement rows of the level table.

`unlockRequirement` always has `daysRequired`, the days since server start. It also has either
`furnaceLevel` or `prerequisitePet`. The three earliest pets need Furnace Lv.18. Every later pet
needs a set level on the pet before it in one linear chain, not a chain split by rarity.

Each entry in `levels` has `level`, `petFoodCost`, and a `troopAttack`, `troopDefense`, and
`troopsPower` triple. Each is a `{ value, refinedValue? }` pair. `refinedValue` appears only at
levels divisible by 10, the rows that also carry `advancementMaterials`, the items spent for that
advancement. Troop Attack and Troop Defense are separate fields, but they are equal at every level
of every pet in the roster.

A row with `advancementMaterials` also has `advancementScore`, the pet advancement score the
advancement adds. SvS, Alliance Showdown, and King of Icefield count it. It depends only on the
level, so it is the same for every pet.

| Level | 10  | 20    | 30    | 40    | 50    | 60    | 70     | 80     | 90     | 100    |
| ----- | --- | ----- | ----- | ----- | ----- | ----- | ------ | ------ | ------ | ------ |
| Score | 500 | 1,000 | 2,000 | 3,000 | 4,500 | 6,750 | 10,000 | 12,000 | 14,500 | 17,500 |

Most skills have a `values` array that scales with the effect's own percentage or flat number, such
as the Construction Speed bonus of Cave Hyena, and a flat `cooldownSeconds`. Musk Ox and Giant Elk
have a skill with no numeric effect to scale. Their cooldown shortens by tier instead. It is stored
in `cooldownSecondsByTier` and copied into `values`, so the tier count matches every other pet.

Images are in `images/pets/<Pet>/`, with the portrait next to a `skills/` folder. The skill image is
named `<Pet>-<SkillName>.<ext>`.

## Notes

`maxRefinementPercent` is stored for each pet (Cave Hyena: 6.70). It is about 4/3 of the largest
refined value in that pet's level table. Neither source wiki documents the mechanic, so the value is
stored as scraped and not derived.

The advancement score for levels 40 to 100 matches the event notes on the wiki. Levels 10 to 30 come
from WoS Tools only.

Each pet's `img` is the top-left profile portrait of its wiki page (`post_image`). It is not the
larger splash art further down the page. Only the portrait matches the compact style of the other
pet images.
