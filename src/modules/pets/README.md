# Pets

The 14 pets tamed at the Beast Cage, each with one troop bonus skill and a level table. Use it to
read pet unlock rules, skill values, and the cost and bonus of each pet level.

## Usage

```ts
import { PET_REFINEMENT_STATS, petRefiningPower, pets } from "whiteout-survival-data";

// The Legendary pets
const legendary = pets().byRarity("Legendary").get();

// The six stats that pet refinement rolls
console.log(PET_REFINEMENT_STATS.map((s) => s.stat));
// ['Infantry Lethality', 'Infantry Health', 'Lancer Lethality', 'Lancer Health', 'Marksman Lethality', 'Marksman Health']

// The Refining Power of the six refined percents of a pet
console.log(petRefiningPower([2.56, 2.8, 2.39, 2.48, 2.39, 2.78])); // 184800

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
`prerequisitePet` has the `petId` of that pet, its `name`, and the `level` needed.

`daysRequired` follows the server timeline (`serverTimeline()`): day 54 for the first five pets,
then 90, 140, 200, 280, and 370 for the later ones.

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
refined value in that pet's level table. The value is stored as given and not derived.

Refinement rolls bonus stats on a pet. There are six: the Lethality and the Health of each troop
type, which are Infantry Lethality, Infantry Health, Lancer Lethality, Lancer Health, Marksman
Lethality, and Marksman Health. `PET_REFINEMENT_STATS` lists them with the `statKey` that
`research()` and the other modules use for the same stat. The package owner gave these six stats,
from the game.

A pet has three groups of Power: Level Power, Advancement Power, and Refining Power. The Refining
Power is 120 for each 0.01 percent of the six refined stats added up, so 12,000 for each 1 percent.
`PET_REFINING_POWER_PER_PERCENT` exports the 12,000 and `petRefiningPower(percents)` adds the six
percents of a pet in the order of `PET_REFINEMENT_STATS`. The rate is the same for every pet and
every rarity. The package owner read the Refining Power of 13 pets in the game, and all 13 match to
the unit. For example, Cave Hyena has 15.40 percent in all and 184,800 Power. `petRefiningPower`
throws `RangeError` for a percent that is negative or not a number.

The package stores the maximum refinement of each pet. The percent range of each quality (None,
Green, Blue, Purple, and Gold), the size of a step, and the Wild Mark cost of a roll are not stored.
A refinement rolls a new result that can be better or worse, refinement is irreversible, and a
refinement after a quality increase does not drop the quality.

Each pet's `img` is its profile portrait. It is not the larger splash art. Only the portrait matches
the compact style of the other pet images.
