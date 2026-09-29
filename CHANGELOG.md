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

### Fixed

- Corrected a handful of data errors picked up from the source wikis (wrong costs, mislabeled tiers,
  copy-pasted prerequisites that pointed at the wrong troop type).
- Cleaned up a few name mismatches and missing links in the research tech tree so every prerequisite
  points at the correct node.

Initial repository scaffold: build tooling, lint/format config, test harness, and the shared
`QueryBase<T>` query builder.
