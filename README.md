# whiteout-survival-data

<div align="center">
  <h3>A comprehensive, fully-typed dataset for Whiteout Survival</h3>
  <p>Structured JSON data, image assets, and a chainable query builder API for heroes, buildings, research, pets, and more.</p>

![GitHub Release](https://img.shields.io/github/v/release/chiefpansancolt/whiteout-survival-data?style=flat-square)

</div>

> ⚠️ **Work in progress.** This package has not had a first release yet. Data is still being
> gathered, cross-checked, and corrected, so some fields are placeholders, some values may be wrong,
> and the API surface can still change without notice. Treat everything here as unstable until the
> first tagged release.

---

## 📦 Installation

```bash
npm install whiteout-survival-data
# or
pnpm add whiteout-survival-data
```

---

## 🚀 Quick Start

Every module exports a **factory function** that returns a chainable query builder.

```ts
import { buildings } from "whiteout-survival-data";

const furnace = buildings().findByName("Furnace");
furnace.levels.find((l) => l.label === "FC 10");
```

---

## ⚙️ How It Works

All standard modules follow the same **query builder pattern** built on a shared `QueryBase<T>`
class:

```ts
factory() // Start with all data
  .filterMethod() // Chain filters (returns new query)
  .sortMethod() // Chain sorts (returns new query)
  .terminalMethod(); // Get results
```

### Terminal Methods

Every query builder provides these 6 terminal methods:

| Method              | Returns          | Description                           |
| ------------------- | ---------------- | ------------------------------------- |
| `.get()`            | `T[]`            | All results as an array               |
| `.first()`          | `T \| undefined` | First result                          |
| `.find(id)`         | `T \| undefined` | Find by exact ID                      |
| `.findByName(name)` | `T \| undefined` | Find by name (case-insensitive)       |
| `.search(query)`    | `T[]`            | Partial name match (case-insensitive) |
| `.count()`          | `number`         | Number of results                     |

---

## 📚 Modules

### 🏠 Buildings

| Module    | Factory       | Items | Description                                       |
| --------- | ------------- | ----- | ------------------------------------------------- |
| buildings | `buildings()` | 27    | Buildings with full per-level upgrade progression |

Every `Building` carries a `category` — `Military` (Furnace, Embassy, Research Center, Command
Center, the three Camps, War Academy, Infirmary, Storehouse, Barricade), `Inner City` (Hunter's Hut,
Sawmill, Coal Mine, Iron Mine, Clinic, Cookhouse, Shelter), or `Entertainment` (the nine buildings
below) — filterable via `buildings().byCategory(...)`.

Each `Building` nests its full level-by-level progression under `levels`. Most buildings follow an
80-level shape: standard Levels 1–30, then a 50-entry Fire Crystal extension (`30-1..30-4`, then
`FC 1` through `FC 9` — each with a base row and four sub-levels `FC N-1..FC N-4` — ending at
`FC 10` alone, the max level). Fire Crystal levels add Fire Crystals (from `FC 1`) and Refined Fire
Crystals (from `FC 5-1`) to the cost. Some buildings (e.g. Research Center) cap out at standard
Level 30 with no Fire Crystal tier at all — for those, `fireCrystalImg` is omitted and
`maxLevelLabel` is just the final numeric level.

The source wikis show no Prerequisites column for Fire Crystal levels, but each one still requires
the previous Fire Crystal level of that same building to be complete first — `prerequisites` is
derived rather than scraped for this range, self-referencing the building by name:

- A tier's base row (`FC N`) requires the previous tier's last sub-level (`FC (N-1)-4`).
- A tier's first sub-level (`FC N-1`) requires the previous tier's base row (`FC (N-1)`).
- A tier's remaining sub-levels (`FC N-2..4`) each require the one directly before them.
- The pre-FC stage (`30-1..30-4`) chains off the building's own standard Level 30.
- `FC 1-1` is the one exception: since the pre-FC stage has no separate base row, it requires
  standard Level 30 directly instead of a "tier 0" base.

Every `BuildingLevel` carries a `developmentIndex` — the score each level contributes toward the SvS
Wish Station event, confirmed for every level of every building from the package maintainer's own
in-game data (not sourced from either wiki, which don't document this metric).

- **Furnace** — the town HQ; caps every other building's max level.
- **Embassy** — stores Alliance reinforcements and gates Alliance assistance; every standard level
  requires the Furnace at the matching level (Levels 1–8 all just require Furnace Lv.8). Carries
  `allyAssists`, `allyHelpTimeSeconds`, and `reinforceCapacity` at every level, from the
  maintainer's in-game data.
- **Research Center** — unlocks Growth, Economy, and Battle research; caps at Level 30 with no Fire
  Crystal tier. Levels 1–9 all just require Furnace Lv.9, then it tracks the Furnace level for level
  10 on. Carries `researchSpeedBonusPercent` at every level.
- **Command Center** — increases Rally and March troop capacity (`rallyCapacity`/`marchCapacity` on
  each level) alongside power. Every standard level requires both Furnace (Lv.10 minimum, then
  matching from Level 11 on) and Embassy at the matching level. Unlike Furnace/Embassy, its Fire
  Crystal levels also carry an explicit cross-building gate straight from the wiki: every level in a
  group of 5 (a tier's 4 sub-levels plus the next tier's base row) requires Furnace and Embassy at a
  matching Fire Crystal tier, in addition to Command Center's own derived same-building chain.
- **Infantry Camp / Marksman Camp / Lancer Camp** — train and upgrade their respective troop type;
  identical cost, power, and Fire Crystal progression across all three, differing only in their
  Furnace prerequisite floor (Lv.7, Lv.8, and Lv.9 respectively, then matching from one level above
  the floor on) and troop type. Each level carries `trainingCapacity` and
  `trainingSpeedBonusPercent` — the latter is set on every standard level but only on Fire Crystal
  tier base rows (`FC 1`..`FC 10`), matching the wiki, which shows no value on sub-levels or the
  pre-FC stage. Fire Crystal levels carry a Furnace-only cross-building gate (no Embassy), on top of
  the same derived same-building chain as Command Center. `trainingCapacity` comes from the wiki for
  levels 1 to 30. The 50 levels from 30-1 to FC 10 come from WoS Tools: 234 at FC 1 up to 459 at FC
  10, with 5 more for each sub-level. The levels 30-1 to 30-4 follow the same 5-step rule from 209
  at level 30.
- **War Academy** — researches Marksman/Infantry/Lancer technologies and unlocks T11 units. The one
  building so far with no standard tier and no pre-FC stage at all: it unlocks directly at `FC 1`
  (zero cost) once the Furnace reaches Fire Crystal Level 1, tracking the Furnace FC tier throughout
  (46 levels total, not 80). `fireCrystalImg` is omitted, matching Research Center's precedent,
  since there's no separate base/FC visual distinction to make. `FC 1` itself has no same-building
  `prerequisites` entry (nothing precedes it), and `FC 1-1` requires `FC 1` directly rather than the
  usual "previous tier's base" rule, since there's no tier 0 to jump back to. Every level (not just
  FC tier base rows) carries a `researchSpeedBonusPercent`.
- **Infirmary** — heals injured troops; if it fills up, troops die in battle instead. Standard shape
  (80 levels, Furnace-only gate, Lv.8 floor). Carries `infirmaryCapacity`, sparse like the troop
  camps' speed bonus (every standard level, then only FC tier base rows).
- **Storehouse** — protects resources beyond plunder up to its capacity. Caps at Level 30 with no
  Fire Crystal tier (Furnace Lv.9 floor); its cost/power/time curve is identical to Embassy's.
  Carries `storehouseCapacity` at every level.
- **Barricade** — strengthens city defense durability. The shortest tracked building by far: caps at
  Level 10 with no Fire Crystal tier, and Level 1 has no prerequisite at all (unique among tracked
  buildings). Its remaining levels skip several Furnace levels between gates (e.g. Level 2 needs
  only Furnace Lv.7, Level 3 needs Lv.10) rather than tracking every Furnace level. Carries
  `barricadeDurability` at every level.
- **Hunter's Hut / Sawmill / Coal Mine / Iron Mine** — the four basic resource-production buildings
  (Meat, Wood, Coal, and Iron respectively). All four share an identical cost/power/time curve
  through Level 30, then each gets exactly one bonus level beyond that: a sole `FC 1`,
  byte-identical across all four buildings (6,000,000 Wood/Meat, 1,200,000 Coal, 300,000 Iron, 2
  seconds, 31,618 power) and requiring Furnace **FC 2** (not FC 1) plus their own Level 30 — no Fire
  Crystals in its cost despite the label. `maxLevelLabel` is `"FC 1"` for these four, not `"30"`.
  They differ from each other only in their standard Furnace prerequisite floor — Sawmill and
  Hunter's Hut track the Furnace level exactly from Level 1, Coal Mine's Levels 1–3 all just require
  Furnace Lv.3, and Iron Mine's Levels 1–5 all just require Furnace Lv.5.
- **Clinic / Cookhouse / Shelter** — three small buildings absent from `wostools.net` entirely (only
  `whiteoutsurvival.wiki` covers them, cross-checked against its raw HTML rather than an
  AI-summarized fetch, since a sole bonus level is easy for a summary to drop). All three cap at
  just Level 10, then get one bonus `FC 1` level — unlike the four production buildings, this one
  correctly requires Furnace **FC 1** (matching, no tier skip) plus the building's own Level 10.
  Cookhouse and Shelter track the Furnace level exactly from Level 1; Clinic's Levels 1–4 all just
  require Furnace Lv.4. Clinic and Cookhouse share an identical cost/power/time curve; Shelter's is
  its own, generally cheaper curve. `Shelter` is modeled as a single building (matching how the wiki
  itself scopes the page), even though players can construct up to eight — the Furnace's own
  `prerequisites` text separately references specific numbered instances (e.g. `"Shelter 1"`,
  `"Shelter 3"`) as plain strings, not tied to this entry.

**The Bakery, The Vinyl Shop, Tea Milk Shop, Cinema, Cafe, Gym, Farm, Yoga Studio, and Climbing
Gym** are entertainment buildings with no upgrade path — a single `levels` entry each
(`maxLevelLabel: "1"`), gated behind a Furnace Fire Crystal level (FC 3, FC 4, or FC 5 depending on
the building) rather than a standard-level Furnace floor. Sourced from the package maintainer's own
in-game data rather than either wiki. None have a published portrait yet, so `img` is omitted
entirely for these nine rather than carrying a placeholder — `Building.img` is optional for this
reason. Their `cost` entries are furniture pieces (not raw materials) and carry a `pricePerItem` the
other buildings' costs don't, since these are purchased individually rather than built from a single
resource pool. Every level also carries `troopDeploymentCapacity`, alongside the `power` and
`developmentIndex` every building tracks.

### 🏛️ Facilities

| Module     | Factory        | Items | Description                               |
| ---------- | -------------- | ----- | ----------------------------------------- |
| facilities | `facilities()` | 9     | Buildings with no levels, power, or costs |

A handful of buildings are purely functional gameplay hubs — no upgrade levels, no power
contribution, no build cost. Forcing them into `Building` would leave `levels`, `power`, and
`maxLevelLabel` all meaningless, so they get their own minimal shape instead:

```ts
export interface Facility {
  id: string;
  name: string;
  img: string;
  description: string;
}
```

**Hero Hall**, **Dawn Academy**, **Beast Cage**, **Lighthouse**, **Arena**, **Chief's House**,
**Explorer's Cabin**, **Suggestion Box**, and **Enlistment Office** — each is a single entry with
just a name, icon, and a description of what it does in-game (recruiting heroes, PvP ranking,
edicts, and so on). Enlistment Office replaces Troops lost in battle from a reserve pool once the
Infirmary's injured-Troops capacity is exceeded, gated by accumulated Loyalty (capacity 4x the
Infirmary's own).

---

### 🦸 Heroes

| Module | Factory    | Items | Description                                        |
| ------ | ---------- | ----- | -------------------------------------------------- |
| heroes | `heroes()` | 65    | Heroes with stats, skills, and shard-upgrade costs |

Every hero has a `rarity` (`Rare`/`Epic`/`Legendary`), a `class` (`Infantry`/`Lancer`/`Marksman`),
and a `subClass` (`Growth`/`Combat`) — `subClass` is stored per hero rather than derived, since it
doesn't follow a strict rule from rarity or class (e.g. Gina and Jasser are both Epic Marksman, but
Gina is `Combat` and Jasser is `Growth`).

