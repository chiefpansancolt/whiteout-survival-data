# whiteout-survival-data

<div align="center">
  <h3>A comprehensive, fully-typed dataset for Whiteout Survival</h3>
  <p>Structured JSON data, image assets, and a chainable query builder API for heroes, buildings, research, pets, and more.</p>

![GitHub Release](https://img.shields.io/github/v/release/chiefpansancolt/whiteout-survival-data?style=flat-square)

</div>

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
| buildings | `buildings()` | 18    | Buildings with full per-level upgrade progression |

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

- **Furnace** — the town HQ; caps every other building's max level.
- **Embassy** — stores Alliance reinforcements and gates Alliance assistance; every standard level
  requires the Furnace at the matching level (Levels 1–8 all just require Furnace Lv.8).
- **Research Center** — unlocks Growth, Economy, and Battle research; caps at Level 30 with no Fire
  Crystal tier. Levels 1–9 all just require Furnace Lv.9, then it tracks the Furnace level for level
  10 on.
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
  the same derived same-building chain as Command Center.
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
- **Barricade** — strengthens city defense durability. The shortest tracked building by far: caps at
  Level 10 with no Fire Crystal tier, and Level 1 has no prerequisite at all (unique among tracked
  buildings). Its remaining levels skip several Furnace levels between gates (e.g. Level 2 needs
  only Furnace Lv.7, Level 3 needs Lv.10) rather than tracking every Furnace level.
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

### 🏛️ Facilities

| Module     | Factory        | Items | Description                               |
| ---------- | -------------- | ----- | ----------------------------------------- |
| facilities | `facilities()` | 8     | Buildings with no levels, power, or costs |

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
**Explorer's Cabin**, and **Suggestion Box** — each is a single entry with just a name, icon, and a
description of what it does in-game (recruiting heroes, PvP ranking, edicts, and so on).

---

### 🦸 Heroes

| Module | Factory    | Items | Description                                        |
| ------ | ---------- | ----- | -------------------------------------------------- |
| heroes | `heroes()` | 13    | Heroes with stats, skills, and shard-upgrade costs |

Every hero has a `rarity` (`Rare`/`Epic`/`Legendary`), a `class` (`Infantry`/`Lancer`/`Marksman`),
and a `subClass` (`Growth`/`Combat`) — `subClass` is stored per hero rather than derived, since it
doesn't follow a strict rule from rarity or class (e.g. Gina and Jasser are both Epic Marksman, but
Gina is `Combat` and Jasser is `Growth`).

Stats have two groups: `exploration` (flat `attack`/`defense`/`health`) and `expedition`
(`attack`/`defense` as percentages). Skills are grouped the same way a hero's in-game skill tabs
are: `skills.exploration[]`, `skills.expedition[]`, and an optional `skills.talent` — Talent exists
only on some Legendary heroes (the tab is present on every Legendary page, but empty on newer
generations that shifted the mechanic into the Exclusive Weapon instead).

`exclusiveWeapon` is present only on Legendary heroes. It carries its own bonus stat block — using
`lethality`/`health` percentages for its Expedition stats, a different stat pair than the hero's own
Expedition block — plus a `power` rating and two of its own skills. `shardCosts` is a 5-star ×
6-tier cost table present on every hero; the per-tier costs are identical across rarities except
Star 1's total (10 for Rare/Epic, 30 for Legendary, in every hero checked so far).

Currently covers **Generation 0** (the 13 pre-Legendary heroes: 4 Rare, 9 Epic). Later generations
(1–17, all Legendary, 3 per generation) will be added incrementally, the same
generation-by-generation approach used for buildings.

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
- Some have `milestoneRewards` instead — a flat, non-scaling base value where leveling unlocks a
  fixed one-time item bundle at specific levels (e.g. Baldur's "Blazing Sunrise" grants a fixed
  reward set at levels 1, 6, and 10) rather than a continuously increasing stat.
- Some have a `lootTable` (a random-reward chest, on either a skill or the talent — confirmed
  present on both, not talent-exclusive).
