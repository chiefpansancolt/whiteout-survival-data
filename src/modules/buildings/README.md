# Buildings

All 27 city buildings with their full level-by-level upgrade progression. Use it to read the cost,
build time, power, prerequisites, and building-specific bonuses of any level.

## Usage

```ts
import { buildings } from "whiteout-survival-data";

const furnace = buildings().find("furnace");
console.log(furnace?.maxLevelLabel); // "FC 10"
console.log(furnace?.levels.length); // 80

const military = buildings().byCategory("Military").get();
console.log(military.length); // 11

const camp = buildings().findByName("Infantry Camp");
console.log(camp?.levels.find((level) => level.label === "FC 1")?.trainingCapacity); // 234

const embassy = buildings().find("embassy");
console.log(embassy?.levels[0].allyAssists);
```

## Query methods

| Method                 | Returns         | Description                                            |
| ---------------------- | --------------- | ------------------------------------------------------ |
| `byCategory(category)` | `BuildingQuery` | Buildings in `Military`, `Inner City`, `Entertainment` |

The shared terminal methods (`get`, `first`, `find`, `findByName`, `search`, `count`) are described
in [How It Works](../../../README.md#how-it-works).

## Data

The data is in `data/chief/buildings.json`. Each `Building` has an `id`, `name`, `category`,
`maxLevelLabel`, and a `levels` array. `img`, `fireCrystalImg`, and `description` are optional.
`category` splits the 27 buildings as follows.

| Category      | Count | Buildings                                                                                                     |
| ------------- | ----- | ------------------------------------------------------------------------------------------------------------- |
| Military      | 11    | Furnace, Embassy, Research Center, Command Center, three Camps, War Academy, Infirmary, Storehouse, Barricade |
| Inner City    | 7     | Hunter's Hut, Sawmill, Coal Mine, Iron Mine, Clinic, Cookhouse, Shelter                                       |
| Entertainment | 9     | The Bakery, The Vinyl Shop, Tea Milk Shop, Cinema, Cafe, Gym, Farm, Yoga Studio, Climbing Gym                 |

Each `BuildingLevel` has `id`, `label`, `order`, `tier` (`standard` or `fireCrystal`), `cost`,
`buildTimeSeconds`, `power`, `developmentIndex`, and optional `prerequisites`. Fire Crystal levels
also have `fcStage` and `fcSubLevel`. Building-specific fields are present only where the building
has that stat: `rallyCapacity`, `marchCapacity`, `trainingCapacity`, `trainingSpeedBonusPercent`,
`researchSpeedBonusPercent`, `infirmaryCapacity`, `allyAssists`, `allyHelpTimeSeconds`,
`reinforceCapacity`, `storehouseCapacity`, `barricadeDurability`, and `troopDeploymentCapacity`.

## Notes

### Level shape

Most buildings have 80 levels. These are standard levels 1 to 30, then 50 Fire Crystal entries:
`30-1` to `30-4`, then `FC 1` to `FC 9` (each a base row plus four sub-levels `FC N-1` to `FC N-4`),
and `FC 10` alone as the max level. Fire Crystal levels add Fire Crystals to the cost from `FC 1`
and Refined Fire Crystals from `FC 5-1`. Furnace, Embassy, Command Center, the three Camps, and
Infirmary have this shape.

Research Center and Storehouse stop at standard level 30 with no Fire Crystal tier. Barricade stops
at level 10. For these, `fireCrystalImg` is omitted and `maxLevelLabel` is the last numeric level.

### Derived Fire Crystal prerequisites

The source wikis list no prerequisites for Fire Crystal levels. Each level still needs the previous
level of the same building, so the package derives `prerequisites` for that range. The entry names
the building itself.

- A tier base row (`FC N`) requires the last sub-level of the previous tier (`FC (N-1)-4`).
- The first sub-level (`FC N-1`) requires the base row of the same tier (`FC N`).
- Each later sub-level (`FC N-2` to `FC N-4`) requires the one before it.
- The pre-Fire-Crystal stage (`30-1` to `30-4`) chains from standard level 30.
- `FC 1-1` is the exception. It requires standard level 30 directly, because there is no tier 0
  base.

### Development index

Every level has a `developmentIndex`. It is the score the level adds toward the SvS Wish Station
event. The values come from the package maintainer's in-game data for every level of every building.
Neither wiki documents this metric.

### Per-building details

Furnace is the town HQ and caps the max level of every other building.

Embassy stores Alliance reinforcements and gates Alliance assistance. Every standard level requires
the Furnace at the matching level (levels 1 to 8 all require Furnace Lv.8). It has `allyAssists`,
`allyHelpTimeSeconds`, and `reinforceCapacity` at every level, from the maintainer's in-game data.

Research Center unlocks Growth, Economy, and Battle research. Levels 1 to 9 all require Furnace
Lv.9, then it tracks the Furnace level from level 10. It has `researchSpeedBonusPercent` at every
level.

Command Center raises Rally and March troop capacity (`rallyCapacity` and `marchCapacity`) as well
as power. Every standard level requires both the Furnace (Lv.10 minimum, then matching from
level 11) and the Embassy at the matching level. Its Fire Crystal levels also have a cross-building
gate taken from the wiki. Every level in a group of five (a tier's four sub-levels plus the next
tier's base row) requires Furnace and Embassy at a matching Fire Crystal tier. This is in addition
to the derived same-building chain.

Infantry Camp, Marksman Camp, and Lancer Camp train their troop type. They have identical cost,
power, and Fire Crystal progression and differ only in the Furnace prerequisite floor (Lv.7, Lv.8,
and Lv.9, then matching from one level above the floor) and the troop type. Each level has
`trainingCapacity` and `trainingSpeedBonusPercent`. The speed bonus is set on every standard level
but only on Fire Crystal tier base rows (`FC 1` to `FC 10`), because the wiki shows no value on
sub-levels or the pre-Fire-Crystal stage. Fire Crystal levels have a Furnace-only cross-building
gate (no Embassy), plus the derived same-building chain. `trainingCapacity` for levels 1 to 30 comes
from the wiki. The 50 levels from `30-1` to `FC 10` come from WoS Tools: 234 at `FC 1` up to 459 at
`FC 10`, with 5 more for each sub-level. Levels `30-1` to `30-4` follow the same 5-step rule from
209 at level 30.

War Academy researches Marksman, Infantry, and Lancer technologies and unlocks T11 units. It has no
standard tier and no pre-Fire-Crystal stage, so it has 46 levels instead of 80. It unlocks at `FC 1`
(zero cost) once the Furnace reaches Fire Crystal level 1, and then tracks the Furnace Fire Crystal
tier. `fireCrystalImg` is omitted, as for Research Center, because there is no separate base and
Fire Crystal visual. `FC 1` has no same-building prerequisite, and `FC 1-1` requires `FC 1`
directly. Every level has `researchSpeedBonusPercent`.

Infirmary heals injured troops. If it is full, troops die in battle instead. It has the standard
80-level shape, a Furnace-only gate, and a Lv.8 floor. `infirmaryCapacity` is set like the camps'
speed bonus: on every standard level, then only on Fire Crystal tier base rows.

Storehouse protects resources from plunder up to its capacity. It has a Furnace Lv.9 floor, and its
cost, power, and time curve is identical to Embassy's. `storehouseCapacity` is set at every level.

Barricade strengthens city defense durability. Level 1 has no prerequisite, which is unique among
the tracked buildings. Later levels skip Furnace levels between gates (level 2 needs only Furnace
Lv.7, level 3 needs Lv.10). `barricadeDurability` is set at every level.

Hunter's Hut, Sawmill, Coal Mine, and Iron Mine are the four basic resource buildings (Meat, Wood,
Coal, and Iron). They share one cost, power, and time curve through level 30. Each then has one
bonus level, `FC 1`, which is identical across the four buildings (6,000,000 Wood and Meat,
1,200,000 Coal, 300,000 Iron, 2 seconds, 31,618 power). It requires Furnace `FC 2` (not `FC 1`) and
the building's own level 30. Despite the label, it has no Fire Crystals in the cost. `maxLevelLabel`
is `"FC 1"` for these four. They differ only in the standard Furnace floor. Sawmill and Hunter's Hut
track the Furnace level exactly from level 1. Coal Mine levels 1 to 3 all require Furnace Lv.3, and
Iron Mine levels 1 to 5 all require Furnace Lv.5.

Clinic, Cookhouse, and Shelter are not on `wostools.net`. Only `whiteoutsurvival.wiki` covers them,
and the data was checked against its raw HTML because an AI summary of the page can drop a sole
bonus level. Each has levels 1 to 10 and one bonus `FC 1` level. Unlike the four resource buildings,
this level requires Furnace `FC 1` (no tier skip) and the building's own level 10. Cookhouse and
Shelter track the Furnace level exactly from level 1. Clinic levels 1 to 4 all require Furnace Lv.4.
Clinic and Cookhouse share one cost, power, and time curve. Shelter has its own, generally cheaper
curve. Shelter is one entry, matching the wiki page, even though a player can build up to eight. The
Furnace's `prerequisites` text refers to numbered instances (`"Shelter 1"`, `"Shelter 3"`) as plain
strings that are not linked to this entry.

### Entertainment buildings

The nine entertainment buildings have no upgrade path. Each has a single `levels` entry
(`maxLevelLabel: "1"`). A Furnace Fire Crystal level gates each one (FC 3, FC 4, or FC 5, depending
on the building) instead of a standard-level floor. The data comes from the package maintainer's
in-game data, not from either wiki. None has a published portrait, so `img` is omitted for these
nine instead of using a placeholder. This is why `Building.img` is optional.

Their `cost` entries are furniture pieces, not raw materials. Each has a `pricePerItem`, which other
buildings' costs do not have, because the pieces are bought one by one. Every level also has
`troopDeploymentCapacity`, as well as the `power` and `developmentIndex` that every building has.