Stats have two groups: `exploration` (flat `attack`/`defense`/`health`) and `expedition`
(`attack`/`defense` as percentages). Skills are grouped the same way a hero's in-game skill tabs
are: `skills.exploration[]`, `skills.expedition[]`, and an optional `skills.talent`. Rare/Epic
heroes have 2 Exploration + 2 Expedition skills and no Talent; every Legendary hero has 3 + 3, but
the Talent tab is empty on the wiki for every Legendary hero except **Jeronimo** and **Natalia**
(Generation 1's two Infantry heroes) — `skills.talent` is `undefined` for every other Legendary hero
rather than a fabricated empty entry.

The stats stored on a hero are its level 80, 5-star stats. `estimateHeroStats(hero, star, tier)`
estimates the stats of a hero at level 80 for a lower star, where `star` is 0 to 5 and `tier` is 0
to 5 inside the star, as the in-game label `star.tier` (3.2 is star 3, tier 2). It returns
`exploration` and `expedition` stats and `estimated: false` only at 5 stars, where it returns the
stored stats. `HERO_STAT_ESTIMATE` exports the ranges it accepts.

The formula is the one on the WoS Tools Hero Hub compare tab. It scales a hero's stats by the ratio
of its own 5-star stats to a reference hero, grows the stat by a step for each star, and adds 14.7%
of the star's step for each tier. The Exploration star growth is 1.376 and not the 1.4 of WoS Tools,
fitted to Hector at level 80: his in-game stats at 3.0 are 2,130 attack, 2,765 defense, and 41,569
health, and the estimate is within 0.3%. The promotion previews of 3.0 to 3.1 and 3.2 to 3.3 (+102
attack, +133 defense, +1,998 health, +14.31 Expedition) match the tier step too. It is still an
estimate: it has only been checked against Hector at 3.0 to 3.3, the 3.2 step is about 10% larger in
the game than the formula gives, and there is no data for other hero levels, so it only covers
level 80.

The sample page `sample/hero-compare.html` compares two heroes at any star and tier, like the Hero
Hub compare tab. It also has boxes for your in-game numbers, and shows how far the estimate is from
them, so you can test the formula against more readings.

Every `HeroSkill` carries its own `levels` array — 5 entries
(`{ level, manualsRequired, powerGain, starRequired }`), matching the 5 slash-separated values in
that skill's `description` (e.g. Smith's Hammer Burn: "200%/220%/240%/260%/280%"). `manualsRequired`
is confirmed and identical across every Exploration/Expedition skill and hero (0 / 10 / 30 / 50 / 75
for Levels 1–5) — except Jeronimo's and Natalia's Talent skill, which needs no Manuals at all, so
`manualsRequired` is `0` at every level. `starRequired` — the hero star tier needed before that
skill level unlocks — is also confirmed for Exploration/Expedition, and varies by skill _slot_
rather than skill identity: a hero's 1st/2nd/3rd Exploration skill and 1st/2nd Expedition skill each
follow their own star curve (e.g. a 1st Exploration skill unlocks its levels at Stars 0/1/2/3/4,
while a 3rd Exploration or 2nd Expedition skill needs Stars 2/2/2/3/4). The Talent skill's
`starRequired` is real (a star tier does gate it) but not yet sourced, so it stays a `0` placeholder
for Jeronimo and Natalia pending the real curve. `powerGain` is confirmed for every
Exploration/Expedition skill regardless of rarity — identical across every skill regardless of slot
(Rare: 540 / 2,030 / 3,780 / 6,426 / 10,152; Epic: 720 / 2,707 / 5,040 / 8,568 / 13,536; Legendary:
900 / 3,380 / 6,300 / 10,710 / 16,920 for Levels 1–5). The Talent skill's `powerGain` remains a `0`
placeholder, since the source states Power per Legendary hero level as "all 6 skills," excluding
Talent.

`exclusiveWeapon` is present only on Legendary heroes — the wiki calls this the hero's "Special"
item. It carries its own bonus stat block — using `lethality`/`health` percentages for its
Expedition stats, a different stat pair than the hero's own Expedition block — plus a `power` rating
and two `ExclusiveWeaponSkill` entries (`{ name, img, description, unlockLevel? }`). Unlike a
regular `HeroSkill`, these don't scale across 5 levels; each has one fixed effect that activates
once the Special item reaches `unlockLevel` (most state this on the wiki as a "(Lv. N)" suffix; a
handful of newer heroes' pages omit it, so `unlockLevel` is left unset rather than guessed).

`shardCosts` is a 5-star × 6-tier cost table present on every hero; the per-tier costs are identical
across rarities, and so are the Total column values, which always match the sum of that tier's own
costs. Each star tier also carries a `power` field — the total Power accumulated once that star is
reached, not the increment gained at that tier alone. Confirmed for Rare and Epic, and for every
Legendary hero through Generation 4: the source only states the total Power at max star, so each
tier's `power` is that total distributed cumulatively by its share of the shards needed to reach max
star (the standard 1,065 total), on the assumption that every shard contributes equally. Stars 1–5,
cumulative:

| Rarity / Hero  | Star 1 | Star 2 | Star 3  | Star 4  | Star 5 (max) |
| -------------- | ------ | ------ | ------- | ------- | ------------ |
| Rare           | 4,222  | 21,111 | 69,667  | 196,335 | 449,670      |
| Epic           | 5,197  | 25,983 | 85,744  | 241,643 | 553,440      |
| Molly / Zinman | 6,496  | 32,479 | 107,180 | 302,054 | 691,800      |
| Natalia        | 7,145  | 35,727 | 117,898 | 332,259 | 760,980      |
| Jeronimo       | 8,120  | 40,599 | 133,975 | 377,567 | 864,750      |
| Generation 2   | 7,795  | 38,975 | 128,616 | 362,464 | 830,160      |
| Generation 3   | 9,744  | 48,718 | 160,770 | 453,080 | 1,037,700    |
| Generation 4   | 12,017 | 60,086 | 198,284 | 558,799 | 1,279,830    |

Legendary Generations 5–17 have no confirmed max-star Power yet, so `power` stays a `0` placeholder
for those heroes.

The three Generation 5 heroes (Hector, Norah, and Gwen) also have Hero Power read in the game, which
is not part of the table above. `powerAtStarZero` is the power at star 0 (22,200, twice the level 1
power of 11,100), and `tierPower` on stars 1 to 3 lists the power at each of the six tiers (1.1 to
3.6, ending at 449,772). Stars 4 and 5 are not read yet. These readings show that power per tier is
not spread evenly over the shards, so the cumulative `power` values above are a projection. The
reading at tier 3.4 was entered as 352,258, which does not fit the other readings, and is stored as
352,314 until it is checked in the game.

`shardSources` lists where a hero's shards can be obtained (e.g. `["VIP Packs"]`,
`["Hall of Heroes", "Daily Deals"]`) — transcribed verbatim from each hero's own "Sources" section
on the wiki. Empty for the one Gen 0 hero (Ling Xue) whose page has no Sources section at all.

`shardImg` is an optional icon of the hero's shard, set for the 13 heroes whose shard icon has been
captured (Gina, Molly, Zinman, Flint, Philly, Alonso, Logan, Reina, Gwen, Wu Ming, Gordon, Hendrik,
and Magnus). It lives in the hero's image folder as `<Name>-Shard.png`, and the matching hero shard
item in `items()` points to the same file.

`Hero.levels` is the 80-level Furnace/XP/Power progression, replacing the old flat `levelPower`
field. `furnaceLevelRequired` (the Furnace level needed to reach that hero level) and `xpRequired`
(Hero XP needed from the previous level, `0` at Level 1) are identical across every hero — the same
curve regardless of rarity, class, or generation.

