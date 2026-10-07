# Hero Gear Stats

The per level stats of one piece of Hero Gear for each slot and troop type. Use it to read the stats
of a piece at an enhancement or empowerment level, and the empowerment milestone bonuses.

## Usage

```ts
import { heroGearStats } from "whiteout-survival-data";

const goggles = heroGearStats().bySlot("goggles").byTroopType("lancer").first()!;
console.log(goggles.combatStat, goggles.percentStat); // Attack Lethality
console.log(goggles.levels[99]); // { level: 100, combatStat: 450, health: 2250, percentStat: 50 }

console.log(goggles.milestones[0]);
// { empowermentLevel: 20, event: 'Expedition', stat: 'Lancer Attack +20%' }

console.log(heroGearStats().byTroopType("infantry").count()); // 4
```

## Query methods

| Method                   | Returns              | Description                                     |
| ------------------------ | -------------------- | ----------------------------------------------- |
| `bySlot(slot)`           | `HeroGearStatsQuery` | Stats of one slot: goggles, gloves, belt, boots |
| `byTroopType(troopType)` | `HeroGearStatsQuery` | Stats for one troop type                        |

The shared terminal methods (`get`, `first`, `find`, `findByName`, `search`, `count`) are described
in [How It Works](../../../README.md#how-it-works).

## Data

The data is in `data/chief/hero-gear-stats.json`. It has 12 entries, one for each of the 4 slots and
3 troop types, with ids such as `goggles-infantry`. Each entry has these fields.

| Field         | Meaning                                                                  |
| ------------- | ------------------------------------------------------------------------ |
| `combatStat`  | `Attack` for Goggles and Boots, `Defense` for Gloves and Belt            |
| `percentStat` | `Lethality` for Goggles and Boots, `Health` for Gloves and Belt          |
| `milestones`  | 5 bonuses unlocked at empowerment levels 20, 40, 60, 80, and 100         |
| `levels`      | 200 rows of `level`, flat `combatStat`, flat `health`, and `percentStat` |

Levels 1 to 100 are enhancement levels. Levels 101 to 200 are empowerment levels 1 to 100. Level 1
gives 26 Attack, 256 HP, and 3.8 percent for the Infantry goggles. Level 200 gives 690, 6,750,
and 100.

## Notes

The wiki does not list these stats. The values come from WoS Tools. They are for one piece, and they
are the stats before mastery forging. A forged piece multiplies them by 1 plus the `statsUpPercent`
of its [mastery forging](../hero-gear-mastery-forging/README.md) row and rounds down. Level 0 has no
stats.

The WoS Tools table stops at 192 of the 200 levels, so the wiki tables of
[`heroGearEnhancement()`](../hero-gear-enhancement/README.md) and
[`heroGearEmpowerment()`](../hero-gear-empowerment/README.md) hold more levels than WoS Tools. Their
XP total is 574,370 and the total on WoS Tools is 531,320. The Mithril (150) and Mythic chest (35)
totals agree. The `power` values of both tables are exactly 4 times the per piece power on WoS Tools
at every level.
