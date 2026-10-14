# calculateBuffs

Adds up the speed boosts and other buffs that everything you have gives, and lists the sources of
each. You describe what you have in a profile: hero skill levels, research and Alliance Tech levels,
the VIP level, building levels, experts, Chief Gear, Chief Charms, skins, island decorations, and so
on. The result gives the same numbers in two views: by stat, with every source listed, and by
source, with the total of each stat that the source gives.

## Usage

```ts
import { calculateBuffs } from "whiteout-survival-data";

const result = calculateBuffs({
  heroSkills: [{ heroId: "ling-xue", skills: { "Total Control": 4 } }],
  researchLevels: { "trainer-tools-i": 3 },
  allianceTech: { "advanced-training-i": 2 },
  buildingLevels: { "research-center": "30" },
  vipLevel: 12,
});

// By stat: groups, then categories with the name and the total, then the sources
const military = result.groups.find((g) => g.id === "military");
const training = military.categories.find((c) => c.statKey === "training-speed");
training.name; // 'Training Speed'
training.total; // 25.4
training.sources;
// [
//   { type: 'hero', id: 'ling-xue', label: 'Hero: Ling Xue, Skill: Total Control Lv 4', amount: 16 },
//   { type: 'research', id: 'trainer-tools-i', label: 'Research: Trainer Tools I Lv 3', amount: 7.4 },
//   { type: 'allianceTech', id: 'advanced-training-i', label: 'Alliance Tech: Advanced Training I Lv 2', amount: 2 },
// ]

// By source: the name and the total of each stat, with no source lists
const heroes = result.bySource.find((g) => g.id === "hero");
heroes.name; // 'Heroes'
heroes.stats; // [{ statKey: 'training-speed', name: 'Training Speed', unit: 'percent', total: 16 }]
```

## Input

Every section of the profile is optional. A section that is left out adds nothing. The one exception
is the March Queue of the account: every profile has the starting March Queue of 1, so an empty
profile gives one category, `march-queue`.

| Field                | Type                                     | Meaning                                                                                                                                                                        |
| -------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `heroSkills`         | `{ heroId, skills }[]`                   | The level of each skill of a hero, by skill name. Exploration, Expedition, and Talent skills count.                                                                            |
| `experts`            | `{ expertId, skills }[]`                 | The level of each skill or talent of an expert, by name, such as `{ expertId: 'gareth', skills: { 'Rallying Cry': 3 } }`.                                                      |
| `expertAffinity`     | `Record<expertId, { level, advanced? }>` | The affinity of each expert: a level from 0 to 100 and whether the expert advanced, such as `{ gareth: { level: 100, advanced: true } }`. The base bonus of the expert counts. |
| `researchLevels`     | `Record<nodeId, level>`                  | The level of each research node.                                                                                                                                               |
| `allianceTech`       | `Record<nodeId, level>`                  | The level of each Alliance Tech node.                                                                                                                                          |
| `allianceFacilities` | `Record<facilityId, level[]>`            | The levels of each Alliance Facility that your alliance holds, such as `{ construction: [1, 3] }`.                                                                             |
| `alliancePrestige`   | `Record<buildingId, tierName>`           | The tier of each Alliance Prestige Building that your alliance holds, such as `{ 'championship-statue': 'Gold' }`. One tier for each building.                                 |
| `vipLevel`           | `number`                                 | VIP level, 0 to 12.                                                                                                                                                            |
| `marchQueuePack`     | `boolean`                                | `true` when the March Queue pack was bought. It adds 1 March Queue.                                                                                                            |
| `buildingLevels`     | `Record<buildingId, levelLabel>`         | The level label of a building, such as `"30"` or `"FC 10"`.                                                                                                                    |
| `skins`              | `string[]`                               | Ids of the skins that you own.                                                                                                                                                 |
| `tundraAlbums`       | `string[]`                               | Ids of the Tundra Albums that are complete, such as `['crystalline-mysteries']`. The buff of an album counts when it is complete.                                              |
| `collectionLevel`    | `number`                                 | Your collection level, 0 to 51. The buffs of the medallion that you hold at this level count.                                                                                  |
| `decorations`        | `{ id, level }[]`                        | Island decorations. List a decoration once for each copy that you have placed.                                                                                                 |
| `treeOfLifeLevel`    | `number`                                 | Level of the Tree of Life, 0 to 10. It adds the buffs of all levels up to it.                                                                                                  |
| `castleAppointment`  | `string`                                 | The id of the castle position that you hold.                                                                                                                                   |
| `chiefOrders`        | `string[]`                               | Ids of the Chief Orders that are active now.                                                                                                                                   |
| `presidentSkills`    | `string[]`                               | Ids of the President skills that are active now.                                                                                                                               |
| `pets`               | `{ id, level, refined?, refinement? }[]` | Your pets. `refined` uses the refined value of the level when it has one. `refinement` is the percent of each stat that the pet rolled.                                        |
| `chiefGear`          | `Record<slotId, levelId>`                | The `chiefGear()` level id of the piece worn in each slot: `cap`, `watch`, `coat`, `pants`, `ring`, `weapon`.                                                                  |
| `chiefCharms`        | `Record<slotId, levelId[]>`              | The `chiefCharm()` level ids of the charms of each gear slot, up to 3 for each of `cap`, `watch`, `coat`, `pants`, `ring`, and `weapon`.                                       |

