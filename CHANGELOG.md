# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `buildings()`: first data module, covering the Furnace's full 80-level upgrade progression —
  standard Levels 1–30 and the 50-entry Fire Crystal extension (`30-1..30-4`, `FC 1` through `FC 9`
  with their sub-levels, and `FC 10`). Sourced from `wostools.net` (table data) and
  `whiteoutsurvival.wiki` (images and cross-checks).
- Embassy added to the `buildings()` dataset, with the same 80-level shape as the Furnace. Every
  standard level requires the Furnace at a matching or higher level.
- `BuildingRequirement.level` now accepts a string as well as a number, so Fire Crystal levels can
  self-reference a prior level by its label (e.g. `"FC 1"`, `"30-4"`). Fire Crystal levels now carry
  a derived `prerequisites` chain (the source wikis show no Prerequisites column for that range) for
  both Furnace and Embassy — see the README for the exact chain rule.
- Research Center added to the `buildings()` dataset. Caps at standard Level 30 with no Fire Crystal
  tier, so `Building.fireCrystalImg` is now optional.
- Command Center added to the `buildings()` dataset. Adds `rallyCapacity`/`marchCapacity` to
  `BuildingLevel` (optional, Command-Center-specific for now). Its Fire Crystal levels are the first
  to carry an explicit, wiki-sourced cross-building `prerequisites` entry (Furnace and Embassy at a
  matching FC tier), alongside the derived same-building chain used for every other building.
