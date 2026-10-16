# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

#### Game Data

- `pets()`: fix the Pet Power of Giant Tapir at level 29 and levels 61 to 70, the Troop Attack and
  Troop Defense of Musk Ox at level 57, and those of Frost Gorilla at level 58.

## [0.6.0] - 2026-10-16

### Added

#### Game Data

- `pets()`: `petRefiningPower()` and `PET_REFINING_POWER_PER_PERCENT`, the Refining Power of a pet
  from its six refined percents.
- `serverTimeline()`: the server age at which Chief Gear tiers, Chief Charm levels, and the Chief
  Gear and Chief Charm converters unlock, with icons of the highest gear and charms.

## [0.5.0] - 2026-10-15

### Added

#### Game Data

- `heroGearEmpowerment()`: the flat Power of each empowerment milestone, 200,000 at levels 20, 40,
  60, 80, and 100.
- `calculateHeroGear()`: a `quality` of the piece, with the base Power of Common, Uncommon, Rare,
  Epic, and Mythic gear. Gear below Mythic can only be enhanced.

### Fixed

#### Game Data

- `calculateHeroGear()`: the Power of a piece, and the Power gained by a plan, include the flat
  Power of the empowerment milestones.

## [0.4.1] - 2026-10-15

### Fixed

#### Game Data

- `heroes()`: fix the level Power of Natalia, whose level 80 total is 205,260.
- `heroGearEnhancement()` and `heroGearEmpowerment()`: the Power per level is now the Power of a
  piece with no mastery forging, a quarter of the earlier values.
- `calculateHeroGear()`: the Power of a piece, and the Power gained by a plan, include the mastery
  forging bonus, and a piece at level 0 has 2,500 Power.

## [0.4.0] - 2026-10-15

### Added

#### Game Data

- `heroes()` and `items()`: shard icons and shard items for 17 more heroes, which makes 30 heroes
  with a shard icon.
- `heroes()`: the Star Power at each star label, such as 3.2, in the `tierPower` of every star for
  heroes with a confirmed maximum star Power. Four labels are predicted with a formula.
- `heroes()`: the Power of each of the 10 exclusive weapon levels.
- `heroes()`: the star that each level of the Talent skill of Jeronimo and Natalia needs.

### Changed

#### Game Data

- `heroes()` and `items()`: the shard icons of the earlier heroes use the same size and no longer
  show the shard count.

### Fixed

#### Game Data

- `tundraAlbum()`: update the image of The Bell Tolls piece 7, and the cover and piece 12 images of
  Tundra Adventure.
- `heroes()`: fix the exclusive weapon power of Philly, which was 27,000 and is now 270,000.
- `heroes()`: fix the Star Power at stars 1 to 4 of Rare, Epic, and Legendary heroes through
  Generation 5, and add the Star Power at star 0.

## [0.3.0] - 2026-10-14

### Fixed

#### Game Data

- `buildings()`: fix furnace level requirement for FC area Embassy Levels.
- `research()`: fix the power values of several research levels.

## [0.2.2] - 2026-10-14

### Fixed

#### Game Data

- `dailyMissions()`: fix Claim Online Rewards missing level 2.

## [0.2.1] - 2026-10-14

### Fixed

#### Game data

- `pets()`: the troops power of Cave Hyena at level 5 is corrected, and the invalid refined troops
  power at level 20 is removed.

## [0.2.0] - 2026-10-12

### Added

#### Game data

- `dailyMissions()`: the 21 in-game Daily Missions with their levels, the task and the rewards of
  each level. The activeness is the first reward, and `dailyMissionRewardLevels()` gives the reward
  levels of the activity bar with their rewards. The items Activeness, Alliance XP, Activity Triumph
  Points, and four resource packs are new in `items()`.
- `tundraAlbum()`: the Tundra Album albums, with the 9 puzzles of each, the star level and the image
  of every piece, the reward of each puzzle, and the buff of the album. It holds 14 of the 16
  albums. `tundraAlbumPieceRewards()` gives the 80 tiers of rewards for the total of pieces that you
  collect.
- `collectionRewardLevels()`: the 51 levels of the collection with the rewards of each, and
  `collectionMedallions()` with the 11 medallions, their pictures, and the troop buffs that each
  gives.
- `alliancePrestige()`: the six prestige buildings of an alliance, the event that gives each one,
  and their Resource Gathering Speed bonus by tier.
