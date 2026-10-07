# Daybreak Island

The Daybreak Island upgrade tables and decorations. Use it to look up the Lumber Camp and Tree of
Life levels, and the cost, Prosperity, and buff of each decoration.

## Usage

```ts
import { decoration, lumberCamp, treeOfLife } from "whiteout-survival-data";

// Tree of Life level 8 and its buff
const level8 = treeOfLife().find("tree-of-life-level-8");
console.log(level8?.buff.stat, level8?.buff.value); // 'Troops Deployment Capacity' '+3K'

// Lumber Camp levels that need Tree of Life level 5 or higher
const camp = lumberCamp()
  .get()
  .filter((l) => l.treeOfLifeLevelRequired >= 5);

// Mythic decorations that are not limited, and one decoration with its levels
const mythic = decoration()
  .byCategory("Mythic")
  .get()
  .filter((d) => !d.limited);
const lighthouse = decoration().find("starry-lighthouse");
console.log(mythic.length, lighthouse?.levels?.length);
```

## Query methods

| Method                 | Returns          | Description                             |
| ---------------------- | ---------------- | --------------------------------------- |
| `byCategory(category)` | decoration query | Decorations of one `DecorationCategory` |

Only `decoration()` has a filter. `lumberCamp()` and `treeOfLife()` have the terminal methods only.
The categories are `Basic`, `Vegetation`, `Common`, `Uncommon`, `Rare`, `Epic`, `Mythic`, and
`Unique`. The terminal methods `get`, `first`, `find`, `findByName`, `search`, and `count` are
described in [How It Works](../../../README.md#how-it-works).

## Data

The data is in `data/daybreak-island/`. The three factories are exported from this one module.

| Factory        | Entries | File                | Description                                               |
| -------------- | ------- | ------------------- | --------------------------------------------------------- |
| `lumberCamp()` | 10      | `lumber-camp.json`  | Lumber Camp levels: workers, rate, and requirements       |
| `treeOfLife()` | 10      | `tree-of-life.json` | Tree of Life levels: requirements, essence rate, and buff |
| `decoration()` | 103     | `decoration.json`   | Every decoration, in 8 categories                         |

A Tree of Life `buff` has `stat` and `value` for display, for example `"Troops Deployment Capacity"`
and `"+1K"`. It also has a parsed `amount` and `unit`, for example `1000` and `'flat'`, so that a
caller can add up buffs. The buff of a decoration level has the same shape.

A `Decoration` has `category`, and then only the fields that fit its category.

| Category   | Count | Fields                                                          |
| ---------- | ----- | --------------------------------------------------------------- |
| Basic      | 9     | `cost` (Gems, Wood, or Meat as an `items()` id) and `limit`     |
| Vegetation | 5     | Same as Basic                                                   |
| Common     | 10    | `prosperityAtMaxLevel`, `limit`, `lifeEssenceCost` (1,000)      |
| Uncommon   | 6     | `prosperityAtMaxLevel`, `limit`, `lifeEssenceCost` (2,000)      |
| Rare       | 12    | `levels`, `limit`, `lifeEssenceCost` (3,000)                    |
| Epic       | 11    | `levels`, `limit`, `lifeEssenceCost` (5,000), 4 are `limited`   |
| Mythic     | 48    | `levels`, `limit`, `lifeEssenceCost` (10,000), 42 are `limited` |
| Unique     | 2     | `levels` and `limit`. No standard rarity progression            |

`levels` is a list of `{ level, cost, prosperity, buff }`. `cost` is the number needed to reach that
level. For Starry Lighthouse it counts contracts, as the Notes explain.

## Notes

The data comes from `https://onechilledgamer.com/whiteout-survival-daybreak-island-guide/`. This is
a third-party fan site, not `whiteoutsurvival.wiki`, but it has real `<table>` markup. The 12 tables
were parsed from the raw HTML. Daybreak Island unlocks at Furnace Level 19. The player builds the
Dock, and the island is discovered after about 3 days in real time.

Two identical Lumber Camps clear the starting forest of the island. Each cleared tree can drop Life
Essence, Hero Shards, or gear. After the forest is clear, a Timbermill takes over Life Essence
production. It has no levels and no table. The source gives two flat facts, 40 Life Essence per hour
per worker and a capacity of 2,000. These are not stored as data.

The Tree of Life `buff` alternates between "Healing Speed +30%" on odd levels and a growing combat
or capacity stat on even levels. The pattern breaks at levels 9 and 10, so each `buff` is read from
the source per level and is not computed.

The `lifeEssenceCost` of a Common or Uncommon decoration is stated once for the whole rarity in the
prose of the source. It is not a table column. The same is true for Rare, Epic, and Mythic, at
3,000, 5,000, and 10,000. Snow Castle (Mythic) is a confirmed exception at 12,000.

The original source showed the buff and Prosperity at maximum level only. The user collected the
full per-level data for Rare, Epic, and Mythic separately and imported it. The `limit` came from the
same pass and is 1 for every item checked so far.

Limited is not a rarity. It is the `limited` flag on a decoration that is otherwise a normal Epic
(maximum level 5) or Mythic (maximum level 10). It marks decorations that come from a shop rotation,
an event pack, or a ranking reward and not from the Life Essence upgrade path. The flag is omitted,
not `false`, on all other decorations. Limited decorations have no `lifeEssenceCost`. Some of them
have confirmed `cost` and `prosperity` for each level but no buff data yet. Those levels carry a
blank buff (`stat: ''`, `value: '+0'`, `amount: 0`, `unit: 'flat'`) and are not left out.

The two Unique decorations do not follow a standard rarity progression, so `limited` does not apply
to them. Starry Lighthouse is a single decoration that unlocks at Tree of Life level 10 with a
50,000 Life Essence blueprint, and it upgrades to level 10. Its `cost` is General Accessory
Construction Contracts (0 to 180) and not Life Essence. Its `buff` combines two stats,
`"Troops' Lethality, Troops' Health"`, at +1% per level, like the four-stat buff of Serpent
Sanctuary. Its `prosperity` rises 2,000 per level to 20,000 at level 10. Harbor of Hope comes from
the Silverfrost Shop on a recurring but irregular basis. This is closer to the standing availability
of Starry Lighthouse than to a limited-time Epic or Mythic, so it is `Unique` and not
`limited: true`.

Names and buff text are copied exactly as the source shows them. This includes likely fan-site typos
that no second source can check: "Marskman Attack" on Clock Hut, "Floating Markert", "Marksman
Defence" on Fisherman's Chalet, and "Hero's Sanctun". The level import spelled the last one "Hero's
Sanctum", but it was merged into the existing `hero-s-sanctun` id so that no reference breaks. As a
result `decoration().find('heros-sanctum')` returns nothing, and
`decoration().find('hero-s-sanctun')` has the full level data.

`img` is set only on decorations that have a picture so far. It is stored under
`images/daybreak-island/`. The sources are crops from these images.

| Decoration                       | Image source                                              |
| -------------------------------- | --------------------------------------------------------- |
| Dragon Pagoda, Serpent Sanctuary | heaven-guardian.com guide images                          |
| War Chariot, Cannon              | Tundra Arms League legion rewards screenshot, outof.games |
| Tundra Truck, Giant Horn         | Alliance Showdown reward screenshots, outof.games         |
| Conquering Sword                 | In-game SvS reward screenshot                             |
| Icefire Way                      | In-game League Shop screenshot                            |
| Luminari Citadel, Hero's Sanctum | In-game Labyrinth reward screenshots                      |

The per-level buffs of Cannon are not documented, so its levels carry blank buffs.