- Infantry Camp, Marksman Camp, and Lancer Camp added to the `buildings()` dataset. Adds
  `trainingCapacity`/`trainingSpeedBonusPercent` to `BuildingLevel`. All three buildings share
  identical cost/power/Fire Crystal curves, differing only in their Furnace prerequisite floor
  (Lv.7/8/9) and troop type; their Fire Crystal levels carry a Furnace-only cross-building gate
  (unlike Command Center's Furnace-and-Embassy gate).
- Corrected a wostools.net data error at standard Level 23 (Iron cost) shared by all three troop
  camps: it listed 490,000, but the surrounding progression (630,000 at Level 22, 1,000,000 at
  Level 24) and whiteoutsurvival.wiki both point to 780,000.
- War Academy added to the `buildings()` dataset. Adds `researchSpeedBonusPercent` to
  `BuildingLevel`, set on every level (unlike the sparse `trainingSpeedBonusPercent` on the troop
  camps). This is the first building with no standard tier at all — it has 46 levels, starting
  directly at `FC 1`, with no `fireCrystalImg` since there is no separate base/FC visual state.
  Corrected another wostools.net data error, at FC 9-1 through FC 10 (Iron cost): it listed
  7,200,000, but the surrounding progression (3,600,000 at FC 8-4) and whiteoutsurvival.wiki both
  point to 4,200,000.
- Infirmary, Storehouse, and Barricade added to the `buildings()` dataset. Adds `infirmaryCapacity`
  to `BuildingLevel` (sparse, like the troop camps' speed bonus). Storehouse caps at Level 30 with
  an identical cost/power/time curve to Embassy's (Furnace Lv.9 floor). Barricade caps at Level 10
  and is the first building with no prerequisite at Level 1, and the first whose Furnace gate skips
  levels between its own (e.g. Level 2 needs only Furnace Lv.7, Level 3 needs Lv.10) instead of
  tracking every level.
- Corrected two more wostools.net data errors: Infirmary Level 12 Coal listed as 54,000 (the
  surrounding progression — 65,000 at Level 11, 110,000 at Level 13 — and whiteoutsurvival.wiki both
  point to 84,000), and Infirmary FC 4-1 through FC 4-4 power values, where whiteoutsurvival.wiki's
  precise figures form a clean arithmetic progression that wostools.net's rounded figures did not.
- Hunter's Hut, Sawmill, Coal Mine, and Iron Mine added to the `buildings()` dataset. All four share
  an identical cost/power/time curve through Level 30, differing only in their Furnace prerequisite
  floor, then each gets one bonus `FC 1` level beyond that (see next entry).
- Corrected course on the "FC 1" row on these four buildings' pages: initially dismissed as a
  whiteoutsurvival.wiki templating artifact (byte-identical values across buildings, citing Furnace
  FC 2 rather than FC 1). Raw HTML confirms it is real, deliberate data — present identically in the
  unrendered markup of all four pages, not just the summarized fetch. Added it as a genuine sole
  `FC 1` level on all four buildings (`maxLevelLabel` is now `"FC 1"`, not `"30"`), still requiring
  Furnace FC 2 and no Fire Crystals in its cost, exactly as scraped.
- Clinic, Cookhouse, and Shelter added to the `buildings()` dataset — absent from wostools.net, so
  sourced and cross-checked entirely against whiteoutsurvival.wiki's raw HTML. All three cap at
  Level 10 plus one bonus `FC 1` level, which correctly requires Furnace FC 1 (unlike the production
  buildings' FC 2 tier-skip). `Shelter` is modeled as a single building, matching the wiki's own
  page scope, even though players can build up to eight.
- `facilities()`: new data module for buildings with no upgrade levels, power, or cost — Hero Hall,
  Dawn Academy, Beast Cage, Lighthouse, Arena, Chief's House, Explorer's Cabin, and Suggestion Box.
  Each is a `Facility` (`id`, `name`, `img`, `description`) rather than a `Building`, since forcing
  them into the leveled shape would leave `levels`/`power`/`maxLevelLabel` meaningless.
- `heroes()`: new data module, covering Generation 0 (the 13 pre-Legendary heroes). Adds `Hero`,
  `HeroSkill`, `HeroStats`, `ExclusiveWeapon`, and `HeroShardTier` types. `subClass`
  (`Growth`/`Combat`) is stored per hero rather than derived from rarity/class, since it doesn't
  follow a strict rule (confirmed via raw HTML: Gina and Jasser are both Epic Marksman but differ).
  `exclusiveWeapon` is Legendary-only (confirmed structurally: Rare/Epic pages have no `#special`
  section at all). Data sourced and verified entirely against whiteoutsurvival.wiki's raw HTML,
  parsed with BeautifulSoup rather than trusting AI-summarized fetches, which invented a nonexistent
  stat block during initial research on this module.
- Resolved a locale-routing quirk on two Generation 0 heroes' pages (Cloris, Ling Xue), where the
  bare URL slug intermittently served French or German content instead of English; fetched their
  correct English-locale slugs instead of guessing field values from translated text.
- `experts()`: new data module covering the full roster of 10 Dawn Academy Experts across 3
  generations. Adds `Expert`, `ExpertSkill`, `ExpertProgression`, `ExpertMilestoneReward`,
  `ExpertLootTableEntry`, and `ExpertAffinityLevel` types. `title` (narrative) and `specialty`
  (mechanical category) are separate fields from separate sources, not the same value scraped twice.
  Data extracted from hidden hover-tooltip tables in whiteoutsurvival.wiki's raw HTML (the visible
  page text only shows a value range like "2 → 8"); cross-validated per expert by summing the
  Affinity table's `advancementCost` column against wostools.net's independently reported "Total
  Sigils" figure — an exact match for all 10 experts.
- Discovered mid-build that `ExpertSkill` needed to cover more than the initially planned
  continuous-scaling shape: some skills/talents use fixed milestone item-tier rewards instead of a
  scaling value (`milestoneRewards`), some use a random-reward chest on either a skill or the talent
  (`lootTable`, not talent-exclusive), and a few are entirely flat with none of the above
  (`maxLevel` defaults to `1`, not `0`, for these). Confirmed via raw HTML that this variance is
  real per-skill data, not a parsing gap, before extending the schema.

- `pets()`: new data module covering the full roster of 14 Beast Cage pets across 5 rarities. Adds
  `Pet`, `PetSkill`, `PetUnlockRequirement`, `PetLevel`, and `PetStatValue` types. `maxLevel` varies
  by rarity (50/60/70/80/100); each pet's skill scales in tiers of `maxLevel / 10`, aligning with
  the same every-10-levels milestones as the level table's refinement jumps. `unlockRequirement`
  models either a `furnaceLevel` gate (the three earliest pets) or a `prerequisitePet` gate (every
  later pet) — verified as a single linear unlock chain across the whole roster, not branched by
  rarity.
- `PetSkill.cooldownSeconds` is optional, and a new optional `cooldownSecondsByTier` field was added
  to cover Musk Ox and Giant Elk: their skills have no numeric effect that scales per tier, so the
  cooldown itself shortens instead — the per-tier cooldown values are also mirrored into `values` so
  the tier count still lines up with every other pet's shape.
- Confirmed that Troop Attack and Troop Defense are identical at every level for every pet in the
  current roster (an initial inventory pass had assumed some pets diverge; raw data across the full
  14-pet roster showed no divergence anywhere).
- Frost Gorilla and Frostscale Chameleon have no portrait image on either source wiki — confirmed
  via raw HTML that this is a genuine roster-wide asset gap (both wikis fall back to the same
  generic `og:image` placeholder), not a scraping miss. `img` is `""` for these two rather than a
  broken link or placeholder URL. Their `unlockRequirement.prerequisitePet` values were also missing
  from whiteoutsurvival.wiki (truncated unlock text) and were cross-sourced from wostools.net
  instead.

- `items()` and `skins()`: two new data modules sourced from the wiki's master item catalog page
  (415 items across 18 category tabs, Birthday Card entries skipped). Split by kind rather than one
  module: 226 functional items (`items()`, adds `Item` and `ItemRewardRate` types) and 189 cosmetic
  skins (`skins()`, adds `Skin` and `SkinBonus` types).
- `Item.id` and `Skin.id` use the item's own wiki URL slug rather than a freshly-slugified name,
  since several names repeat across categories (e.g. "Garden of Delights" is both an Avatar Frame
  and a Name Card) and the source slugs are already unique. 5 items tagged under more than one wiki
  tab (all involving Chest) resolve to `Chest` as the single stored category, the more specific of
  the two.
- `Item.rewardRates` is an optional loot-table field for Chest items, parsed from whichever of two
  structured page shapes is present — a "Reward Rates" bullet list or an `Item`/`Quantity`/`Chance`
  table with the item-name cell spanning several tiers via `rowspan`. Only 8 of 50 chests present
  their rewards in either structured shape; the rest are prose-only and get no `rewardRates`.
- `Skin.bonus` is parsed from a clean `Bonus: <stat> +<value>` line where present (152 of 189
  skins); left `undefined` — not a broken parse — for skins that genuinely grant no stat bonus, and
  for the handful of City Skins (e.g. Frost Sphere VI) whose bonus text describes a multi-part
  "Domain Bonus" area effect that doesn't reduce to a single stat/value pair.
- Skin duration (`Permanent`, `30 day`, or a rank-dependent breakdown like
  `Permanent/7 days/3 days`) proved too inconsistent to model as a structured field and is kept in
  the free-text `description` instead, following the same judgment call as Pet's
  `maxRefinementPercent` — store what the source actually gives cleanly, not a shape the data
  doesn't support.

- `chiefGear()`/`chiefGearSlots()` and `chiefCharm()`: two new data modules sourced from
  `https://www.whiteoutsurvival.wiki/chief-gear/chief-gear/`. Unlike every prior module, this page
  describes a shared upgrade progression, not a roster of uniquely-named things — every equipped
  gear piece and every charm progresses through the exact same table, so `chiefGear()` (150 rows)
  and `chiefCharm()` (75 rows) query those tables directly. Adds `ChiefGearSlot`, `ChiefGearLevel`,
  `ChiefGearMaterial`, `ChiefCharmLevel`, and `ChiefCharmMaterial` types.
- `chiefGearSlots()` covers the 6 equip slots (Cap, Watch, Coat, Pants, Ring, Weapon), hand-entered
  from the page's prose rather than scraped from a table (no table lists them) — Cap/Watch buff
  Lancer, Coat/Pants buff Infantry, Ring/Weapon buff Marksman.
- Every `materials[].itemId` in both tables (Hardened Alloy, Polishing Solution, Design Plans, and
  Lunar Amber for gear; Charm Guide, Charm Design, and Charm Secrets for charms) resolves to a real
  slug in last session's `items()` catalog, confirmed by matching each material's source icon
  filename against the icon already downloaded for that item — verified with a test asserting every
  material id resolves via `items().find(id)`.
- Caught and fixed a parsing bug while building the Chief Gear table: bs4's `NavigableString` also
  exposes a `get_text()` method, so a naive `hasattr(node, "get_text")` check to skip whitespace
  text nodes between an `<img>` tag and its quantity `<span>` matched the whitespace node itself and
  returned an empty string, producing a material quantity of 0 for every row. Fixed by checking
  `isinstance(node, Tag)` instead.
- The 3-piece/6-piece same-quality Chief Gear set bonus mentioned in the page's prose isn't modeled
  — the wiki only describes the mechanic (`"raise ... by x%"`) and never gives real numbers for it.

- `research()`: new data module covering the full Research Center tech tree — 263 nodes across 9
  categories (Battle, Growth, Economy, T11/T12 Infantry, T11/T12 Marksman, T11/T12 Lancer), sourced
  page-per-node like `items()` rather than a shared table like Chief Gear/Charm. Adds
  `ResearchNode`, `ResearchLevel`, `ResearchRequirement`, `ResearchCost`, and `ResearchBonus` types.
- `ResearchCost.itemId` resolves to a real `items()` slug, confirmed by direct visual inspection of
  the resource icons rather than guessed from filenames — `item_icon_102/103/104/105/106` are Meat,
  Wood, Coal, Iron, and Steel respectively (the last sharing its artwork with the `steel` item's
  current icon under an older cached URL), with later T11/T12 tiers drawing on Fire Crystal Shard
  and Refined Fire Crystal.
- `ResearchRequirement` is tagged with `type: "building" | "research" | "unreleased"` plus a
  look-up-able `id`: building gates (`Research Center 7`, `War Academy FC10`) resolve to the real
  `buildings()` slug with `level` normalized to match that building's own `BuildingLevel.label`
  exactly (so `"FC10"` becomes `"FC 10"` and round-trips into `buildings().find(id)!.levels`);
  cross-references to another node's level resolve to this dataset's own slug.
- Discovered and correctly handled 12 forward references (across `Molten Lance II` and eleven
  sibling T11/T12 tech lines) to research nodes the wiki describes in prerequisite text but hasn't
  published a detail page for yet (confirmed via a direct 404 check, not assumed) — these get
  `type: "unreleased"` with a slugified `id` that intentionally does not resolve against
  `research()`, rather than crashing the parse or silently dropping the reference.
- Corrected several confirmed spelling inconsistencies on the source wiki via an explicit,
  manifest-verified alias list rather than fuzzy matching: `Assault Techniques` (the real node is
  `Assaut Techniques`), `Bulwark Formation` → `Bulwark Formations`, `Coal Minning`/`Ion Mining`/
  `Iorn Mining` → `Coal Mining`/`Iron Mining`, `Marskman Armor` → `Marksman Armor`,
  `Helios Marksmen` → `Helios Marksman`, and `Survival Expansion` → `Survival Techniques`. Also
  resolved several tech lines that reference a sibling node by a bare name with no Roman-numeral
  suffix (e.g. `Weapons Prep 1`, meaning `Weapons Prep I`) by inferring the numeral from the
  referencing node's own tier.
- `ResearchLevel.researchTimeSeconds` is optional — a few T12 nodes (e.g. `Exalted Blunderbuss`)
  genuinely have no Time value on their source page.

- `heroGearEnhancement()`, `heroGearEmpowerment()`, and `heroGearMasteryForging()`: three new data
  modules sourced from `https://www.whiteoutsurvival.wiki/hero-gears/hero-gear/`. Like Chief
  Gear/Charm, this page has no per-item catalog — three separate shared upgrade tables instead. Adds
  `HeroGearCost`, `HeroGearEnhancementLevel`, `HeroGearEmpowermentLevel`, and
  `HeroGearMasteryForgingLevel` types. A proposed fourth module for the Grey/Green/Blue/Purple
  gear-quality reference list mentioned in the page's prose was dropped, since it isn't a real,
  independently useful entity.
- `heroGearEnhancement()` (100 levels) costs Enhancement XP Component at every level, matching the
  page's own description of the mechanic. `heroGearMasteryForging()` (84 rows across 20 levels with
  0–4 sub-stages) costs Essence Stones, also matching its own description, with a Custom Mythic Hero
  Gear Chest added to the cost from Level 19 on.
- `heroGearEmpowerment()` (100 levels) is modeled directly from its table even though **the wiki
  gives this mechanic no explanatory prose at all**, unlike Enhancement and Mastery Forging. Its
  cost composition changes across the table (2× Custom Mythic Hero Gear Chest at Level 1,
  Enhancement XP Component through Levels 2–99, then both a Chest and Mithril at Level 100) — every
  cost item is a confirmed real match against `items()`, but what in-game action consumes this table
  couldn't be independently verified from the source, so the gap is documented rather than guessed
  at.

Initial repository scaffold: build tooling, lint/format config, test harness, and the shared
`QueryBase<T>` query builder.
