# Experts

The 10 Dawn Academy Experts, recruited during Tundra Trek, with their skills, talent, and affinity
table. This module also holds the 11 relationship statuses an expert goes through. Use it to read
expert skill levels, costs, power, and affinity rewards. An expert that is announced and not yet
released is in `unreleasedExperts()`, with a name, an icon, and the unlock requirement only.

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

| Field               | Meaning                                                                                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `unlockRequirement` | `daysRequired`, the days since server start at which the expert unlocks, as on a pet. It is the day of the expert on the server timeline. It is 270 for Gareth. |
| `title`             | Narrative epithet, for example "Elite Politician".                                                                                                              |
| `specialty`         | Mechanical category, for example "City Economy".                                                                                                                |
| `baseBonuses`       | One or two stat bonuses. The value is the one reached at affinity level 100. A bonus has `stat`, `statKey`, `value`, `amount`, and `unit`.                      |
| `skills`            | Always 4 skills.                                                                                                                                                |
| `talent`            | One talent. It has the same `ExpertSkill` shape as a skill.                                                                                                     |
| `affinityLevels`    | 100 rows, one for each affinity level.                                                                                                                          |

The `generation` and the unlock day do not line up for two experts. Romulus is generation 1 and
unlocks on day 160, after the other generation 1 experts on day 120. Kathy is generation 3 and
unlocks on day 230, together with Ronne of generation 2. The data keeps both as they are.

A skill unlocks as the affinity level rises, and some skills have a cap on the level that an expert
can learn at an affinity level. The first skill unlocks at affinity level 10, and the next three at
20, 30, and 40. These fields are on a skill. A talent has neither, because it levels with the
affinity.

| Field                 | Meaning                                                                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `unlockAffinityLevel` | The affinity level at which the skill unlocks, after the advancement of that level. 10, 20, 30, and 40 for the four skills in order.                        |
| `levelCaps`           | `{ affinityLevel, maxLevel }` rows in ascending order. A row applies from its affinity level up to the next row. Only 12 skills of eight experts have them. |

The caps are the ones the data holds. The package owner confirmed in game the caps of Crowd Pleaser,
Call of War, Cartographic Memory, Salvager, Radiant Honor, and Gifts of Iron, and the unlock levels
of Undefeated Will and Fearsome Reputation. A skill without `levelCaps` has no known cap, and so has
a skill at an affinity level below its first row or above its last row. Gareth's Undefeated Will has
rows at 10 and 20, below its unlock at 30, and they have no effect until the skill is unlocked.

`expertSkillMaxLevel(skill, affinityLevel)` gives the highest level that an expert can learn of a
skill at an affinity level. It is 0 while the skill is locked. Affinity levels count in steps of 10,
so level 19 counts as 10, and the function returns the `maxLevel` of a talent.

```ts
import { experts, expertSkillMaxLevel } from "whiteout-survival-data";

const entrapment = experts().find("cyrille")!.skills[0];
expertSkillMaxLevel(entrapment, 15); // 10, no cap is known below affinity level 20
expertSkillMaxLevel(entrapment, 25); // 4
```

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
column gives the "Total Sigils" figure (Agnes: 5 + 10 + ... + 50 = 275), so the module stores no
separate recruitment cost.

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

### Unreleased experts

An expert that is announced and not yet released is in `experts.json` with `unreleased` set to
`true`. `unreleasedExperts()` returns these entries, and `experts()` leaves them out, so `experts()`
only has experts with skills, a talent, and affinity levels. An unreleased expert has an `id`, a
`name`, an `img`, the flag, and `unlockRequirement`, which holds `daysRequired`, the day since
server start at which the expert unlocks. The file has one, Justus, who unlocks after the generation
6 heroes, on day 360.

```ts
import { unreleasedExperts } from "whiteout-survival-data";

const justus = unreleasedExperts().find("justus");
console.log(justus?.name); // 'Justus'
console.log(justus?.unlockRequirement); // { daysRequired: 360 }
```

An unreleased expert has no skills, talent, bonuses, or affinity levels, and the calculator does not
accept its `id`. When the game releases the expert with its values, add the values to the entry and
remove the `unreleased` flag. The entry then moves to `experts()`.

Justus is expected in October 2026, after the generation 6 heroes unlock. The package does not hold
his skill names until the game states the values. The server timeline of this package has him on day
360, the day of the generation 6 heroes, and `unlockRequirement` has that day. The icon is scaled to
350 by 350 pixels like the other experts.

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

Gareth's Gifts of Iron has 300 books and 7h 10m for level 2 and 13,500 books in all. The books and
EXP of the other nine experts agree with the pattern. A test checks that EXP is above 20 times the
books at every level.

Levels that were not read in the game are filled from the power rule above.

The Close 3 and Intimate relationship icons were captured while locked. The lock was painted out, so
a seam can show on them.
