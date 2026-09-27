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

Initial repository scaffold: build tooling, lint/format config, test harness, and the shared
`QueryBase<T>` query builder.
