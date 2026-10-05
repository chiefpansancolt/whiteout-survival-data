# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `calculateSvs()`: a State of Power score calculator. It reads the scoring lists of the
  `svs-state-of-power` event and returns the points for each day, each phase, and the whole event,
  with Valeria's Well Prepared bonus when `valeriaLevel` is set. The sample page
  `sample/calculator-svs.html` is a plug-and-play version, linked from a new Calculators section on
  the sample index.
- `experts()`: Valeria's Well Prepared skill now has a `progressions` entry with its Preparation
  Phase point gain, 2% for each level up to 20%.
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
  distribution used for Rare and Epic. Jeronimo's `levels[].power` uses its own start value (6,250,
  not Gen 1's shared 5,000), reaching 233,250 at Level 80 instead of 186,600; his
  `shardCosts[].power` (8,120/40,599/133,975/377,567/864,750) uses the same standard cumulative
  distribution over 1,065 shards as every other hero. Confirmed Natalia's `shardCosts[].power`
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
- `chiefGearSlots()`: added `images`, one icon per rarity per slot (30 total), plus
  `chiefGearRarity()` and `chiefGearImage()` helpers to resolve a `ChiefGearLevel`'s `T`-suffixed
  sub-tier down to the right icon.
- `chiefCharmSlots()`: the 3 troop-type charms (Infantry, Lancer, Marksman), each carrying an
  18-entry `images` array (one icon per charm level, 54 total) plus a `chiefCharmImage()` helper to
  resolve a slot straight to the icon for a given level.
- `chiefGearConverter()` and `chiefCharmConverter()`: the first two entries under a new `converters`
  data folder, modeling fixed item-exchange rates (`ItemConversion`: `fromItemId`/`fromQuantity` →
  `toItemId`/`toQuantity`), each with `byFromItem()`/`byToItem()` filters. Chief Gear has 7 exchange
  rates with a `weeklyLimit` on each; Chief Charm has 4 with no limit. The source table's "Jewel
  Secrets" is the same item as the existing `charm-secrets` catalog entry, just a different name on
  that particular screen.
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
  at all. Each level lists its `available` count, an `ownLimit` of 1, and the map `locations`.
- `allianceFortress()`: the castle, 4 strongholds, and 12 fortresses with map coordinates and the
  reward each gives in each of the 8 phases, sourced from user-provided images.
- `events()`: game events, one data file each under `data/events/`, with frequency, duration,
  requirements, phases, rewards, and tips. The ten batches cover 65 alliance, solo, rookie, and
  holiday events.
- `items()`: a `Speedups` category with 21 speedup items (General, Construction, Troop Training,
  Research, Learning, and Troop Healing) and their icons under `images/items/speedups/`.
- `skins()`: the Frostflame Knight City Skin from the Icefire Warhymn League season ranking, with
  its tile as the image.
- `skins()`: the 7-day City Skin from the State of Power battle personal ranking, with its tile as
  the image.
- `heroes()`: an optional `shardImg` on the 13 heroes whose shard icon has been captured.
- `items()`: the Gear Boost Custom Chest, given in Journey of Light, with its icon cropped from an
  in-game screenshot, and the Gina Shard.
- `items()`: the Hall of Heroes hero shards for generations 1 to 9 (11 shards) and the Hero Shard
  and Hero Widget Chests for seasons 1 to 4, with icons cropped from the wiki and in-game
  screenshots. Some hero names are not confirmed.
- `items()`: the Battle Commendation Custom Chest - Gen Hero, given in the SVS battle personal
  ranking.
- `items()`: the Frostdragon Tyrant trophies Triumph of Tyrant, Glory of Kings, and Trail of Heroes,
  with icons cropped from the wiki's reward image.
- `decoration()`: an optional `img` on decorations, set for Dragon Pagoda, Serpent Sanctuary, War
  Chariot, Cannon, Tundra Truck, Giant Horn, Conquering Sword, Icefire Way, Luminari Citadel, and
  Hero's Sanctum, with icons under `images/daybreak-island/`. Event rewards can link a decoration
  with `decorationId`.
- `eventBuff()`: which of 11 buff sources (Pet Skills, President Skills, Facility Buff, etc.) apply
  in each of 14 game modes, sourced from a user-provided screenshot rather than any wiki page.
  `petSkillsAutoApplied` marks the modes where pet skills apply without player activation.
- `vip()`: the full VIP 1-12 progression (XP cost and unlocked bonuses per level), sourced from the
  wiki's official infographic image, since that page has no HTML table either.
- `lumberCamp()`, `treeOfLife()`, and `decoration()`: the full Daybreak Island feature — Lumber Camp
  and Tree of Life upgrade tables, and all 103 named decorations across 8 categories, including the
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
- Fixed Jeronimo's Star 1 shard `total` (was `30`, but his `tierCosts` sum to `10` like every other
  hero), and recomputed his `shardCosts[].power` over the standard 1,065-shard total instead of the
  1,085 the incorrect total had implied.
- Fixed `VipLevel.xpRequired` being treated as a cumulative running total; it's actually the XP
  needed for that level alone, so `vip().atXp(n)` now sums every level's `xpRequired` in order
  instead of comparing `n` against a single level's own value (e.g. reaching VIP 12 needs the sum of
  all 12 levels, 4,800,000 total XP, not VIP 12's own 2,400,000).
- Fixed leaked tooltip JS/CSS appended to 5 `ExpertSkill`/`ExpertTalent` descriptions (Romulus's
  Last Line, Spirit of Aeetis, and One Heart; Fabian's Heightened Firepower and Battle Bulwark) -- a
  scraping artifact from the source page's hover-preview script, trimmed down to the real
  description sentence.
- Fixed all 14 `pets()` portraits, which had been sourced from each pet's larger in-page splash art
  (or, for Frost Gorilla/Frostscale Chameleon, left as `""` with no image at all) instead of the
  wiki's own top-left profile portrait (`post_image`) -- re-downloaded all 14 as PNGs from the
  correct source, and reorganized `images/pets/` into one folder per pet (`images/pets/<Pet>/`),
  portrait alongside a `skills/` subfolder, matching the `images/heroes/` convention -- each skill
  image is now named `<Pet>-<SkillName>.<ext>`.
- Fixed `PetLevel.advancementMaterials[].itemId` using the source page's raw numeric icon IDs
  (`600043`/`600044`/`600045`) instead of the matching `items()` catalog entries
  (`taming-manual`/`energizing-potion`/`strengthening-serum`) across all 267 references.
- Reorganized `images/experts/` into one folder per expert (`images/experts/<Expert>/`), portrait
  alongside a `skills/` subfolder covering all 4 skills plus the talent, matching the
  `images/heroes/`/`images/pets/` convention -- each is now named `<Expert>-<SkillName>.<ext>`
  instead of the source's opaque numeric filenames.
- Fixed Furnace's 50 Fire Crystal level `power` values, which had been rounded to the nearest
  100,000 (sourced from wostools rather than the wiki's own dedicated Fire Crystal Furnace page,
  which spells out the exact figures). Cross-checked every other Fire Crystal building (Embassy,
  Command Center, Infantry/Marksman/Lancer Camp, Infirmary, War Academy, and the four
  single-FC-level resource buildings) against the wiki and found no other discrepancies.

Initial repository scaffold: build tooling, lint/format config, test harness, and the shared
`QueryBase<T>` query builder.
