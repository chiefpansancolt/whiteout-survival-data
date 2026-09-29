# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `buildings()`: every building's full upgrade progression — Furnace, Embassy, Research Center,
  Command Center, Infantry/Marksman/Lancer Camp, War Academy, Infirmary, Storehouse, Barricade,
  Hunter's Hut, Sawmill, Coal Mine, Iron Mine, Clinic, Cookhouse, and Shelter.
- `facilities()`: buildings with no upgrade levels — Hero Hall, Dawn Academy, Beast Cage,
  Lighthouse, Arena, Chief's House, Explorer's Cabin, and Suggestion Box.
- `heroes()`: all 13 Generation 0 heroes, with their skills, stats, and exclusive weapons.
- `experts()`: all 10 Dawn Academy Experts across 3 generations, with their skills and progression.
- `pets()`: all 14 Beast Cage pets, with their skills, levels, and unlock chain.
- `items()` and `skins()`: the full item catalog (226 items and 189 cosmetic skins).
- `chiefGear()`, `chiefGearSlots()`, and `chiefCharm()`: Chief Gear and Chief Charm upgrade tables.
- `research()`: the full Research Center tech tree, covering Battle, Growth, Economy, and both T11
  and T12 troop research for Infantry, Marksman, and Lancer.
- `heroGearEnhancement()`, `heroGearEmpowerment()`, and `heroGearMasteryForging()`: the three Hero
  Gear upgrade tables.
- Added the T12 troop tech that wasn't yet published anywhere else: the Exalted capstone unlocking
  each troop's advanced research, plus the Molten II and Molten III item tiers, gated in the right
  in-game order.
- `allianceBanner()`: the Alliance Territory banner's build-cost table, 37 level ranges from 0-10 up
  to 276-285.
- `allianceTech()`: the full Alliance Technology tree, 59 tech lines across Growth, Territory, and
  Battle.
- `allianceFacility()`: the 8 map-based Alliance Facility types and their per-level bonuses. Sourced
  from a user-provided screenshot rather than the wiki, which has no structured data for this page
  at all.
- `eventBuff()`: which of 11 buff sources (Pet Skills, President Skills, Facility Buff, etc.) apply
  in each of 14 game modes, sourced from a user-provided screenshot rather than any wiki page.
- `vip()`: the full VIP 1-12 progression (XP cost and unlocked bonuses per level), sourced from the
  wiki's official infographic image, since that page has no HTML table either.
- `lumberCamp()`, `treeOfLife()`, and `decoration()`: the full Daybreak Island feature — Lumber Camp
  and Tree of Life upgrade tables, and all 102 named decorations across 8 categories, including the
  Starry Lighthouse and Harbor of Hope (folded in as the two `Unique` decorations, since neither
  follows a standard rarity progression). Sourced from a third-party guide site rather than the
  official wiki, which has no page for this feature. The Rare/Epic/Mythic/ Unique categories' full
  per-level cost/Prosperity/buff breakdown, plus 33 additional limited-availability decorations from
  shop rotations and event packs, were researched and supplied directly by the package maintainer.
  "Limited" isn't its own category — it's a `limited` boolean on a decoration's real Epic/Mythic
  tier, reflecting how it's obtained rather than a separate rarity.

### Fixed

- Corrected a handful of data errors picked up from the source wikis (wrong costs, mislabeled tiers,
  copy-pasted prerequisites that pointed at the wrong troop type).
- Cleaned up a few name mismatches and missing links in the research tech tree so every prerequisite
  points at the correct node.

Initial repository scaffold: build tooling, lint/format config, test harness, and the shared
`QueryBase<T>` query builder.
