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
  Lighthouse, Arena, Chief's House, Explorer's Cabin, Suggestion Box, and Enlistment Office.
- `heroes()`: all 13 Generation 0 heroes, with their skills, stats, and exclusive weapons. Every
  skill now carries its own 5-level `levels` table (`manualsRequired`, `powerGain`, `starRequired`).
  `manualsRequired` is confirmed and shared across every skill (0/10/30/50/75 for Levels 1-5);
  `starRequired` is confirmed per skill slot (a hero's 1st/2nd/3rd Exploration skill and 1st/2nd
  Expedition skill each follow their own star curve); `powerGain` is confirmed for Rare and Epic
  skills (Rare: 540/2,030/3,780/6,426/10,152; Epic: 720/2,707/5,040/8,568/13,536 for Levels 1-5,
  identical across every skill) and remains a `0` placeholder for Legendary. Every hero's
  `shardCosts` star tier carries a `power` field (the total Power accumulated once that star is
  reached): `0` for Legendary pending real values, but confirmed for Rare and Epic by distributing
  their known max-star Power (449,670 Rare, 553,440 Epic) cumulatively across tiers by shard count.
  Replaced the flat `levelPower` field with `Hero.levels`, the 80-level Furnace/XP/Power progression
  (`furnaceLevelRequired`/`xpRequired` identical across every hero). `power` is now confirmed for
  every level of Rare and Epic, per `HeroLevelPowerCurve.md`'s shared 80-entry curve (gain(L) =
  start * base\[L\] / 250, running total) -- only the Level-1 start value differs by rarity (Rare
  3,250, Epic 4,000) -- verified against the spec's checkpoint table (Rare/Epic Level 80: 121,290 /
  149,280). Legendary's `power` remains a `0` placeholder pending its own start value.
- `heroes()`: added all 52 Legendary heroes across Generations 1-17 (Gen 1 has 4 -- Jeronimo and
  Natalia are both Infantry -- every other generation has 1 Infantry/Lancer/Marksman), scraped from
  the same wiki as Generation 0. Legendary heroes carry 3 Exploration + 3 Expedition skills (vs.
  Rare/Epic's 2 + 2), and every one has a populated `exclusiveWeapon` (the wiki's "Special" item).
  Only Jeronimo and Natalia have a Talent skill -- the tab is empty on every other Legendary hero's
  page, so `skills.talent` is `undefined` for the rest rather than a fabricated empty entry.
  `exclusiveWeapon.skills` now uses a new `ExclusiveWeaponSkill` type
  (`{ name, img, description, unlockLevel? }`) instead of `HeroSkill`, since these skills have one
  fixed effect rather than scaling across 5 levels. Added a `shardSources` field to `Hero` (e.g.
  `["VIP Packs"]`), backfilled for the existing 13 Generation 0 heroes too. `Hero.levels[].power` is
  now confirmed through Legendary Generation 5 via the shared curve in `HeroLevelPowerCurve.md`
  (Generations 3-5's start values are themselves projected in that spec); Generations 6-17 have no
  known start value yet and stay `0` placeholders. Also downloaded portrait, skill, and Special-item
  images for all 52 heroes into `images/heroes/`. Confirmed Legendary skill `powerGain`
  (900/3,380/6,300/10,710/16,920 for Levels 1-5) for the 6 leveled Exploration/Expedition skills.
  Jeronimo's and Natalia's Talent skill needs no Manuals (`manualsRequired` is `0` at every level)
  and has no confirmed Power yet (`powerGain` stays `0`); its `starRequired` is a real gate but not
  yet sourced either. Reorganized `images/heroes/` into one folder per hero
  (`images/heroes/<Hero>/`), with the portrait alongside `skills/` and `weapons/` subfolders --
  every skill and Special-item image is now named `<Hero>-<SkillName>.<ext>` instead of the source's
  opaque numeric filenames, for all 65 heroes. Confirmed Molly's and Zinman's `shardCosts[].power`
  (6,496/32,479/107,180/302,054/691,800 for Stars 1-5), the same cumulative shard-weighted
  distribution used for Rare and Epic. Jeronimo is a confirmed individual exception on two fronts:
  his `levels[].power` uses its own start value (6,250, not Gen 1's shared 5,000), reaching 233,250
  at Level 80 instead of 186,600; and his `shardCosts[].power`
  (23,910/55,790/147,446/386,547/864,750) is weighted over his own 1,085 total shards (his confirmed
  Star 1 exception adds 20 more than the standard 1,065). Confirmed Natalia's `shardCosts[].power`
  (7,145/35,727/117,898/332,259/760,980), the standard cumulative distribution over 1,065 shards.
  Confirmed the same for every Generation 2-4 hero: Generation 2's max-star Power is 830,160
  (7,795/38,975/128,616/362,464/830,160), Generation 3's is 1,037,700
  (9,744/48,718/160,770/453,080/1,037,700), and Generation 4's is 1,279,830
  (12,017/60,086/198,284/558,799/1,279,830).
- `buildings()`: every `BuildingLevel` now carries a `developmentIndex`, the score each level
  contributes toward the SvS Wish Station event, sourced from the package maintainer's own in-game
  data rather than either wiki (neither documents this metric). Also added
  `allyAssists`/`allyHelpTimeSeconds`/`reinforceCapacity` to Embassy, `researchSpeedBonusPercent` to
  Research Center, `storehouseCapacity` to Storehouse, and `barricadeDurability` to Barricade, from
  the same source.
- `buildings()`: added 9 entertainment buildings with no upgrade path (The Bakery, The Vinyl Shop,
  Tea Milk Shop, Cinema, Cafe, Gym, Farm, Yoga Studio, Climbing Gym), each a single `levels` entry
  gated behind a Furnace Fire Crystal level, sourced from the package maintainer's own in-game data.
  `Building.img` is now optional, since none of these nine have a published portrait yet. `Resource`
  gained an optional `pricePerItem`, and `BuildingLevel` gained an optional
  `troopDeploymentCapacity`, both used by these nine buildings.
- `buildings()`: added `category` (`Military`/`Inner City`/`Entertainment`) to every `Building`,
  plus a `byCategory()` filter on `BuildingQuery`.
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
- Fixed Jessie's Star 1 shard `total` (was `50`, but her `tierCosts` sum to `10` like every other
  hero).
- Fixed Furnace's 50 Fire Crystal level `power` values, which had been rounded to the nearest
  100,000 (sourced from wostools rather than the wiki's own dedicated Fire Crystal Furnace page,
  which spells out the exact figures). Cross-checked every other Fire Crystal building (Embassy,
  Command Center, Infantry/Marksman/Lancer Camp, Infirmary, War Academy, and the four
  single-FC-level resource buildings) against the wiki and found no other discrepancies.

Initial repository scaffold: build tooling, lint/format config, test harness, and the shared
`QueryBase<T>` query builder.
