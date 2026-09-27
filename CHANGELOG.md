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
  an identical cost/power/time curve and cap at Level 30 with no Fire Crystal tier, differing only
  in their Furnace prerequisite floor. Excluded a stray "FC 1" row that appeared on
  whiteoutsurvival.wiki's Sawmill/Coal Mine/Iron Mine pages — byte-identical across all three
  buildings and citing the wrong Furnace FC tier for a first FC level — as a templating artifact,
  consistent with wostools.net's explicit confirmation that none of the four has a Fire Crystal
  tier.

Initial repository scaffold: build tooling, lint/format config, test harness, and the shared
`QueryBase<T>` query builder.