A level of 0 means that you do not have it, and adds nothing.

## Result

The result has three lists of the same numbers.

- `categories` has one entry for each stat and unit that a source gives, in the order of the names.
- `groups` has the same categories in groups. This is the view by stat: a group, then its categories
  with a `name` and a `total`, then the `sources` of each category.
- `bySource` is the view by source: one entry for each kind of source that gives something, with the
  `name` and the `total` of each stat that it gives. It has no source lists.

A category has these fields.

| Field     | Meaning                                                                                             |
| --------- | --------------------------------------------------------------------------------------------------- |
| `statKey` | The key of the stat, such as `training-speed`.                                                      |
| `group`   | The group of the stat, such as `military`.                                                          |
| `name`    | The name of the stat, such as `Training Speed`.                                                     |
| `unit`    | `percent`, `flat`, `hours`, or `seconds`. `hours` and `seconds` are a time that is saved each time. |
| `total`   | The sum of the amounts of all sources.                                                              |
| `sources` | The list of sources. Each has `type`, `id`, `label`, and `amount`.                                  |

Categories are in the order of their names. A stat that has both a percent source and a flat source
has two categories, because the two cannot be added. Sources are listed by type, in the order of the
table below, and then in the order of the profile.

An entry of `bySource` has an `id`, a `name`, and `stats`. A stat has `statKey`, `name`, `unit`, and
`total`, and the stats are in the order of the groups. The totals of a stat over all the entries add
up to the total of its category. The `id` is a source type, with three differences: research is
split in two, and the Tree of Life and the island decorations are one entry.

| `id`                 | `name`                      |
| -------------------- | --------------------------- |
| `account`            | Account                     |
| `hero`               | Heroes                      |
| `expert`             | Experts                     |
| `research`           | Research (Research Center)  |
| `warAcademyResearch` | Research (War Academy)      |
| `allianceTech`       | Alliance Tech               |
| `allianceFacility`   | Alliance Facilities         |
| `alliancePrestige`   | Alliance Prestige Buildings |
| `vip`                | VIP                         |
| `building`           | Buildings                   |
| `castleAppointment`  | Castle position             |
| `island`             | My Island                   |
| `pet`                | Pets                        |
| `skin`               | Skins                       |
| `tundraAlbum`        | Tundra Album                |
| `collection`         | Collection                  |
| `chiefGear`          | Chief Gear                  |
| `chiefGearSet`       | Chief Gear set bonus        |
| `chiefCharm`         | Chief Charms                |
| `chiefOrder`         | Chief Orders                |
| `presidentSkill`     | President skills            |

The research entries are split by the research queue: the nodes of the Research Center queue are in
`research`, and the T11 and T12 nodes are in `warAcademyResearch`. An entry with nothing is left
out.

## Groups

`groups` lists the categories in six groups, in this order. A group with no category is left out.
Each group has an `id`, a `name`, and its `categories`.

