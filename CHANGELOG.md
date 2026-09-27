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

Initial repository scaffold: build tooling, lint/format config, test harness, and the shared
`QueryBase<T>` query builder.