`power` (the total Power accumulated once that level is reached, not the increment) is confirmed via
a single shared 80-entry curve, documented in `HeroLevelPowerCurve.md`: the gain at level L is
`start * base[L] / 250` (integer division, exact for every known start value), and `power` is the
running total of those gains. Only the Level-1 `start` value differs by rarity/generation — 3,250
for Rare, 4,000 for Epic, and 5,000/6,000/7,500/9,250/11,100 for Legendary Generations 1–5
(Generations 3–5's start values are themselves marked "projected" in that spec, not measured
in-game) — while `base` (summing to 9,330, with intentional dips at Levels 3, 19, 52, and 67 and a
jump at Level 80) is identical across all of them. This reproduces the spec's checkpoint table
exactly for every rarity/generation it covers (e.g. Rare Level 10/40/80: 9,945 / 42,185 / 121,290;
Legendary Gen 1: 15,300 / 64,900 / 186,600). Legendary Generations 6–17 have no confirmed start
value yet, so `power` stays a `0` placeholder for those — the spec explicitly warns against
extrapolating one. **Jeronimo is a confirmed individual exception** to his own generation's shared
value: his start is 6,250 (not Gen 1's 5,000), giving a Level 80 total of 233,250 instead of 186,600
— everything else about the curve (the `base` array, the formula) is identical.

Covers all 65 heroes released so far: **Generation 0** (13 pre-Legendary heroes: 4 Rare, 9 Epic) and
**Legendary Generations 1–17** (52 heroes — Generation 1 has 4, since two of its heroes, Jeronimo
and Natalia, are both Infantry; every other generation has exactly 1 Infantry, 1 Lancer, and 1
Marksman). Later generations will be added once the source wiki publishes them.

---

### 🧑‍🏫 Experts

| Module  | Factory     | Items | Description                                            |
| ------- | ----------- | ----- | ------------------------------------------------------ |
| experts | `experts()` | 10    | Dawn Academy Experts with skills, talent, and affinity |

The 10 Experts recruited during Tundra Trek and stationed at the Dawn Academy (see the `facilities`
module), across 3 generations (4/4/2). Each has a `title` (narrative epithet, e.g. "Elite
Politician") and a separate `specialty` (mechanical category, e.g. "City Economy") — genuinely
different fields sourced from different wikis, not the same value scraped twice.

`baseBonuses` is 1–2 stat bonuses (the value reached at Affinity Level 100). `skills` is always 4
entries plus a separate `talent`, both sharing the same `ExpertSkill` shape — but that shape covers
several distinct in-game mechanics found while transcribing the full roster, not just one:

- Most skills/talents have one or more `progressions` (a named value that scales per level, e.g.
  Agnes's talent has both `"Chest Gain"` and `"Daily Cap"` scaling independently) plus a `costs`
  table (EXP/Books per level).
- Every skill and talent has a `"Power"` progression, the power its level adds, with one value for
  each level. The experts sample page adds these up for each expert and for all experts at the top.
  Max power is the skills and talent at max level, plus the level 100 `levelPower` and the level 100
  `affinityPowerAfterAdvancement`.
- Some have `milestoneRewards` instead — a flat, non-scaling base value where leveling unlocks a
  fixed one-time item bundle at specific levels (e.g. Baldur's "Blazing Sunrise" grants a fixed
  reward set at levels 1, 6, and 10) rather than a continuously increasing stat.
- Some have a `lootTable` (a random-reward chest, on either a skill or the talent — confirmed
  present on both, not talent-exclusive).

Each `affinityLevels` row can also carry `levelPower` and `affinityPower`, the two power parts that
the Experts screen shows, plus `affinityPowerAfterAdvancement` on a level with an `advancementCost`.
They come from readings taken in the game, and every expert has them on all 100 levels. Both follow
one rule. Affinity power is the expert's gain times the advancement stage (levels 1 to 10 are stage
1, levels 11 to 20 are stage 2, and so on), and `affinityPowerAfterAdvancement` is the next stage.
Level power is the gain divided by 8, times the level plus 12. The gains are Gareth 216,000, Romulus
and Valeria 144,000, Fabian and Kathy 108,000, Holger and Ronne 86,400, Baldur 57,600, and Agnes and
Cyrille 43,200. Levels that were not read in the game are filled from this rule.

`expertRelationships()` lists the 11 relationship statuses that every expert goes through, with an
icon under `images/experts/relationship/` and the affinity `level` at which each starts: Stranger
(1), Acquaintance 1 to 3 (10, 20, 30), Casual 1 to 3 (40, 50, 60), Close 1 to 3 (70, 80, 90), and
Intimate (100). `atAffinityLevel(level)` returns the status for a level. The Close 3 and Intimate
icons were captured while locked, so the lock was painted out and a seam can show on them.

Gareth's Gifts of Iron had its Books and EXP columns swapped on the wiki (25,800 books for level 2).
They were corrected from WoS Tools, which lists 300 books and 7h 10m for level 2 and 13,500 books in
all. The other nine experts' books and EXP agree with the pattern, and a test checks that EXP is
above 20 times the books at every level.

`affinityLevels` is a 100-row table (`level`, `affinityRequired`, an optional `advancementCost` —
present only at levels divisible by 10 — and the resulting `statBonus`). `advancementCost` is the
per-milestone "Sigil" cost; summing the column reproduces the aggregate "Total Sigils" figure
reported elsewhere for every expert checked (e.g. Agnes: 5+10+...+50 = 275), so no separate
recruitment-cost field is stored — it would just be redundant, derivable data.

Images are organized one folder per expert (`images/experts/<Expert>/`), portrait alongside a
`skills/` subfolder covering all 4 skills plus the talent, the same convention `images/heroes/` and
`images/pets/` use — each is named `<Expert>-<SkillName>.<ext>`.

---

### 🪖 Troops

| Module | Factory    | Items | Description                                                        |
| ------ | ---------- | ----- | ------------------------------------------------------------------ |
| troops | `troops()` | 3     | Infantry, Lancer, and Marksman with the cost and time of each tier |

Each troop type lists tiers 1 to 12. A tier has `cost`, the meat, wood, coal, and iron for one
troop, and `trainingTimeSeconds`, the seconds to train one troop with no training speed bonus. Tier
12 also has `promotionCost`, the resources to promote one troop from tier 11 to tier 12, because
that is not the difference of the two training costs. The data comes from WoS Tools. The training
time of a tier is the same for all three types, and the costs differ. The tier 12 costs are partly
derived on WoS Tools: the Marksman promotion cost was measured in the game, and the Infantry and
Lancer costs were scaled from it. The troop calculator reads this table.

---

### 🐾 Pets

| Module | Factory  | Items | Description                                              |
| ------ | -------- | ----- | -------------------------------------------------------- |
| pets   | `pets()` | 14    | Beast Cage pets with a troop bonus skill and level table |

The 14 pets tamed at the Beast Cage (see the `facilities` module), across 5 rarities: Common (1),
Uncommon (2), Rare (2), Epic (2), and Legendary (7). `maxLevel` varies with rarity
(50/60/70/80/100), and each pet's single `skill` scales in tiers of `maxLevel / 10` — the same
every-10-levels milestones that drive the level table's "Advancement" rows.

`unlockRequirement` always carries a `daysRequired` gate (days since server start), plus either a
`furnaceLevel` (the three earliest pets, all requiring Furnace Lv.18) or a `prerequisitePet` (every
later pet, requiring a specific level on the pet immediately before it in a single linear chain —
not branched by rarity). `Troop Attack` and `Troop Defense` are tracked as independent fields on
every level, but are identical at every level for every pet in the current roster.

Each `PetLevel` carries a `troopAttack`/`troopDefense`/`troopsPower` triple, each a
`{ value, refinedValue? }` pair — `refinedValue` appears only at levels divisible by 10, the same
rows that carry `advancementMaterials` (the items spent to earn that jump). A `maxRefinementPercent`
field is stored per pet (e.g. Cave Hyena: 6.70%) — it is consistently about 4/3 of the per-level
table's own max refined value, but neither source wiki documents the underlying mechanic, so it's
kept as a flat scraped field rather than a derived one.

Each row with `advancementMaterials` also has `advancementScore`, the pet advancement score that the
advancement adds, which SvS, Alliance Showdown, and King of Icefield count. It depends only on the
level, so it is the same for every pet: 500, 1,000, 2,000, 3,000, 4,500, 6,750, 10,000, 12,000,
14,500, and 17,500 at levels 10 to 100. Levels 40 to 100 match the wiki's event notes, and levels 10
to 30 come from WoS Tools only.

Most skills have a `values` array that scales with the effect's own percentage or flat number (e.g.
Cave Hyena's Construction Speed bonus) and a flat `cooldownSeconds`. A few pets (Musk Ox, Giant Elk)
have a skill with no numeric effect to scale — instead, the _cooldown itself_ shortens per tier,
tracked in `cooldownSecondsByTier` and mirrored into `values` so the tier count still lines up with
every other pet's shape.

Every pet's `img` is the page's own top-left profile portrait (the wiki's `post_image`), not the
larger splash art embedded further down in each page's description — the two are different assets,
and only the profile portrait matches the compact style used by every other pet's image. Images are
organized one folder per pet (`images/pets/<Pet>/`), portrait alongside a `skills/` subfolder, the
same convention `images/heroes/` uses — the single skill image is named `<Pet>-<SkillName>.<ext>`.

---

### 📦 Items

| Module | Factory   | Items | Description                                                       |
| ------ | --------- | ----- | ----------------------------------------------------------------- |
| items  | `items()` | 273   | Functional items — resources, currencies, chests, buffs, and more |

Sourced from the wiki's master item catalog page, which covers 415 items across 18 category tabs.
Birthday Card entries are skipped (a yearly login freebie with no gameplay data worth tracking), and
the remaining 17 tabs split into two modules by kind: functional items go here, cosmetic skins go to
`skins()` below.

`category` is one of 11 values (`Hero Items`, `Pet`, `Gear Materials`, `Chest`, `Buff`,
`Fire Crystal`, `Experts`, `Teleporter`, `Others`, `Event`, `Speedups`). The first 10 are taken
directly from the wiki's own tab labels. `Speedups` holds the 21 general and type-specific speedup
items (1m to 8h), which the wiki catalog does not list. Their icons are cropped from in-game
Backpack screenshots, and the 3h and 8h icons for most types are not added yet. Five items are
tagged under more than one tab on the source site (all involving Chest, e.g. Seeker's Chest is
tagged both `Chest` and `Experts`) — `Chest` wins as the resolved category in every case, since it's
the more specific classification. `id` is the item's own wiki URL slug rather than a
freshly-slugified name, since several names repeat across categories (e.g. "Garden of Delights"
exists as both an Avatar Frame skin and a Name Card skin) and the source slugs are already unique.

`sources` is a plain list of where an item drops from (shops, events, activities) — often empty,
when the wiki doesn't document one. Chest items (50 total) additionally carry an optional
`rewardRates` loot table (`{ reward, amount, probabilityPercent }[]`), parsed from whichever of two
structured shapes the page uses — a "Reward Rates" bullet list or an actual
`Item`/`Quantity`/`Chance` table with the item name cell spanning several tiers — but only 8 of the
50 chests present their rewards in either structured shape; the rest are prose-only descriptions and
get no `rewardRates` at all.

---

### 🎨 Skins

| Module | Factory   | Items | Description                                                        |
| ------ | --------- | ----- | ------------------------------------------------------------------ |
| skins  | `skins()` | 191   | Cosmetic skins — avatar frames, nameplates, and vehicle/city skins |

The cosmetic half of the same item catalog, across 7 skin types: Avatar Frame (69), March Skin (48),
City Skin (35), Nameplate (20), Name Card (10), Teleport Skin (5), and Chief Profile (2). Every
skin's description follows a consistent pattern on the wiki —
`Grants the [X <Skin Type>] (<duration>).` — but duration itself is too inconsistent to model as a
structured field (`Permanent`, `30 day`, or a rank-dependent breakdown like
`Permanent/7 days/3 days` with its own conditional list) and is kept as part of the free-text
`description` instead.

`bonus` is parsed out separately when the page has a clean `Bonus: <stat> +<value>` line (152 of 189
skins) — `undefined` when a skin genuinely grants no stat bonus, not just when parsing fails. A
handful of City Skins (e.g. Frost Sphere VI) have much larger "Domain Bonus" text describing an
area-of-effect mechanic for nearby allies; that stays in `description` only, since it doesn't reduce
to a single stat/value pair.

---

### ⚔️ Chief Gear

| Module         | Factory            | Items | Description                                                  |
| -------------- | ------------------ | ----- | ------------------------------------------------------------ |
| chiefGearSlots | `chiefGearSlots()` | 6     | The 6 equip slots, paired by which troop type they buff      |
| chiefGear      | `chiefGear()`      | 150   | The shared upgrade table every gear piece progresses through |

Unlike every other module, Chief Gear isn't a roster of uniquely-named things — every equipped piece
progresses through the exact same 150-row upgrade table, so `chiefGear()` queries that shared table
directly rather than a set of named items. `tier` uses the wiki's own internal labels verbatim
(`Common`, `Rare`, `Epic`, `EpicT1`, `Mythic`, `MythicT1`, `MythicT2`, `Legendary`, `LegendaryT1`
through `LegendaryT6`), and `stars`/`stage` reset within each tier rather than counting up globally.

`materials` references items already cataloged by `items()` — Hardened Alloy, Polishing Solution,
Design Plans, and Lunar Amber — by their real `items()` slug (`itemId`), confirmed by matching each
material's icon filename against the icon already downloaded for that item.
`troopsDeploymentCapacity` is left unset for the table's first 26 rows; the wiki only starts
awarding it once a piece reaches Mythic T2 star 3 stage 1.

Each `chiefGear()` row has a `score`, the gear score that the upgrade step to that row adds. Events
count it (the rows "Raise max Chief Gear score by 1" pay 36 points in SvS and King of Icefield, 22
in Alliance Showdown, and 500 in Hall of Chief for each point of score). It does not depend on
power. The score of a whole level is 1,125 and 1,875 for Common, 3,000 to 5,440 for Rare, 3,230 to
4,085 for Epic, 6,250 for every Mythic level, and 9,560 for Legendary up to T3. From Legendary T4 it
is 15,560, 15,400, or 15,390. The steps that lead to a level split its score evenly, and they add up
to the level score for all 54 levels. The wiki's event note confirms the scores from Common to
Legendary (1,125 up to 9,560). The Legendary T4 to T6 scores and the split into steps come from WoS
Tools only.

`chiefGearSlots()` covers the 6 equip slots (Cap, Watch, Coat, Pants, Ring, Weapon), hand-entered
from the page's prose rather than scraped from a table, since no table lists them: Cap/Watch buff
Lancer, Coat/Pants buff Infantry, and Ring/Weapon buff Marksman. The 3-piece/6-piece same-quality
set bonus mentioned on the page isn't modeled — the wiki only describes the mechanic in prose
(`"raise ... by x%"`) and never gives real numbers for it.

Each `ChiefGearSlot` carries `images`, one icon per rarity (`Common`/`Rare`/`Epic`/`Mythic`/
`Legendary`) — a piece's appearance only changes at these 5 points, not at every one of the 150
table rows: every `T`-suffixed sub-tier (`EpicT1`, `MythicT1`/`MythicT2`, `LegendaryT1`–`T6`) reuses
its base rarity's icon, and the star/stage counters shown on the source calculator are a UI overlay
on top of that icon, not separate image assets. `chiefGearRarity(tier)` strips a level's `T\d+`
suffix down to its base rarity, and `chiefGearImage(slot, level)` resolves a `ChiefGearLevel`
straight to the right `ChiefGearSlot` icon.

---

### 📿 Chief Charm

| Module          | Factory             | Items | Description                                                   |
| --------------- | ------------------- | ----- | ------------------------------------------------------------- |
| chiefCharm      | `chiefCharm()`      | 75    | The shared upgrade table every chief charm progresses through |
| chiefCharmSlots | `chiefCharmSlots()` | 3     | The 3 troop-type charms (Infantry, Lancer, Marksman)          |

Same shape as `chiefGear()` for the level table, minus the deployment-capacity concept. `materials`
are Charm Guide, Charm Design, and Charm Secrets — the last one only appears starting at level 11
stage 1, not from level 1, matching the raw table exactly rather than assuming a fixed
three-material set throughout.

Each `chiefCharm()` entry has a `score`, the charm score that the upgrade step to that entry adds.
Events count it (the rows "Raise Chief Charm max score by 1" pay 70 points in SvS and King of
Icefield, 45 in Alliance Showdown, and 1,000 in Hall of Chief for each point of score). It does not
depend on power. The score of a whole level is 625, 1,250, 3,125, 8,750, 11,250, 12,500, 12,500,
13,000, 14,000, 15,000, 16,000, 17,000, 18,000, 19,000, 20,000, 21,000, 22,500, and 24,300 for
levels 1 to 18. Levels 1 to 16 match the wiki's event notes, and levels 17 and 18 come from WoS
Tools only. A level with several steps splits its score evenly over them, with the remainder on the
first steps, as WoS Tools does. The split between steps is not confirmed in the game.

Unlike gear, a charm's appearance changes at every one of its 18 levels rather than collapsing to a
handful of rarity icons, so `ChiefCharmSlot.images` is a plain 18-entry array (`images[level - 1]`)
instead of a rarity-keyed map. `chiefCharmSlots()` covers the 3 troop-type charms (Infantry, Lancer,
Marksman); `chiefCharmImage(slot, level)` resolves a slot straight to the icon for a given level.

---

### 🔄 Converters

| Module              | Factory                 | Items | Description                                         |
| ------------------- | ----------------------- | ----- | --------------------------------------------------- |
| chiefGearConverter  | `chiefGearConverter()`  | 7     | The Chief Gear material converter's exchange rates  |
| chiefCharmConverter | `chiefCharmConverter()` | 4     | The Chief Charm material converter's exchange rates |

Both converters share the `ItemConversion` shape (`fromItemId`/`fromQuantity` → `toItemId`/
`toQuantity`, both resolving to real `items()` entries) and the same `byFromItem()`/`byToItem()`
filters. The Chief Gear converter also carries a `weeklyLimit` — the maximum number of times that
exchange can be used per week — which the Chief Charm converter doesn't have.

---

### 🔬 Research

| Module   | Factory      | Items | Description                                                  |
| -------- | ------------ | ----- | ------------------------------------------------------------ |
| research | `research()` | 290   | The full Research Center tech tree, one node per level table |

The Research Center's tech tree, sourced page-per-node like `items()` rather than as a shared table
like Chief Gear/Charm — each named research line has its own detail page with its own per-level
cost, time, and bonus table, closely mirroring `BuildingLevel`'s shape. `category` is one of 9
values (`Battle`, `Growth`, `Economy`, `T11 Infantry`, `T11 Marksman`, `T11 Lancer`, `T12 Infantry`,
`T12 Marksman`, `T12 Lancer`), and `tier` is the node's position within that category's own tier
count (6 for Battle, 7 for Growth, 8 for T12 lines, and so on).

`cost` references items already cataloged by `items()` — every research cost draws from the same
resource set as building costs (Meat, Wood, Coal, Iron, Steel) plus, on the latest T11/T12 tiers,
Fire Crystal Shard and Refined Fire Crystal — resolved to a real `itemId` the same way Chief
Gear/Charm materials are, by matching each cost icon's source filename against a cataloged item's
own icon.

`prerequisites` is a flat list, but each entry is tagged with where it resolves: `type: "building"`
for a gate like `Research Center 7` or `War Academy FC 10` (with `id` set to that building's real
`buildings()` slug, and `level` normalized to match its `BuildingLevel.label` exactly, so it
round-trips into `buildings().find(id)!.levels`), or `type: "research"` for a cross-reference to
another node's specific level (`id` set to that node's own slug in this dataset). A
`type: "unreleased"` entry is also supported, for a tech line the wiki describes in prose but hasn't
published a page for yet — its best-effort slugified `id` intentionally does not resolve against
`research()`, rather than being silently dropped or pointed at the wrong node. No node in the
current dataset uses it: the 12 Molten X II nodes (`Molten Blades II`, and eleven siblings across
T12's three troop lines) briefly needed it until their pages went live under the wiki's Unicode
Roman numeral URL slug (`molten-blades-Ⅱ`, not the ASCII `-ii` this package's own ids use).

Several prerequisite names only resolve after correcting confirmed spelling inconsistencies on the
source wiki itself (`Assault Techniques` → the node is actually named `Assaut Techniques`;
`Bulwark Formation` → `Bulwark Formations`; `Coal Minning`/`Ion Mining`/`Iorn Mining` →
`Coal Mining`/`Iron Mining`; `Marskman Armor` → `Marksman Armor`; `Helios Marksmen` →
`Helios Marksman`; `Survival Expansion` → `Survival Techniques`) — corrected via an explicit alias
list built by cross-referencing every node name in the manifest, not fuzzy-matched.

`researchTimeSeconds` is optional — a few T12 nodes (e.g. `Exalted Blunderbuss`) genuinely have no
Time value on their source page. `bonus` is an array rather than a single value, since the shape
allows a compound bonus even though every node checked so far only grants one stat per level.

Three nodes — `exalted-infantry`, `exalted-marksman`, and `exalted-lancer` — don't exist on the wiki
at all yet. They were added from in-game knowledge rather than scraped: each is a capstone that
unlocks once all 5 of its own T12 troop type's tier-1 Exalted items reach Level 5, with a single
level, 8,000,000 power, and no known cost or bonus data (both empty arrays, not guessed values).
`img` is `""` for these three, since no icon exists anywhere to reference.

Each troop type's 4 tier-2 Molten I items also require that troop type's own Exalted capstone at
Level 1, alongside their existing War Academy building gate — also confirmed from in-game knowledge
rather than scraped, since the wiki's Prerequisites column for these 12 nodes omits it.

Each troop type's 4 tier-4 Molten X II items (`Molten Blades II`, etc.) similarly require that troop
type's own tier-3 node (`indomitable-wall`, `starfire`, or `meridian-phalanx`) at Level 1 — this one
is scraped directly from each node's own page, not user-supplied.

Each troop type's 4 tier-6 Molten X III items require that troop type's own Solar Supremacy node at
Level 15 (also scraped, not user-supplied).

---

### 🛡️ Hero Gear

| Module                 | Factory                    | Items | Description                                                          |
| ---------------------- | -------------------------- | ----- | -------------------------------------------------------------------- |
| heroGearEnhancement    | `heroGearEnhancement()`    | 100   | The shared base leveling table every piece of Hero Gear uses         |
| heroGearEmpowerment    | `heroGearEmpowerment()`    | 100   | A second 100-level shared table with no explanatory text on the wiki |
| heroGearMasteryForging | `heroGearMasteryForging()` | 84    | The Gold-quality-exclusive Mastery Forging table                     |

Like Chief Gear/Charm, the Hero Gear page describes shared upgrade progressions rather than a
catalog of individually-named pieces — there is no per-item detail page for Hero Gear anywhere on
the wiki. Exclusive Gear (the Legendary-hero-specific piece) is already captured per-hero as
`Hero.exclusiveWeapon` in the `heroes()` module; a proposed gear-quality reference list (Grey/Green/
Blue/Purple/Gold) was left out, since it isn't a real, independently useful entity.

`heroGearEnhancement()` is the base 100-level curve every piece of gear climbs, costing Enhancement
XP Component at every level. `heroGearMasteryForging()` covers the Gold-quality-exclusive system
described in the page's prose — 20 levels with 0–4 sub-stages each, costing Essence Stones, with a
Custom Mythic Hero Gear Chest added to the cost from Level 19 on.

`heroGearEmpowerment()` is also a 100-level table, but **the wiki gives it no explanatory paragraph
at all** — unlike Enhancement and Mastery Forging, which both have one. It's modeled directly from
the table as scraped (Level 1 costs 2× a Custom Mythic Hero Gear Chest, Levels 2–99 cost Enhancement
XP Component like the base table, and Level 100 costs both a Custom Mythic Hero Gear Chest and
Mithril), with this documentation gap called out rather than guessed at — the cost items are
confirmed real matches against `items()`, but what in-game action actually uses this table isn't
independently verifiable from the source.

---

### 🚩 Alliance

| Module           | Factory              | Items | Description                                                                             |
| ---------------- | -------------------- | ----- | --------------------------------------------------------------------------------------- |
| allianceBanner   | `allianceBanner()`   | 37    | The Alliance Territory banner's build-cost table by level range                         |
| allianceTech     | `allianceTech()`     | 59    | The full Alliance Technology tree across Growth, Territory, Battle                      |
| allianceFacility | `allianceFacility()` | 8     | The 8 map-based Alliance Facility types and their per-level bonuses                     |
| allianceFortress | `allianceFortress()` | 17    | The castle, 4 strongholds, and 12 fortresses with map coordinates and per-phase rewards |

All four modules live nested under `@/modules/alliance/` rather than flat like every other module.

`allianceBanner()` is sourced from
`https://www.whiteoutsurvival.wiki/territory/alliance-territory/`. Unlike every prior module, this
page has no per-level table — banners are built and leveled up within level _ranges_ (e.g. Levels
11-15 all cost the same to build), so `AllianceBannerLevel` stores `minLevel`/`maxLevel` instead of
a single `level`. Use `allianceBanner().atLevel(n)` to find the range a given banner level falls
into.

Meat and Wood are always required in equal amounts; Coal is added starting at Level 121-130, and
Iron at Level 146-150. The wiki's Level 51-60 row lists the Meat icon twice instead of Meat then
Wood — the amounts are already equal either way, but the itemId is corrected to `wood` for the
second entry rather than trusted literally.

`allianceTech()` is sourced page-per-node like `research()`, from
`https://www.whiteoutsurvival.wiki/alliance-tech/`, covering 3 categories (Growth, Territory,
Battle) each split into 3 tiers. Adds `AllianceTechNode`, `AllianceTechLevel`,
`AllianceTechRequirement`, and `AllianceTechCost` types. Unlike `research()`, there's no `power`
column on this page at all, and every prerequisite is a cross-reference to another Alliance Tech
node (no building-type gate exists anywhere in the tree). Each node also carries a single
`description` naming the stat it affects; the per-level `bonus` is just that stat's raw value at
that level (e.g. `"3%"`), left `undefined` for the handful of one-off unlock nodes with no stat
effect (e.g. Tundra Surveying).

`AllianceTechLevel.timeSeconds` mixes two time formats on the same page — under an hour is `M:S`
(e.g. `30:00`), an hour or more is `H:M:S` (e.g. `01:00:00`) — both are normalized to seconds.

Two confirmed wiki content errors, found and corrected the same way as the equivalent `research()`
fixes: Cooperative Protocols I and Alliance Regimentation I's Level column literally repeats their
own name and level (`"Cooperative Protocols I 1"`) instead of a bare number, for every row —
normalized by reading the trailing number rather than trusted literally. Marksman Attack I's own
page keeps listing "Rally Expansion I" Levels 4 and 5 as prerequisites for its own Levels 4-5, but
Rally Expansion I only has 3 levels; Infantry Attack I and Lancer Attack I (otherwise identical
pages) correctly leave their own Levels 4-5 with no prerequisite, so Marksman Attack I's are dropped
to match. Tundra Surveying's sole prerequisite is "Alliance Regimentation II" with no level number
at all (every other cross-reference on the site includes one) — inferred as Level 5, the full
completion of that 5-level line, matching Tundra Surveying's role as a one-off unlock gate.

`allianceFacility()` covers the wiki page
`https://www.whiteoutsurvival.wiki/alliance-facility/facility/`, which — unlike every other page
this package sources from — has **no structured data at all**: no facility types, no table, none of
this wiki's usual `#table table` markup, just prose about capture mechanics (30-minute capture,
3-day control, stacking rules, a 12-facility cap). The 8 facility types and their per-level bonuses
(`AllianceFacility.levels`) are transcribed instead from a user-provided screenshot of the in-game
map info, which itself only documents some levels per facility (e.g. `defense` has Levels 2 and 4,
`gathering` has only Level 1) — those are left as genuine gaps rather than guessed at. Each level
also carries `available` (facilities of that level on the map), `ownLimit` (1 per level), and
`locations` (the `{ x, y }` map coordinates, read from the same screenshot).

`allianceFortress()` lists the single castle (597, 597), the 4 strongholds, and the 12 fortresses
with their `x`/`y` map coordinates. Each stronghold and fortress has 8 `rewards`, one per phase,
transcribed from a user-provided "Stronghold & Fortress Rewards" rotation image. The castle's
rewards are not documented, so its `rewards` array is empty. Use `.ofKind('fortress')` to filter by
structure type.

---

### 📅 Events

| Module | Factory    | Items | Description                                                           |
| ------ | ---------- | ----- | --------------------------------------------------------------------- |
| events | `events()` | 16    | Game events with frequency, duration, requirements, rewards, and tips |

Sourced from `https://www.whiteoutsurvival.wiki/events/` (67 events listed, added in batches). Event
pages are prose and screenshots with no tables, so each event's text is transcribed from its page
and rewards that exist only as images are added from user-provided screenshots. Each event is its
own file under `data/events/`. Every detail field except `description` is optional and left out when
the wiki does not state it. `eventBuffId` links an event to its `eventBuff()` row; the two share the
same id. Use `.byCategory('alliance')` to filter by wiki category (`solo`, `alliance`, `rookie`,
`holiday`). `tiers` lists an event's ranking tiers from lowest to highest, each with an optional
`scoreTotal`, tier-wide `rewards`, and per-placement `rankings` (star change and rewards). Alliance
Championship has all 6 tiers with rewards for each of its 4 placement groups, taken from a community
guide that lists them as text. Canyon Clash uses `tiers` for personal merit ranges, each with
rewards per legion rank, and `allianceRankings` for alliance rewards, both read from wiki images.
Frostdragon Tyrant has `personalRankings` (one table per thing a placement is based on, such as
capital occupation time and personal points) and uses `tiers` for its personal points milestones.
SVS - State of Power has `days` for its 5 preparation stages and the battle phase (scoring actions,
personal and alliance point milestones) and `tiers` for the ranking and winner reward tables, from
the outof.games guide text and the wiki's reward images. Sunfire Castle has `personalRankings`
(Gems, Charm Design, and Charm Guide for 22 rank groups) and `tiers` for its 7 personal points
milestones, read from two wiki images that show one server's values. Mercenary Prestige has `tiers`
for its four difficulty tiers (Easy to Insane as rankings) and `allianceRankings` for the Captain
rewards, both from the wiki text. Champion's and Epic Initiation rankings also carry `levels`: 50
enemy levels each with tier, power, bonus, troops per type, total troops, and stage rewards, read by
OCR and spot-checked from the outof.games guide's table images. Those images show the older 50-level
event (the guide's Legend's Initiation, now called Epic), so their stage rewards differ from the
current 25-level wiki rewards. Two source rows look like typos (Champion's Nightmare level 50 and
Epic Nightmare level 13) and are kept as printed with a `note`. Alliance Showdown has `days` (the
actions that score points each day, and that day's personal point milestones with rewards) and uses
`tiers` by star rating for the star and ranking rewards, from the outof.games guide's tables.
Alliance Mobilization has `missions` (name, group, and base points, read from the wiki's mission
tables; the 120% and 200% exclusive columns and the gem purchase missions are left out). Tundra Arms
League uses all three: `allianceRankings`, `personalRankings` (legion ranking and legion result),
and `tiers` by Personal Arsenal Points with Winner and Defeat rankings for the Elimination and
Championship phases. Its rewards come from in-game screenshots on outof.games. Crazy Joe also keeps
its first alliance reward list in `allianceRankings` and a later list for the same 10 ranks in
`allianceRankingUpdates`, from in-game screenshots taken after a server update. Its
`personalRankings` has 21 rank groups, 1 to 501-1000, from in-game screenshots. Its `pointLevels`
lists the 30 defense point levels, each needing both personal points (blue coin) and alliance points
(gold coin), with the reward for each level. Crazy Joe has `waves` (target, rule, and details for
each of its 20 waves, from a community guide) and uses `tiers` for its 21 difficulties, with the
Alliance Defense Points needed to unlock each, read from a wiki image. The first batch covers Bear
Hunt, Crazy Joe, Alliance Championship, Foundry Battle, Canyon Clash, Frostfire Mine, Frostdragon
Tyrant, Tundra Arms League, Icefire Warhymn League, and Tundra Trade Route. The second batch adds
Alliance Showdown, Alliance Mobilization, Mercenary Prestige, SVS - State of Power, King of
Icefield, and Sunfire Castle, from the wiki text only (their reward amounts are mostly in images and
are not loaded yet). The third batch adds Armament Competition, Officer Project, Brothers in Arms,
Hero's Mission, Tundra Trading Station, Fishing Tournament, The Labyrinth, and Treasure Hunter, from
the wiki text only. Categories for the solo events are set from the event pages and can be
corrected. Armament Competition and Officer Project each have ranking rewards and, in `days`, one
entry for each version (Chief Gear and Chief Charm, or Troops and Heroes) with the points to score
and the four target point levels with their rewards. The points needed for each level are loaded
only for the Officer Project Troops version, so `scoreTotal` is omitted on the other levels until
they are known. Fishing Tournament lists its five daily mission rewards in `tiers`, by Fishing
Points. Its leaderboard rewards (9 rank bands) have no amounts and some items are not linked,
because they are read from a low-resolution wiki image. Refine them when the event returns.
Frostfire Mine has its six gathering reward levels in `tiers` (by Orichalcum yield, with the source
image cutting off the last items of each row) and its ranking rewards in `personalRankings`. Icefire
Warhymn League has its 7 season ranking groups and its State rewards in `personalRankings`, its 16
League Shop offers in `shop` (cost and limit in Warhymn Testaments), and its League Missions in
`missions`, with `missionPointsLabel` naming the Testaments. Each mission has 7 levels that give the
same rewards. Its `levelRequirements` has all 7 levels. The login mission needs 1 more day for each
level, and each other mission needs its level 1 amount again for each level, so level N is N times
level 1. `rewards` holds the other items each level gives. Its phases carry the UTC schedule, and
the tips list which buffs apply, from the wiki and a community guide. King of Icefield has the
scoring list for each of its 7 days in `days` and four ranking tables in `personalRankings`. The
ranking tables hold only the first rows, because the wiki images are cropped. The Labyrinth has its
6 zones with their open days in `zones`, its 14 Labyrinth Core milestone rewards in `tiers`, and its
Glowstone shop in `shop`, with `shopCurrencyItemId` naming the shop currency. Treasure Hunter has
its 4 daily pickaxe missions in `missions`, its 21 total search milestones in `tiers`, its common
and supreme Ultimate Treasure options in `personalRankings`, and the Treasure Preview rewards in
`rewards`. Tundra Trade Route has its 6 truck refreshes with their gem cost and quality chances in
`refreshes`. Its truck rewards are random, so they are not listed. Tundra Trading Station has its 19
shop offers in `shop` (priced in Trade Vouchers) and the Trade Voucher value of each exchange in
`tiers`. The fourth batch adds Lucky Wheel, Defeat Nearby Beasts, Snowbusters, Flame and Fang, Wild
Brawl, Tundra Games, Stand of Arms, and Hero Rally from the wiki text. Amounts the wiki shows only
The fifth batch adds 10 rookie events: City Development, Plan Your City, Trusted Chief, Power Up,
War Preparation, Grow Your Heroes, Develop New Tech (two wiki copies), Trial Event, and Home Beyond.
Each target event has its four or five target levels and the top 100 ranking, and the target point
amounts are loaded where a screenshot shows them. The sixth batch adds Hall of Chief (13 stage
scoring lists for its two seasons), Hall of Heroes (the shop of each hero generation from 1 to 9 in
`shops`), and Mia Fortune (orb costs and milestones). Rewards the wiki shows only as images are not
loaded, and rewards it does not name are recorded as unidentified items. The seventh batch adds
Crystal Reactivation (chest shops by Fire Crystal age), Beast Whisperer (75 daily missions), Journey
of Light, Symphony of Change, Return to Tundra, Deadshot, Gina's Revenge, and Working Overtime.
Chest and bundle offers hold their rewards in `contents`. Brothers in Arms has its troop-level point
table, four target levels, and top 100 ranking rewards. Hero's Mission lists the hero whose shards
it gives for generations 4 to 15 in `heroByGeneration`. The eighth batch adds the first holiday
events: Frosty Fortune, Vision of Dawn, Romance Season, and Dreamscape Memory, from the wiki text
and the images that can be read. The ninth batch adds Tundra Adventure (tile chances, item tile
levels, point targets, and the Odyssey of Adventure board), Silver Shell Events, Tundra Album, and
Shining City Pack, from the wiki text. Their shops and packs are not loaded. The tenth batch adds
State Merger (97 Pioneering Praises missions with their rewards and the five chests), State
Transfer, Vault of Enigma, and Tundra Star.

### 🧮 Calculators

Calculators are plain functions, not query builders. They read their numbers from the package data,
so a data fix changes the result without any code change.

| Function                      | Description                                                             |
| ----------------------------- | ----------------------------------------------------------------------- |
| `calculateSvs()`              | State of Power points for each day and phase, with Valeria's bonus      |
| `calculateAllianceShowdown()` | Alliance Showdown personal points for each day, with Baldur's bonus     |
| `calculateKingOfIcefield()`   | King of Icefield points for each day                                    |
| `calculateHallOfChief()`      | Hall of Chief points for each stage                                     |
| `calculateChiefGear()`        | Materials, gear score, power, and event points to upgrade Chief Gear    |
| `calculateChiefCharm()`       | Materials, charm score, power, and event points to upgrade Chief Charms |
| `calculateTroops()`           | Troops trained or promoted by each camp, by troop type and tier         |
| `calculateResearch()`         | Resources, time, and power to upgrade research lines to a goal level    |
| `calculatePets()`             | Pet food, advancement items, and stat gains to level pets to a goal     |
| `calculateBuildings()`        | Resources, build time, power, and event points to upgrade buildings     |
| `calculateExperts()`          | Books of Knowledge and expert sigils to level experts and their skills  |

Every calculator takes how many times each scoring action was done, as counts by day id and then by
action text from that event's `days` in `events()`. Days and actions that are left out count as 0.
Each returns the base points, the expert bonus, and the total for every day and for the whole event.
A day or action that the event does not have, or a negative count, throws an error.

`calculateSvs(usage, { valeriaLevel })` also returns the Preparation Phase and Battle Phase totals.
Valeria's Well Prepared skill (level 1 to 10) adds 2% for each level to the points of days 1 to 5,
and never to the Battle Phase.

`calculateAllianceShowdown(usage, { dawnHymnLevel })` uses Baldur's Dawn Hymn skill (level 1 to 10).
It adds 5% for each level to every action except the Tundra Trade Route truck actions (escort and
raid). `calculateKingOfIcefield(usage)` and `calculateHallOfChief(usage)` have no expert bonus. Hall
of Chief ranks every stage on its own, so the points of one stage matter more than the sum.

`calculateChiefGear(ranges)` and `calculateChiefCharm(ranges)` are different from the event
calculators, and each has its own function. They take one range for every gear piece or charm to
upgrade, `{ from, to }` with level ids from `chiefGear()` or `chiefCharm()` (use `from: null` for a
piece with no level yet). Each returns the steps, materials, score, power gained, and event points.
Event points are the score times what the "Raise Chief Gear max score" or "Raise Chief Charm max
score" row pays in SvS, Alliance Showdown, King of Icefield, and Hall of Chief. A range that goes
down, or a level that does not exist, throws an error.

`calculateTroops({ camps, ... })` works like the Camp Configuration on WoS Tools. Each of the three
camps (`infantry`, `lancer`, `marksman`) has a `level` (a level `label` from `buildings()`, such as
`30` or `FC 3-2`) and a list of `runs`. A run has an `action` (`training` at a `tier`, or
`promotion` from a `fromTier` to a `toTier`), a `count` per batch (or `max`), and `batches`. A camp
can train and promote, so it can have both runs, each with its own count and batches. All three
camps share one capacity: the capacity of the three camp levels added together, plus
`researchCapacity` and the `ministerOfEducation` buff (+200, or +300 for the supreme buff), times 3
with `capacityBoost`.

It returns the capacity, the runs of each camp, and the change in troops for each type and tier from
T1 to T12. Training adds troops at its tier, and promotion takes them from the first tier and adds
them to the second. It also returns the `resources` (meat, wood, coal, and iron) and the time. The
cost of a run is the cost of one troop from `troops()` times the troops, less `costReductionPercent`
for that troop type (0 to 75), and promotion costs the difference between the two tiers. The seconds
of a batch are the training time of one troop times the troops, divided by 1 plus the training
speed, rounded down. The training speed is `trainingSpeedPercent` (your speed without buffs, as the
game shows it) plus the buffs: `vicePresident` (+10% or +15%), `ministerOfEducation` (+50% or +75%),
`mobilize` (+30%), and `advancedTraining` (+20%). A camp adds up its batches, `totalSeconds` adds
the camps together (the speedup time you need), and `longestCampSeconds` is the camp that takes the
longest. A count above the capacity, an unknown level, a tier outside 1 to 12, a negative speed, or
a cost reduction outside 0 to 75 throws an error.

`calculateResearch(goals, options)` takes one entry for each research line to upgrade,
`{ id, current, goal }`, with the `id` from `research()` and levels from 0 (not started) up to the
number of levels of the line. Each tier of a research line is its own line with its own levels, as
in the game. Only the levels after `current` up to `goal` count. It returns the resources, the power
gained, and the research time. The time is the research time of all levels added together divided by
1 plus the research speed, rounded down. The speed is `researchSpeedPercent` (your speed as the game
shows it, without buffs) plus the `stateBuff` (+10%) and `vicePresident` (+10%, or +15% for
supreme). `items` breaks the result down for each line. `unmetPrerequisites` lists levels that need
another research line at a level that your plan does not reach, `buildingRequirements` gives the
highest building level the steps need (for example `war-academy` at `FC 5`), and `stepsWithoutTime`
counts the levels that have no time in the data, which count as 0 seconds. An unknown line, a level
out of range, a goal below the current level, or a negative speed throws an error.
`RESEARCH_CALCULATOR` exports the two buffs. The sample page shows the same tree as
`research-tree.html`: click a line to set its current and goal level, and the lines in your plan are
highlighted. A list view has the same choices.

`calculatePets(goals)` takes one entry for each pet, `{ id, current, goal }`, with the `id` from
`pets()` and levels from 1 to the max level of the pet. Each level after `current` up to `goal`
costs its pet food. A pet advances at every level that is a multiple of 10 and needs the advancement
to go past that level, so a range that starts at or passes such a level pays for the advancement
items. A goal that is a multiple of 10 pays for its advancement only when `goalAdvanced` is true
(use it for the final advancement at the max level), and a pet that is already advanced at its
current level (`currentAdvanced`) does not pay for it again. It returns the resources, the gain in
Troop Attack, Troop Defense, and troops power (the difference between the two states, with the
advanced values used for an advanced state), and a breakdown for each pet. Pets have no training
time in the data, so there is no time. An unknown pet, a level out of range, a goal below the
current level, or an advanced flag on a level that is not a multiple of 10 throws an error.
`PET_ADVANCEMENT_INTERVAL` exports the 10. Each advancement paid for adds its `advancementScore`,
and the result gives the total and the event points (the score times the "Pet advancement score
increases by 1" row of SvS, Alliance Showdown, and King of Icefield, which is 50, 30, and 50 for
each point of score).

`calculateBuildings(goals, options)` takes one entry for each building, `{ id, current, goal }`,
with the `id` from `buildings()` and the level `label` for `current` (`null` for a building that is
not built) and `goal`, for example `"30"`, `"30-1"`, or `"FC 3"`. It adds the levels after `current`
up to `goal`. A level can need other buildings at a level, and the calculator adds the steps of
those buildings first when they are below that level, so the totals are the true cost.
`options.buildingLevels` lists the level `label` of the buildings you already have by `id`, and a
building that is not listed counts as not built. A step that comes from a prerequisite has
`prerequisite` set to true. The result has the `steps`, the `resources` (Wood, Coal, Iron, Meat,
Fire Crystals, and Refined Fire Crystals as `itemId` amounts), the `power` gained (the power of each
level minus the power of the level before it), and the build time.
`options.constructionSpeedPercent` is the total speed bonus, and the bonuses add up, so 50% turns 10
hours into 6 hours 40 minutes. `seconds` is the time after the bonus and `baseSeconds` is the time
before it. `eventPoints.svs` and `eventPoints.kingOfIcefield` score each Fire Crystal and each
Refined Fire Crystal, read from the scoring rows of the events. Speedups are not a function input:
the result has `speedupMinutesNeeded`, the minutes that cover the build time, and
`speedupPointsPerMinute` for SvS and King of Icefield, so the interface multiplies them with the
minutes the user spends. build time. `eventPoints.hallOfChief` lists each multiplier of power gained
with the event days that use it. A prerequisite on a building that is not in the data (the Hero Hall
and the numbered Shelters on some Furnace levels) adds no steps and appears in `unmetPrerequisites`.
Only the buildings with resource costs can be calculated, so the Daybreak Island buildings throw an
error, and so does a goal for a building that appears twice, an unknown building or level `label`, a
goal below the current level, or a negative speed.

`calculateExperts(goals)` takes one entry for each expert, `{ id, level, skills }`, with the `id`
from `experts()`. `level` is the affinity level range,
`{ current, goal, currentAdvanced?, goalAdvanced? }`, from 1 to 100, and `skills` is a list of
`{ name, current, goal }` with the skill `name` and levels from 1 to the max level of the skill.
Each skill level after `current` up to `goal` costs Books of Knowledge and skill EXP. An expert
advances at every affinity level that has an `advancementCost` (10 to 100) and needs the sigils to
go past it, so a range that starts at or passes such a level pays for the advancement. A goal at
such a level pays only when `goalAdvanced` is true (use it for the final advancement at level 100),
and an expert that is already advanced at its current level (`currentAdvanced`) does not pay again.
It returns the `books` and `sigils` as the main totals, with the `exp` and the `affinity` points of
the levels, and a breakdown for each expert. The talent costs nothing, because it levels with the
relationship. An unknown expert or skill, a level out of range, a goal below the current level, or
an advanced flag on a level with no advancement cost throws an error. `EXPERT_MAX_LEVEL` exports
the 100.

A promotion to tier 12 adds up the steps from tier to tier. A step costs the difference of the two
training costs, or the tier's `promotionCost` for tier 12, and takes the difference of the two
training times.

The values that the calculators use are exported, so an app can offer the same choices and show the
same rules. `TROOP_CALCULATOR` holds the troop types, the tier range, the capacity boost, the
Minister of Education capacity and speed, the Vice President, Mobilize, and Advanced Training speed,
and the highest cost reduction. Its `maxTier` comes from the troop data. `SVS_BATTLE_DAY_ID` is the
SvS day that Valeria's bonus skips, and `ALLIANCE_SHOWDOWN_TRUCK_ACTION` matches the truck actions
that Baldur's bonus skips. The troop sample page reads `TROOP_CALCULATOR` instead of its own copies.

The bonus of a day is rounded to a whole number. The percents are read from the `progressions` of
each expert skill.

```ts
import { calculateSvs } from "whiteout-survival-data";

const result = calculateSvs(
  { "4": { "Use 1 Mithril": 3 }, Battle: { "Kill 1 Lv. 11 enemy Troop.": 200 } },
  { valeriaLevel: 10 },
);
result.event.total; // 521,400: 435,000 base plus 86,400, which is 20% of the 432,000 Preparation points
```

The sample pages `calculator-svs.html`, `calculator-alliance-showdown.html`,
`calculator-king-of-icefield.html`, `calculator-hall-of-chief.html`, `calculator-chief-gear.html`,
`calculator-chief-charm.html`, `calculator-troops.html`, `calculator-research.html`,
`calculator-pets.html`, `calculator-experts.html`, and `calculator-buildings.html` are free
plug-and-play versions with the same math. They save nothing.

---

### 🎯 Event Buffs

| Module    | Factory       | Items | Description                                                    |
| --------- | ------------- | ----- | -------------------------------------------------------------- |
| eventBuff | `eventBuff()` | 14    | Which of 11 buff sources apply in each of 14 game modes/events |

Sourced from a user-provided "Applicable Buff List" screenshot (not from any wiki page) — an
11-column × 14-row matrix crossing buff sources (City Bonus/Wars Buffs, Deployment Capacity, Pet
Skills, Daybreak Island, President Skills, Minister Buff, Territory Bonuses, Facility Buff, March
Accelerator, Frostdragon Tyrant Titles, Frost Sphere Domain Bonus) against game modes (Bear Hunt,
Crazy Joe, Alliance Championship, Foundry Battle, Canyon Clash, Fortress Battle, Facility, Castle
Battle, Tundra Trade Route, Frostfire Mine, Frostdragon Tyrant, Tundra Arms League, Icefire Warhymn
League, Winter Siege). Deliberately not nested under `alliance/`, since most of these buff sources
(Pet Skills, President Skills, Frostdragon Tyrant, Frost Sphere) belong to other systems entirely.

Each `EventBuff` field is a `BuffApplicability` (`'yes' | 'no' | 'partial'`) rather than a plain
boolean — several cells in the source image show a warning icon (e.g. "March Accelerator: not
applicable for rally") rather than a clean check or X, so `'partial'` preserves that distinction
instead of forcing it to one side. `notes` carries the source image's footnote text verbatim where
present, and is `undefined` for modes with no caveats (e.g. Crazy Joe). `petSkillsAutoApplied` is
`true` where pet skills take effect without player activation: Alliance Championship, Icefire
Warhymn League, and Winter Siege. Use `eventBuff().appliesFor('facilityBuff')` (defaults to `'yes'`)
to filter by any one buff source.

Pet Skills, Daybreak Island, and Facility Buff are the only three sources that apply in literally
every tracked mode, including the two PvP league modes (Icefire Warhymn League, Winter Siege) that
deny almost everything else.

---

### 👑 VIP

| Module | Factory | Items | Description                                        |
| ------ | ------- | ----- | -------------------------------------------------- |
| vip    | `vip()` | 12    | The full VIP 1-12 progression: XP cost and unlocks |

Sourced from `https://www.whiteoutsurvival.wiki/vip/` — like Alliance Territory/Facility, this page
has no HTML table; the data is a single official infographic image. Unlike the user-provided
screenshots used for Alliance Facility and Event Buff, this one is complete and precise for all 12
levels, so there's no documented gap here.

`VipLevel.xpRequired` is the XP needed to go from the previous level to that one, not a running
total (`0` for VIP 1, which the source image shows as `-`) — summing every level's `xpRequired`
gives the 4,800,000 total XP needed to reach VIP 12 from scratch. `bonuses` lists the _total_
bonuses active at that level, not the delta from the previous one — e.g. Resource Production Speed
appears at every level with an increasing value, and Storehouse Capacity, March Queue, and Troop
Formation accumulate the same way. Combat stat bonuses (Troops Defense/Attack/Health/Lethality)
don't appear at all until VIP 9. `vip().atXp(n)` sums each level's `xpRequired` in order and returns
the highest level reachable with a given amount of total XP.

Each `VipBonus` keeps the original display string in `value` (`"+16%"`, `"+1"`, `"+1.1M"`) alongside
a parsed `amount`/`unit` pair (`16`/`'percent'`, `1`/`'flat'`, `1100000`/`'flat'`) — abbreviated
`K`/ `M` capacity amounts are expanded to their full number. `value` stays the source of truth for
display; `amount`/`unit` exist so consumers can sum or compare bonuses without re-parsing the string
themselves.

---

### 🏝️ Daybreak Island

| Module     | Factory        | Items | Description                                                    |
| ---------- | -------------- | ----- | -------------------------------------------------------------- |
| lumberCamp | `lumberCamp()` | 10    | The shared Lumber Camp upgrade table                           |
| treeOfLife | `treeOfLife()` | 10    | The Tree of Life upgrade table (requirements + buff per level) |
| decoration | `decoration()` | 103   | Every Daybreak Island decoration across 8 categories           |

Sourced from `https://onechilledgamer.com/whiteout-survival-daybreak-island-guide/` — a third-party
fan site rather than `whiteoutsurvival.wiki`, but one with genuine `<table>` markup (12 tables,
parsed from raw HTML). Unlocked at Furnace Level 19 (builds the Dock, which discovers the island
after ~3 real-time days). All three factories live flat at `@/modules/daybreak-island`, a third
top-level grouping alongside `alliance/` and `chief/`.

`lumberCamp()` covers the 2 identical Lumber Camps built to clear the island's starting forest (each
tree cleared has a chance to drop Life Essence, Hero Shards, or Gear). Once fully cleared, a
separate **Timbermill** building takes over Life Essence production — it isn't leveled and has no
table, just two flat facts from the source (40 Life Essence/hour per worker, 2,000 capacity), so it
isn't modeled as its own queryable data.

`treeOfLife()` is the island's centerpiece — its `buff` field alternates between a repeating
"Healing Speed +30%" on odd levels and an escalating combat/capacity stat on most even levels (the
pattern breaks at Levels 9-10, which is why `buff` is scraped per-level rather than derived). `buff`
is shaped like `VipBonus` — `stat`/`value` for display (`"Troops Deployment Capacity"`/`"+1K"`) plus
a parsed `amount`/`unit` pair (`1000`/`'flat'`) for aggregation, rather than a single opaque string.

`decoration()` covers all 103 named decorations across 8 categories, each shaped differently (see
`DecorationCategory`) — not every `Decoration` field applies to every category:

- **Basic** (9) and **Vegetation** (5): purely cosmetic. Have `cost` (a named resource — Gems, Wood,
  or Meat — resolved to a real `items()` id) and `limit` (max placeable count). No `levels`.
- **Common** (10) and **Uncommon** (6): can't be upgraded and grant no buff, but have a fixed
  `prosperityAtMaxLevel`, a `limit`, and a flat `lifeEssenceCost` (1,000 / 2,000 — stated once in
  the source's prose per rarity, not a per-item table column).
- **Rare** (12), **Epic** (11), **Mythic** (48): each has a `levels` array
  (`{ level, cost, prosperity, buff }` — `cost` is the numeric level-up requirement at that level,
  and `buff` is shaped like `VipBonus`, one stat per level). The original source only ever showed
  the buff/Prosperity at max level, so the full per-level breakdown for these categories was
  gathered separately by the user and imported wholesale — `limit` (max placeable count) came from
  the same pass and is confirmed at 1 for every item checked so far. Rare/Epic/Mythic's
  `lifeEssenceCost` is stated once per rarity in prose (3,000, 5,000, 10,000) — except **Snow
  Castle** (Mythic), a confirmed exception at 12,000. **Limited isn't a rarity of its own** — it's a
  `limited?: boolean` flag on a decoration that's otherwise a normal Epic (4 items, max level 5) or
  Mythic (42 items, max level 10), reflecting how it's actually obtained (a shop rotation, an event
  pack, a ranking reward) rather than the standard Life Essence upgrade path. `limited` is omitted
  (not `false`) on every non-limited decoration. Limited decorations have no `lifeEssenceCost` at
  all, since Life Essence isn't how they're obtained; a handful (mostly unreleased or newly
  obtainable ones) also have confirmed `cost`/`prosperity` per level but no buff data yet — those
  levels carry a blank buff (`stat: ''`, `value: '+0'`, `amount: 0`, `unit: 'flat'`) rather than
  being left out of the array.
- **Unique** (2): decorations with no standard rarity progression at all, so `limited` doesn't apply
  to them either. The **Starry Lighthouse** is a single one-of-a-kind decoration unlocked at Tree of
  Life Level 10 (50,000 Life Essence blueprint), upgradeable to Level 10; its `levels` follow the
  same `{ level, cost, prosperity, buff }` shape as the other leveled categories, but with different
  underlying currencies: `cost` is General Accessory Construction Contracts required at that level
  (0 through 180) rather than Life Essence, and `buff` combines its two simultaneous stats into one
  entry (`"Troops' Lethality, Troops' Health"`, +1% per level, same convention as Serpent
  Sanctuary's four-stat buff). `prosperity` climbs a flat 2,000 per level, to 20,000 at Level 10.
  **Harbor of Hope** is obtained from the Silverfrost Shop on a recurring, sporadic basis rather
  than a one-off event pack or ranking reward — closer to Starry Lighthouse's standing availability
  than to a true limited-time Epic/Mythic, hence `Unique` rather than `limited: true`.

Names and buff text are transcribed exactly as the source shows them, including a few likely
fan-site typos with no second source to verify against ("Marskman Attack" on Clock Hut, "Floating
Markert", "Marksman Defence" on Fisherman's Chalet, "Hero's Sanctun") — kept verbatim rather than
guessed at. The level-data import correctly spelled this last one "Hero's Sanctum," but rather than
rename the stored entry (and risk breaking anything referencing the original id), it was reconciled
back onto the existing `hero-s-sanctun` id — so `decoration().find('heros-sanctum')` returns
nothing, while `decoration().find('hero-s-sanctun')` has the full imported level data.

`img` is optional on `Decoration` and set only where a picture has been added so far: Dragon Pagoda
and Serpent Sanctuary (cropped from heaven-guardian.com guide images), War Chariot and Cannon
(cropped from the Tundra Arms League legion rewards screenshot on outof.games), Tundra Truck and
Giant Horn (cropped from the Alliance Showdown reward screenshots on outof.games), and Conquering
Sword (cropped from an in-game SVS reward screenshot), Icefire Way (cropped from an in-game League
Shop screenshot), Luminari Citadel and Hero's Sanctum (cropped from in-game Labyrinth reward
screenshots). They are stored under `images/daybreak-island/`. Cannon's per-level buffs are not
documented, so its levels carry blank buffs.
---

## 📋 Raw Data Access

JSON data files can be imported directly, without importing the JS/TS package:

```ts
import buildings from "whiteout-survival-data/data/chief/buildings.json";
```

---

## 📈 Change Log

Check out the [Change Log](CHANGELOG.md) for new breaking changes, features, and bug fixes per
release of a new version.

---

## 🤝 Contributing

Bug Reports, Feature Requests, and Pull Requests are welcome on GitHub at
[https://github.com/chiefpansancolt/whiteout-survival-data](https://github.com/chiefpansancolt/whiteout-survival-data).
This project is intended to be a safe, welcoming space for collaboration, and contributors are
expected to adhere to the [Contributor Covenant](https://www.contributor-covenant.org/) code of
conduct.

To see more about Contributing check out this [document](.github/CONTRIBUTING.md).

1. Fork Repo and create new branch
2. Once all is changed and committed create a pull request.
3. Ensure all merge conflicts are fixed and CI is passing.

---

## 🛠️ Development

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for setup instructions and
[DEVELOPMENT.md](.github/DEVELOPMENT.md) for the full guide on adding new modules.

```bash
pnpm install         # Install dependencies
pnpm build           # Build with tsup
pnpm test:coverage   # Run tests with the 100% coverage gate
pnpm lint            # Type-check + ESLint
pnpm format          # Format with Prettier
pnpm sample          # Exercise queries end to end
```

---

## 💖 Support the Project

If you find this project helpful, consider supporting its development:

<div align="center">

[![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsor-pink?style=for-the-badge&logo=github)](https://github.com/sponsors/chiefpansancolt)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/chiefpansancolt)
[![Patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://patreon.com/chiefpansancolt)

</div>

---

## 📄 License

whiteout-survival-data is available as open source under the terms of the [MIT License](LICENSE).

---

## Disclaimer

This project is not affiliated with, endorsed by, or connected to Whiteout Survival or Century
Games. All game data is sourced from public wiki and community references. Game images and names are
used for reference purposes only.

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/chiefpansancolt">chiefpansancolt</a></p>
</div>