| Group             | `id`              | Stats, in the order of the group                                                                                                                                                                                                                                                                      |
| ----------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Military`        | `military`        | March Queue, Deployment Capacity, Rally Capacity, March Speed (troops and wilderness), Training Capacity, Training Speed, Healing Speed, then Attack, Defense, Lethality, and Health for all Troops, Infantry, Lancer, and Marksman, then Infirmary Capacity, Reinforce Capacity, and Troop Formation |
| `Resources`       | `resources`       | The Meat, Wood, Coal, and Iron Gathering Speeds                                                                                                                                                                                                                                                       |
| `Resource Output` | `resource-output` | The Meat, Wood, Coal, and Iron Outputs                                                                                                                                                                                                                                                                |
| `Growth`          | `growth`          | Construction Speed, Research Speed, Hunting March Speed, Resource Consumption Reduction, Construction Speed Boost, Resource Production Speed, and Storehouse Capacity                                                                                                                                 |
| `Alliance`        | `alliance`        | Every stat whose key starts with `alliance-` or `enemy-alliance-`, and Ally Assists, Ally Help Time, and Rally Governor Cap, in the order of the names                                                                                                                                                |
| `Other`           | `other`           | Every stat that is in none of the groups above, in the order of the names                                                                                                                                                                                                                             |

`BUFF_GROUPS` holds the groups and the stats that each lists, and `buffGroupOf(statKey)` returns the
group of a stat. The stats in `Other` have no group yet. Move one into a group by adding its key to
the list of that group.

## Sources

| Type                | What it reads                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `account`           | The starting March Queue, and the March Queue pack when `marchQueuePack` is `true`.                                         |
| `hero`              | The city and economy effects of a hero skill at its level, such as Training Speed.                                          |
| `expert`            | The always-on stat of an expert skill or talent at its level, such as the Healing Speed of Rallying Cry of Gareth.          |
| `research`          | The total bonus of a research node at its level.                                                                            |
| `allianceTech`      | The bonus of an Alliance Tech node at its level.                                                                            |
| `allianceFacility`  | The booster of an Alliance Facility at its level, such as the Research Speed of the Tech facility.                          |
| `alliancePrestige`  | The Resource Gathering Speed of an Alliance Prestige Building at its tier.                                                  |
| `vip`               | Every bonus of the VIP level.                                                                                               |
| `building`          | The stats of a building at its level, such as the speed bonus of a camp or the capacity of the Command Center.              |
| `castleAppointment` | Every bonus of the castle position.                                                                                         |
| `treeOfLife`        | The buff of every Tree of Life level up to its level.                                                                       |
| `decoration`        | The buff of a decoration at its level.                                                                                      |
| `pet`               | The troop attack and defense of a pet at its level, and its refinement.                                                     |
| `skin`              | The bonus of a skin.                                                                                                        |
| `tundraAlbum`       | The buff of a complete Tundra Album: Troops Attack, Troops Defense, Resource Gathering Speed, or Resource Production Speed. |
| `collection`        | The Troops Attack, Defense, Lethality, and Health of the medallion that you hold at your collection level.                  |
| `chiefGear`         | The Attack and Defense of a Chief Gear piece, for the troop type of its slot.                                               |
| `chiefGearSet`      | The 3 piece Defense and 6 piece Attack set bonuses of the gear that is worn.                                                |
| `chiefCharm`        | The Lethality and Health of a Chief Charm, for the troop type of the gear slot that holds it.                               |
| `chiefOrder`        | The bonus of an active Chief Order.                                                                                         |
| `presidentSkill`    | The bonus of an active President skill.                                                                                     |

## How it works

Each source gives the bonus that it has at the level in the profile, and the calculator adds the
amounts of the same stat. The amount of a level is the total at that level and not a step, so a
research node at level 3 gives its total of 3 levels. The total is rounded to 4 decimals, so a sum
has no floating point noise.

Hero skills give only the effects that change a city stat: Training Speed, Research Speed, Healing
Speed, Building Upgrade Speed (the `construction-speed` category), the gathering speeds, the mine,
Sawmill, and Hunter's Hut outputs, the Hunting and Wilderness march speeds, Stamina Cost Reduction,
and Resource Consumption Reduction. A skill that only helps in battle adds nothing. A skill that
only applies while you use the hero adds nothing either. These are the mine, sawmill, and Hunter's
Hut output skills of Smith, Eugene, Charlie, and Cloris, Endurance Training and Quick Paced of Gina,
and Emerald Warrior of Lumak Bokan. `BUFF_HERO_ONLY_SKILLS` lists them. The gathering speed skills
of Smith, Eugene, Charlie, and Cloris count, and so do the skills of Ling Xue, Jasser, Seo-yoon, and
Zinman.

A stat that is general to the four resources has no category of its own. The Resource Gathering
Speed of an Alliance Facility, an Alliance Prestige Building, or a skin counts in each of
`meat-gathering-speed`, `wood-gathering-speed`, `coal-gathering-speed`, and `iron-gathering-speed`.
The source is listed in all four categories, and it adds to the speed of that resource from heroes,
research, and the other sources.

A Tundra Album gives its buff only when all 9 of its puzzles are done, so you list an album in
`tundraAlbums` when it is complete. The buff is the one of the album in `tundraAlbum()`: Crystalline
Mysteries and Explore the World give 2% Troops Attack, Daybreak Island gives 2% Troops Defense, Song
of Heroes gives 5% Resource Gathering Speed, and Rekindled Flames gives 5% Resource Production
Speed. The Resource Gathering Speed counts in each of the four resources, as above. An id that is
not an album throws an `Error`.

The collection gives the buffs of the medallion that you hold at your `collectionLevel`, from level
1 to level 51. The level picks the medallion in `collectionMedallionAt()`, and the buffs of a
medallion are the totals that the game lists for it, so the buffs of the medallions before it do not
add on top. Bronze Medallion I gives 2% Troops Attack, and Light Medallion IV gives 6% Troops
Attack, Defense, and Lethality and 4% Troops Health. A level of 0 adds nothing. A level that is not
a whole number from 0 to 51 throws a `RangeError`.

An expert also gives a base bonus that grows with the affinity level. The bonus is the `statBonus`
of that level in `experts()`, from 3% at level 1 up to 30% at level 100 for Gareth, and it goes to
each stat of the expert: Gareth, Romulus, Valeria, Fabian, and Kathy give Troops Lethality and
Troops Health, Holger, Ronne, and Baldur give Troops Attack and Troops Defense, Cyrille gives Troops
Attack, and Agnes gives Troops Defense. You give the affinity in `expertAffinity`, separate from the
skill levels in `experts`. An expert that is not listed adds nothing.

An expert must advance at the levels 10, 20, up to 100. The `statBonus` of those levels is the bonus
after the advancement, so it jumps from the level before. Until the expert advances, the bonus of
the level before counts: level 60 gives the bonus of level 59, and level 60 with `advanced: true`
gives the bonus of level 60. `advanced` has no effect at the other levels.

An Alliance Prestige Building gives its Resource Gathering Speed for the tier that you give. Each
building has four tiers: the Championship Statue has Silver, Gold, Diamond, and Ultimate, and the
other five have Tier 1 to Tier 4. You give one tier for each building, and the buildings add up. The
tier must be one of the tiers of the building.

An Alliance Facility gives its booster percent to one stat: Construction to `construction-speed`,
Defense to `troops-defense`, Expedition to `troops-march-speed`, Gathering to the general
`resource-gathering-speed` (see below), Production to `resource-production-speed`, Tech to
`research-speed`, Training to `training-speed`, and Weapons to `troops-attack`. You give the levels
that your alliance holds, and the boosters of the levels add up: Construction at levels 1 and 3
gives 5% and 8%, so 13% Construction Speed. Each level must be one that the facility has on the map,
and you can list it once. The heavily injured and losses percentages of a facility level are not
stats and are not in the result.

The account gives `march-queue` as a flat number. The starting March Queue is 1 for every profile,
and the pack adds 1 more when `marchQueuePack` is `true`. Research and VIP add to the same category.
`BUFF_STARTING_MARCH_QUEUE` and `BUFF_MARCH_QUEUE_PACK` hold the two numbers.

The Research Center gives its research speed to `research-speed`. The War Academy gives its research
speed to the same `research-speed`. Each camp gives its training speed to the general
`training-speed`, so the three camps add to the Training Speed of research, heroes, and the other
sources. The Embassy gives `ally-assists`, `ally-help-time` in `seconds`, and `reinforce-capacity`.
The Command Center gives `rally-capacity` and its march capacity as `troops-deployment-capacity`, so
it adds to the same category as research and the other sources. The Infirmary gives
`infirmary-capacity`, the Storehouse gives `storehouse-capacity`, and each camp gives its training
capacity to the general `training-capacity`, next to its training speed. Each of the nine
entertainment buildings, such as the Cafe and the Gym, gives 100 `troops-deployment-capacity` at its
one level. `BUFF_ENTERTAINMENT_BUILDINGS` lists them. A Fire Crystal sub-level, such as `30-1` or
`FC 3-2`, has no stats of its own and keeps the stats of the full level before it. The Command
Center has the same capacity in the data on every sub-level.

Attack, Defense, Lethality, and Health come in two kinds of category. A troop type has its own
(`infantry-lethality`, `lancer-health`, `marksman-attack`, and so on), which research and Alliance
Tech give. All troops have a general one (`troops-lethality`, `troops-health`, and so on), which the
VIP level, a castle position, skins, and some decorations give. The calculator keeps them as
separate categories and does not add the general one to each troop type, so add them in an app to
get the Lethality of Infantry.

Every level of the Tree of Life gives its own buff, and the buffs of the lower levels stay. At level
7 the tree gives Healing Speed from levels 1, 3, 5, and 7, which is 120%, and also the Deployment
Capacity of level 2, the Defense of level 4, and the Attack of level 6. Each level is its own
source.

A decoration or Tree of Life buff that names several stats gives each stat the full amount. For
example the 2% of Serpent Sanctuary at level 1 is 2% of Troops Attack, Defense, Health, and
Lethality. A level whose buff is not known yet adds nothing, and neither does a decoration that has
no levels.

Experts give only the skills and talents whose text states a stat that always applies. These are
Porcupine, Undefeated Will, Fearsome Reputation, and the talent Rallying Cry of Gareth, and Last
Line, One Heart, Spirit of Aeetis, and the talent Commander's Crest of Romulus, and Project
Management of Agnes. Rallying Cry gives Healing Speed and Infirmary Capacity, so Gareth at talent
level 3 adds 10% Healing Speed and 80,000 Infirmary Capacity. Last Line gives Troops Attack and
Defense, and Spirit of Aeetis gives Troops Lethality and Health, each at the same amount.
Commander's Crest gives 300 to 10,000 Troops Deployment Capacity. One Heart gives 5,000 to 100,000
Rally Capacity. Project Management gives Research Speed from 1% to 5%, and the hours that it saves
on every new build, from 2 to 8, as the stat Construction Speed Boost in `hours`.
`BUFF_EXPERT_SKILLS` lists the skills that count. A skill that only applies in an event, such as the
Bear Hunt or State of Power skills, adds nothing.

A Chief Gear piece gives Attack and Defense to the troop type of its slot, each at the stat percent
of its level: Cap and Watch to Lancer, Coat and Pants to Infantry, and Ring and Weapon to Marksman.
The set bonuses come from `chiefGearSetBonus()`, with the pieces that you list. Three pieces of one
tier add the Defense bonus of the tier, and six pieces of one tier also add the Attack bonus, each
for Infantry, Lancer, and Marksman. Each gear slot holds 3 Chief Charms. A charm gives Lethality and
Health to the troop type of the gear slot that holds it, each at the stat percent of its level, so
the two Marksman slots, Ring and Weapon, hold 6 charms for Marksman troops. List the level id of
each charm that you have, up to 3 for each slot. The package owner states these stats for gear and
charms.

A pet can have a refinement for each of six stats: Lethality and Health of Infantry, Lancer, and
Marksman. Pass `refinement` as an object with the key of each stat, such as `infantry-lethality` or
`marksman-health`. A value is a percent from 0 to the maximum refinement of the pet, which is
`maxRefinementPercent` in `pets()`: 6.7 for Cave Hyena, up to 58.1 for Frostscale Chameleon. A stat
that is left out counts as 0, and the refinement of a pet at level 0 adds nothing. The refinement
adds to the same stat of the other sources, so a refined Infantry Lethality adds to the one of
research.

Chief Orders and President skills last for a limited time. The calculator adds one only when you
list it, so list the ones that are active when you want the buffs of now.

`BUFF_VIP_MAX_LEVEL`, `BUFF_TREE_OF_LIFE_MAX_LEVEL`, and `BUFF_CHARMS_PER_GEAR_SLOT` are exported
and hold 12, 10, and 3.

## Errors

An `Error` is thrown when an id, a skill name, or a building level label is not in the data. A
`RangeError` is thrown when a level is not a whole number from 0 to the top level of its source,
when a gear slot has more than 3 charms, or when a refinement is not a number from 0 to the maximum
of the pet.

## Data and assumptions

The affinity bonuses of experts and the skills that only apply in an event are not in the result.
The troop attack and defense of a pet is a percent. The buffs of two sources of one stat add up, and
the calculator does not model a cap or a rule that only the highest source counts.