- 24 more skins, including the new skin type `Chat`. They have a bonus and sources where the package
  owner states them, and no `img` yet.
- The Command Center has `marchCapacity` and `rallyCapacity` on every Fire Crystal level, FC 1 to FC
  10 and the sub-levels between them.
- `events()` have an optional `versions` field for the missions and tiers of an event that differ by
  the age of the state. Vision of Dawn has two versions, and the Fire Crystal age version has the
  missions and the Hope chests of that age.
- Every level of every hero skill has `effects`: the name, the amount, and the unit of each number
  in the skill text, so a value such as the Stamina Cost Reduction of Gina can be read without
  parsing the description.
- `chiefGearSetBonus()` and `chiefGearSetBonuses()`: the 3 piece Defense and 6 piece Attack set
  bonuses of Chief Gear, from the level of each piece worn. Some values are assumptions of the
  owner.
- `events()` for Alliance Mobilization, Alliance Showdown, and State of Power list the extra reward
  tiers that the expert skills Blazing Sunrise, Dawn Hymn, and Well Prepared add, with their rewards
  and the point threshold of the one tier that is known.
- `events()` have an optional `schedule`: a repeat rule and the runs of a cycle, in a shape that a
  calendar can use, for 50 events.
- `heroGearSlots()`: the four Hero Gear slots, Goggles, Gloves, Belt, and Boots, with an icon of the
  piece for each troop type each
- `unreleasedExperts()`: the experts that are announced and not released, flagged `unreleased` in
  the expert data, with a name, an icon, and the unlock requirement. It holds Justus.
- `serverTimeline()`: the 33 server age milestones from day 0 to day 1240, with the heroes, experts,
  pets, and other content that unlock at each one. `resolve()` loads the full hero, expert, pet,
  event, and Fire Crystal level badge entries. `serverAge()` and `serverTimelineStatus()` take a
  server start date and give the server age, what is unlocked, and what comes next. Each hero lists
  the events that give its shards.
- `fireCrystalTable()` and `fireCrystalLevels()`: a table of the Fire Crystals and Refined Fire
  Crystals that each building needs for FC 1 to FC 10, with a column for each level and resource, a
  row for each building, and a total for each column. A level range gives a table of only some
  levels. `fireCrystalLevels()` gives the FC 1 to FC 10 badge icons.
- `fireCrystalShardTable()`: the Fire Crystal Shards and Refined Fire Crystals that T11 and T12
  troop research costs, with a column for each troop type, tier, and resource. The Unlock row sums
  the research that unlocks the troop, and the extras follow by research tier with a sum and a
  total. A tier option shows only T11, only T12, or both.
- Building costs of Wood, Coal, Iron, Meat, Fire Crystals, and Refined Fire Crystals have an
  `itemId` that resolves through `items()`. The furniture costs of the entertainment buildings do
  too, with 42 new Furniture items that have no icon yet. `items()` has the Wish Sigil that buys
  them.
- Pet prerequisites have the `petId` of the required pet.
- Timeline unlocks can have a `key`, set for the War Academy and T12 research unlocks, and
  `heroGenerationAt()` gives the highest hero generation unlocked at a server age.
- The facilities have an `unlockFurnaceLevel`, and `DAYBREAK_ISLAND_UNLOCK_FURNACE_LEVEL` gives the
  Furnace level that unlocks Daybreak Island.
- Event scoring actions that name one item have an `itemId`, six events have a `scoreUnit`, and the
  61 events that are not Core events have a `resultShape`. `eventRankingTables()` gives every
  ranking table of an event in one shape.
- `calculateResearch()`, `calculateTroops()`, and `calculateExperts()` give `eventPoints` and
  `speedupPointsPerMinute`, and the research and troops results give `speedupMinutesNeeded`.
- Bonuses of research, skins, experts, VIP, and Alliance Tech have a `statKey`, a parsed `amount`
  and `unit`, and the research bonuses have a `totalAmount` that adds up the levels of a node.
  Alliance Tech nodes have a `stat`.
- Research nodes have a `queue`, and `researchTree()` gives the position and links of every node on
  the seven tabs of the Research tech tree.
- `chiefOrders()`: the Chief Orders with Contentment cost and cooldown, the three orders that
  replace others at Fire Crystal level 1, and a helper for the time an order can be used again
- `presidentSkills()`: the skills of the President with Authority cost and uses, and the global
  perks with their bonus, duration, and cooldown
