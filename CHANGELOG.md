# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Game data

- `serverTimeline()`: the 30 server age milestones from day 0 to day 1160, with the heroes, pets,
  and other content that unlock at each one. `resolve()` loads the full hero, expert, pet, event,
  and Fire Crystal level badge entries. `serverAge()` and `serverTimelineStatus()` take a server
  start date and give the server age, what is unlocked, and what comes next. Each hero lists the
  events that give its shards.
- `fireCrystalTable()` and `fireCrystalLevels()`: a table of the Fire Crystals and Refined Fire
  Crystals that each building needs for FC 1 to FC 10, with a column for each level and resource, a
  row for each building, and a total for each column. A level range gives a table of only some
  levels. `fireCrystalLevels()` gives the FC 1 to FC 10 badge icons.
- `fireCrystalShardTable()`: the Fire Crystal Shards and Refined Fire Crystals that T11 and T12
  troop research costs, with a column for each troop type, tier, and resource. The Unlock row sums
  the research that unlocks the troop, and the extras follow by research tier with a sum and a
  total. A tier option shows only T11, only T12, or both.
- Building costs of Wood, Coal, Iron, Meat, Fire Crystals, and Refined Fire Crystals have an
  `itemId` that resolves through `items()`.
- Pet prerequisites have the `petId` of the required pet.
- Chief Gear and Chief Charm levels have an `order`, and the 30 speedup items have a `speedup` with
  their type and length in minutes. Every speedup type has a 1m, 5m, 1h, 3h, and 8h item. Nine of
  them are placeholders with no icon.

### Changed

- Pet unlock days follow the server timeline: 54 for the first five pets, then 90, 140, 200, 280,
  and 370.

### Fixed

- The Daybreak Island decorations Hero’s Sanctum and Floating Market have their names spelled
  correctly.

## [0.1.0] - 2026-10-07

First release. It includes the build tooling, lint and format config, the test harness, and the
shared `QueryBase<T>` query builder.

### Added

#### Game data

- `buildings()` and `facilities()`: every building's upgrade progression with cost, build time,
  power, prerequisites, and capacity bonuses, the Fire Crystal levels, the entertainment buildings,
  and the buildings with no upgrade levels. Buildings have a `category` and a `byCategory()` filter.
- `heroes()`: all 65 heroes (Generation 0 to 17) with stats, Exploration and Expedition skills,
  skill manual costs, shard costs, the 80-level progression, exclusive weapons, and shard sources.
  `estimateHeroStats()` estimates a hero's stats at level 80 for any star and tier.
- `heroWidgets()`: the Widgets that each exclusive weapon level costs.
- `heroGearEnhancement()`, `heroGearEmpowerment()`, `heroGearMasteryForging()`, and
  `heroGearStats()`: the hero gear upgrade tables, and the Attack or Defense, HP, and Lethality or
  Health of each gear slot and troop type by level, with the Mithril milestone bonuses.
- `experts()` and `expertRelationships()`: the 10 Dawn Academy experts with skills, talents,
  affinity levels, power per level, sigil costs, and the relationship statuses.
- `pets()`: the 14 Beast Cage pets with skills, levels, advancement costs, and advancement score.
- `items()` and `skins()`: the item catalog (hero shards, chests, speedups, and event items) and the
  cosmetic skins, with icons.
- `chiefGear()`, `chiefGearSlots()`, `chiefCharm()`, and `chiefCharmSlots()`: the Chief Gear and
  Chief Charm upgrade tables with score, and an icon for each slot and level.
- `chiefGearConverter()` and `chiefCharmConverter()`: the fixed item exchange rates.
- `research()`: the full Research Center tech tree, including the T11 and T12 troop research.
- `troops()`: Infantry, Lancer, and Marksman with the resource cost and training time of tiers 1 to
  12 and the tier 12 promotion cost. Camp levels have a `trainingCapacity`.
- `allianceBanner()`, `allianceTech()`, `allianceFacility()`, and `allianceFortress()`: the alliance
  territory banner, the technology tree, the map facilities, and the castle, strongholds, and
  fortresses.
- `events()`, `eventBuff()`, and `vip()`: 65 alliance, solo, rookie, and holiday events with their
  scoring, rewards, and tips, the buff sources that apply in each game mode, and the VIP 1 to 12
  progression.
- `lumberCamp()`, `treeOfLife()`, and `decoration()`: the Daybreak Island upgrade tables and 103
  decorations.

#### Calculators

- `calculateSvs()`, `calculateAllianceShowdown()`, `calculateKingOfIcefield()`, and
  `calculateHallOfChief()`: event score calculators that read the scoring lists of each event, with
  Valeria's and Baldur's bonuses where they apply.
- `calculateChiefGear()` and `calculateChiefCharm()`: materials, score, power, and event points for
  upgrading Chief Gear and Chief Charms between two levels.
- `calculateTroops()`: troops, resources, and time for training and promotion across the three
  camps, with training speed and cost reduction.
- `calculateResearch()`: resources, time, and power for research goals, with research speed buffs
  and the prerequisites that are not met.
- `calculatePets()`: pet food, advancement items, stat gains, power, and event points for leveling
  pets.
- `calculateExperts()`: Books of Knowledge, sigils, skill EXP, and affinity points for expert levels
  and skill levels.
- `calculateBuildings()`: resources, build time, power, and event points for building upgrades, with
  the steps of prerequisite buildings added.
- `calculateHeroGear()`: the resources, power, stats before and after, and event points to level one
  hero gear piece through mastery forging, enhancement, and empowerment.
- `calculateHeroUpgrade()`: the shards for a star upgrade, the skill manuals, and the Widgets for
  one hero, with the skill levels that need more stars and the event points.
- The constants the calculators use (`TROOP_CALCULATOR`, `RESEARCH_CALCULATOR`,
  `HERO_UPGRADE_CALCULATOR`, and others) are exported, so an app can show the same choices and
  limits.
