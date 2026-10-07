# Experts

The 10 Dawn Academy Experts, recruited during Tundra Trek, with their skills, talent, and affinity
table. This module also holds the 11 relationship statuses an expert goes through. Use it to read
expert skill levels, costs, power, and affinity rewards.

## Usage

```ts
import { expertRelationships, experts } from "whiteout-survival-data";

// Names of the generation 1 experts
const firstGeneration = experts()
  .byGeneration(1)
  .get()
  .map((e) => e.name);

// The talent and the sigil cost of the first advancement for one expert
const gareth = experts().findByName("Gareth");
console.log(gareth?.talent.name, gareth?.affinityLevels[9].advancementCost);

// The relationship status at affinity level 45
console.log(expertRelationships().atAffinityLevel(45)?.name); // "Casual 1"
```

## Query methods

`experts()` returns an `ExpertQuery`.

| Method            | Returns       | Description                             |
| ----------------- | ------------- | --------------------------------------- |
| `byGeneration(n)` | `ExpertQuery` | Experts of generation `n` (1, 2, or 3). |

`expertRelationships()` returns an `ExpertRelationshipQuery`.

| Method               | Returns                           | Description                                                         |
| -------------------- | --------------------------------- | ------------------------------------------------------------------- |
| `atAffinityLevel(n)` | `ExpertRelationship \| undefined` | The status that applies at affinity level `n`. `undefined` below 1. |

Both queries also have the shared terminal methods `get`, `first`, `find`, `findByName`, `search`,
and `count`. They are described in [How It Works](../../../README.md#how-it-works).

## Data

Experts are in `data/chief/experts.json`. There are 10 experts across 3 generations (4, 4, and 2).
Each expert has these fields.

| Field            | Meaning                                                                          |
| ---------------- | -------------------------------------------------------------------------------- |
| `title`          | Narrative epithet, for example "Elite Politician".                               |
| `specialty`      | Mechanical category, for example "City Economy". It comes from a different wiki. |
| `baseBonuses`    | One or two stat bonuses. The value is the one reached at affinity level 100.     |
| `skills`         | Always 4 skills.                                                                 |
| `talent`         | One talent. It has the same `ExpertSkill` shape as a skill.                      |
| `affinityLevels` | 100 rows, one for each affinity level.                                           |

A skill or talent covers three mechanics. Most have `progressions`, which are named values that
scale per level, and a `costs` table of EXP and books per level. Agnes's talent has two independent
progressions, `Chest Gain` and `Daily Cap`. Baldur and Valeria have `milestoneRewards`, a flat base
value where leveling unlocks a fixed bundle of items at set levels. Agnes, Holger, and Baldur have a
`lootTable`, a random reward chest. A loot table can sit on a skill or on the talent.

Every skill and talent has a `Power` progression, the power each level adds. Max power for an expert
is the skills and talent at max level, plus the level 100 `levelPower`, plus the level 100
`affinityPowerAfterAdvancement`.

An `affinityLevels` row has `level`, `affinityRequired`, and the resulting `statBonus`. It also has
`advancementCost` at levels divisible by 10. That is the Sigil cost of the milestone. Summing the
column gives the "Total Sigils" figure other sources report for every expert checked (Agnes: 5 +
10 + ... + 50 = 275), so the module stores no separate recruitment cost.

Each row also has `levelPower` and `affinityPower`, the two power parts the Experts screen shows.
`affinityPowerAfterAdvancement` is set on rows with an `advancementCost`. All 10 experts have these
values on all 100 levels. They come from readings taken in the game and follow one rule. Affinity
power is the expert's gain times the advancement stage (levels 1 to 10 are stage 1, levels 11 to 20
are stage 2, and so on). `affinityPowerAfterAdvancement` uses the next stage. Level power is the
gain divided by 8, times the level plus 12. The gains are:

| Expert           | Gain    |
| ---------------- | ------- |
| Gareth           | 216,000 |
| Romulus, Valeria | 144,000 |
| Fabian, Kathy    | 108,000 |
| Holger, Ronne    | 86,400  |
| Baldur           | 57,600  |
| Agnes, Cyrille   | 43,200  |

### Relationships

Relationship statuses are in `data/chief/expert-relationships.json`. Each entry has a `level`, the
affinity level at which the status starts. The status lasts until the next one starts.

| Status               | Starts at affinity level |
| -------------------- | ------------------------ |
| Stranger             | 1                        |
| Acquaintance 1, 2, 3 | 10, 20, 30               |
| Casual 1, 2, 3       | 40, 50, 60               |
| Close 1, 2, 3        | 70, 80, 90               |
| Intimate             | 100                      |

Icons are in `images/experts/relationship/`. Expert images are in `images/experts/<Expert>/`, with
the portrait next to a `skills/` folder for the 4 skills and the talent. Skill images are named
`<Expert>-<SkillName>.<ext>`. Heroes and pets use the same layout.

## Notes

Gareth's Gifts of Iron had its Books and EXP columns swapped on the wiki (25,800 books for level 2).
The data uses WoS Tools instead, which lists 300 books and 7h 10m for level 2 and 13,500 books in
all. The books and EXP of the other nine experts agree with the pattern. A test checks that EXP is
above 20 times the books at every level.

Levels that were not read in the game are filled from the power rule above.

The Close 3 and Intimate relationship icons were captured while locked. The lock was painted out, so
a seam can show on them.