- A few are entirely flat with no `progressions`, `milestoneRewards`, or `lootTable` at all (e.g.
  Baldur's talent "Master Negotiator") — `maxLevel` defaults to `1` for these rather than `0`, since
  the ability is still active, just not further upgradeable.

`affinityLevels` is a 100-row table (`level`, `affinityRequired`, an optional `advancementCost` —
present only at levels divisible by 10 — and the resulting `statBonus`). `advancementCost` is the
per-milestone "Sigil" cost; summing the column reproduces the aggregate "Total Sigils" figure
reported elsewhere for every expert checked (e.g. Agnes: 5+10+...+50 = 275), so no separate
recruitment-cost field is stored — it would just be redundant, derivable data.

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

Most skills have a `values` array that scales with the effect's own percentage or flat number (e.g.
Cave Hyena's Construction Speed bonus) and a flat `cooldownSeconds`. A few pets (Musk Ox, Giant Elk)
have a skill with no numeric effect to scale — instead, the _cooldown itself_ shortens per tier,
tracked in `cooldownSecondsByTier` and mirrored into `values` so the tier count still lines up with
every other pet's shape.

Frost Gorilla and Frostscale Chameleon have no portrait image on either source wiki (a genuine
roster-wide asset gap, not a scraping miss — confirmed via both wikis' raw HTML and their `og:image`
placeholders) — `img` is `""` for these two rather than a broken link.

---

### 📦 Items

| Module | Factory   | Items | Description                                                       |
| ------ | --------- | ----- | ----------------------------------------------------------------- |
| items  | `items()` | 226   | Functional items — resources, currencies, chests, buffs, and more |

Sourced from the wiki's master item catalog page, which covers 415 items across 18 category tabs.
Birthday Card entries are skipped (a yearly login freebie with no gameplay data worth tracking), and
the remaining 17 tabs split into two modules by kind: functional items go here, cosmetic skins go to
`skins()` below.

`category` is one of 10 values (`Hero Items`, `Pet`, `Gear Materials`, `Chest`, `Buff`,
`Fire Crystal`, `Experts`, `Teleporter`, `Others`, `Event`), taken directly from the wiki's own tab
labels. Five items are tagged under more than one tab on the source site (all involving Chest, e.g.
Seeker's Chest is tagged both `Chest` and `Experts`) — `Chest` wins as the resolved category in
every case, since it's the more specific classification. `id` is the item's own wiki URL slug rather
than a freshly-slugified name, since several names repeat across categories (e.g. "Garden of
Delights" exists as both an Avatar Frame skin and a Name Card skin) and the source slugs are already
unique.

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
| skins  | `skins()` | 189   | Cosmetic skins — avatar frames, nameplates, and vehicle/city skins |

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

`chiefGearSlots()` covers the 6 equip slots (Cap, Watch, Coat, Pants, Ring, Weapon), hand-entered
from the page's prose rather than scraped from a table, since no table lists them: Cap/Watch buff
Lancer, Coat/Pants buff Infantry, and Ring/Weapon buff Marksman. The 3-piece/6-piece same-quality
set bonus mentioned on the page isn't modeled — the wiki only describes the mechanic in prose
(`"raise ... by x%"`) and never gives real numbers for it.

---

### 📿 Chief Charm

| Module     | Factory        | Items | Description                                                   |
| ---------- | -------------- | ----- | ------------------------------------------------------------- |
| chiefCharm | `chiefCharm()` | 75    | The shared upgrade table every chief charm progresses through |

Same shape as `chiefGear()`, minus the equip-slot and deployment-capacity concepts (charms have no
stated slot breakdown on the source page). `materials` are Charm Guide, Charm Design, and Charm
Secrets — the last one only appears starting at level 11 stage 1, not from level 1, matching the raw
table exactly rather than assuming a fixed three-material set throughout.

---

### 🔬 Research

| Module   | Factory      | Items | Description                                                  |
| -------- | ------------ | ----- | ------------------------------------------------------------ |
| research | `research()` | 278   | The full Research Center tech tree, one node per level table |

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
`img` is `""` for these three, same treatment as Pets' Frost Gorilla/Frostscale Chameleon gap, since
no icon exists anywhere to reference.

Each troop type's 4 tier-2 Molten I items also require that troop type's own Exalted capstone at
Level 1, alongside their existing War Academy building gate — also confirmed from in-game knowledge
rather than scraped, since the wiki's Prerequisites column for these 12 nodes omits it.

Each troop type's 4 tier-4 Molten X II items (`Molten Blades II`, etc.) similarly require that troop
type's own tier-3 node (`indomitable-wall`, `starfire`, or `meridian-phalanx`) at Level 1 — this one
is scraped directly from each node's own page, not user-supplied.

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

## 📋 Raw Data Access

JSON data files can be imported directly, without importing the JS/TS package:

```ts
import buildings from "whiteout-survival-data/data/buildings.json";
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