- `castleAppointments()`: the castle positions and the buffs each gives, with the boosted minister
  values
- `dailies()`: a default list of daily tasks, the steps of a daily routine guide. The in-game daily
  missions are in `dailyMissions()`.
- Chief Gear and Chief Charm levels have an `order`, and the 25 speedup items have a `speedup` with
  their type and length in minutes.

#### Calculators

- `calculateBeasts()`: the beasts or Polar Terrors that stamina and stamina cans pay for, with the
  stamina that Gina's Endurance Training saves. You can plan beast runs by level and Polar Terrors
  first, such as the beasts of Intel missions, and see what the stamina left pays for, with the
  State of Power, Defeat Nearby Beasts, and Tundra Games points.
- `calculateBuffs()`: the speed boosts and other buffs that your hero skills, research, Alliance
  Tech, alliance facilities, alliance prestige buildings, VIP level, buildings, experts and their
  affinity, Chief Gear, Chief Charms, skins, completed Tundra Albums, your collection level, island
  decorations, pets, castle position, active orders, and the March Queue of your account give, added
  up for each stat with the list of every source. The stats are also in groups: Military, Resources,
  Resource Output, Growth, Alliance, and Other. The result also has the totals by source, such as
  all heroes or all research, with no source lists.

### Changed

- The icons of speedups, expert relationship medals, President skills, Fire Crystal levels, and
  other tiles have a transparent area outside the shape, and the faint haze around many images is
  gone. Every image is now PNG or JPG, with no WebP.
- `calculateExperts()` gives the minutes of learning time that the skill EXP needs, at 60 EXP for
  each minute, with `EXPERT_SKILL_EXP_PER_LEARNING_MINUTE` and the EXP of each learning session that
  can be queued in `EXPERT_LEARNING_QUEUE_OPTIONS`.
- The scoring actions of events that name a kind of item are linked to `items()`: the hero shards,
  the Recruitments, the Expert Sigils, and the speedup minutes. An action can have `itemIds` for a
  group.
- `PET_REFINEMENT_STATS` lists the six stats that pet refinement rolls: the Lethality and the Health
  of each troop type.
- `DAYBREAK_ISLAND_TIMBERMILL` gives the Life Essence per hour for each worker and the capacity of
  the Timbermill that replaces the Lumber Camps.
- `items()` has the Gareth Sigil, with an icon.
- `calculateHeroGear()` lists empowerment as unmet when the goal has a mastery forging range that
  ends below Level 10, and exports `HERO_GEAR_EMPOWERMENT_REQUIREMENT`. A requirement in
  `unmetRequirements` has either an `enhancementLevel` or a `masteryForgingRowId`.
- `chiefGear()` levels have a `tierId` that links each level to the set bonus of its tier.
- `experts()` gives each expert on the server timeline its unlock day, like `pets()`.
- `troops()` gives each tier its power and what unlocks it: the camp level for tiers 1 to 10, and
  the War Academy level and research for tiers 11 and 12. `highestTierAtCampLevel()` gives the
  highest tier that a camp level can train. Tiers 10 and 11 list their power at each Fire Crystal
  level, and `troopPower()` gives the power at a level.
- `calculateTroops()` gives the power that the troops add, by tier and troop type, using the Fire
  Crystal level of each camp.
- Pet unlock days follow the server timeline: 54 for the first five pets, then 90, 140, 200, 280,
  and 370.

### Fixed

- Five expert skill progressions had values that lost their decimal point, such as 5 for 0.5. They
  are fixed for Last Line and Spirit of Aeetis of Romulus, Heightened Firepower of Fabian, and
  Fearsome Reputation of Gareth.
- The research nodes Trainer Tools II to VII give Training Speed, like Trainer Tools I, and not
  Training Capacity.
- The March Skins Tundra Adventurer and Wings of the Icy Wind have their full game names.
- The Flame Legion research nodes of the three T11 troop types give Rally Capacity and not Troops
  Deployment Capacity.
- The Alliance Showdown reward rows for the individual ranks say "individual rank" and not "alliance
  rank".
- The Daybreak Island decorations Hero’s Sanctum and Floating Market have their names spelled
  correctly.
- Level 1 of the research nodes Bulwark Formations IV and Picket Lines IV has its research time.
- Level 2 of the research node Molten Plating II has the stat Infantry Health, like its other
  levels.
- The T12 tier 1 Exalted research lines and their capstones have a research time of 0, because they
  upgrade instantly.

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
