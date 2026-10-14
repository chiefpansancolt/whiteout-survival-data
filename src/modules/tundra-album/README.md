# Tundra Album

The albums of the Tundra Album event. An album has 9 puzzles. A puzzle is built from pieces of 1 to
5 stars, gives a reward when it is done, and the album gives a buff when all 9 puzzles are done. Use
it to see what an album holds and what finishing it gives.

The package holds 12 albums so far, Crystalline Mysteries, Daybreak Island, Explore the World, Song
of Heroes, Rekindled Flames, Tundra Alliance, Battlefield Epic, Spectacular Adventures, Divine
Weapons, The Labyrinth, Nature's Strength, and Ballad of Wind and Cold. More albums are added later.

## Usage

```ts
import { items, tundraAlbum, tundraPuzzlePieceCounts } from "whiteout-survival-data";

const album = tundraAlbum().find("crystalline-mysteries");
console.log(album?.buff); // { stat: 'Troops Attack', statKey: 'troops-attack', value: '+2%', amount: 2, unit: 'percent' }
console.log(album?.puzzles.length); // 9

// The pieces of a puzzle at each star level
const mining = album?.puzzles.find((puzzle) => puzzle.id === "mining-the-fire");
console.log(tundraPuzzlePieceCounts(mining!)); // { '1': 3, '2': 5, '3': 4, '4': 2, '5': 1 }

// The name of a piece
console.log(mining?.pieces[14].name); // 'Mining the Fire - 15'

// The reward of a puzzle, with the item from items() when it is known
const reward = mining?.reward;
console.log(reward?.amount, reward?.itemId && items().find(reward.itemId)?.name); // 3 'Essence Stones'

console.log(tundraAlbum().count()); // 9
```

## Functions

| Function                          | Returns                                 | Description                                              |
| --------------------------------- | --------------------------------------- | -------------------------------------------------------- |
| `tundraAlbum(source?)`            | `TundraAlbumQuery`                      | The albums. `source` defaults to the data of the package |
| `tundraPuzzlePieceCounts(puzzle)` | `Record<1 \| 2 \| 3 \| 4 \| 5, number>` | The number of pieces of a puzzle at each star level      |
| `TUNDRA_ALBUM_PUZZLES_PER_ALBUM`  | `9`                                     | The number of puzzles in an album                        |

The shared terminal methods (`get`, `first`, `find`, `findByName`, `search`, `count`) are described
in [How It Works](../../../README.md#how-it-works).

## Data

The data is in `data/tundra-album.json`. An album has these fields.

| Field               | Meaning                                                                 |
| ------------------- | ----------------------------------------------------------------------- |
| `id`, `name`        | The album, such as `crystalline-mysteries` and `Crystalline Mysteries`  |
| `buff`              | The buff of the album: `stat`, `statKey`, `value`, `amount`, and `unit` |
| `completionRewards` | What the album gives when all its puzzles are done, besides the buff    |
| `puzzles`           | The 9 puzzles                                                           |

A puzzle has `id`, `name`, `img`, `reward`, and `pieces`. A reward is `{ amount }` with an optional
`itemId`, an id from `items()`, and a `size` of 10 or 100 on the Enhancement XP Component, the
number on its icon. A piece has `id`, `name`, `img`, and `stars` (1 to 5). The id of a piece is the
id of its puzzle and its position, such as `fiery-crystal-1`. The name of a piece is the name of its
puzzle, a dash, and its position, such as `Fiery Crystal - 1`. The pieces are in the order of the
album, from 1 star up. `img` is the path of an image in `images/tundra-album/`: the picture of a
puzzle, and the tile of a piece as the game shows it, with its stars.

### Crystalline Mysteries

The buff is Troops Attack +2%. The completion rewards are 70 Random Chief Charm Material Chest and
200 Fire Crystal.

| Puzzle             | Pieces | 1 star | 2 stars | 3 stars | 4 stars | 5 stars | Reward                           |
| ------------------ | ------ | ------ | ------- | ------- | ------- | ------- | -------------------------------- |
| Fiery Crystal      | 12     | 3      | 3       | 3       | 3       | 0       | 7 Enhancement XP Component (100) |
| Mining the Fire    | 15     | 3      | 5       | 4       | 2       | 1       | 3 Essence Stones                 |
| Heirs of Empire    | 15     | 3      | 5       | 4       | 2       | 1       | 3 Chief Gear Materials Chest     |
| Sins of Empire     | 15     | 3      | 4       | 4       | 2       | 2       | 3 Essence Stones                 |
| Fire Reborn        | 15     | 3      | 3       | 3       | 3       | 3       | 2 Mythic General Hero Shard      |
| The Burning Legion | 18     | 2      | 4       | 4       | 4       | 4       | 24 Fire Crystal                  |
| Promises of Fire   | 18     | 2      | 3       | 3       | 5       | 5       | 30 Fire Crystal                  |
| Crystalline Rage   | 18     | 0      | 2       | 2       | 7       | 7       | 30 Fire Crystal                  |
| Fire Crystal Era   | 18     | 0      | 2       | 2       | 7       | 7       | 30 Fire Crystal                  |

The album has 144 pieces: 19 at 1 star, 31 at 2 stars, 29 at 3 stars, 35 at 4 stars, and 30 at 5
stars.

### Daybreak Island

The buff is Troops Defense +2%. The completion rewards are 16 Mythic General Decoration Component
and 15 8h General Speedup.

| Puzzle                 | Pieces | 1 star | 2 stars | 3 stars | 4 stars | 5 stars | Reward                                |
| ---------------------- | ------ | ------ | ------- | ------- | ------- | ------- | ------------------------------------- |
| Daybreak Island Legend | 12     | 4      | 4       | 3       | 1       | 0       | 30 Polishing Solution                 |
| Island of Dreams       | 12     | 3      | 3       | 4       | 2       | 0       | 7 Enhancement XP Component (100)      |
| Tree of Life           | 12     | 3      | 3       | 3       | 3       | 0       | 3 3h General Speedup                  |
| Call of the Sea        | 15     | 3      | 5       | 4       | 2       | 1       | 3 Chief Gear Materials Chest          |
| Distant Resonance      | 15     | 3      | 4       | 4       | 2       | 2       | 4 Lucky Hero Gear Chest               |
| Caravan Visit          | 15     | 3      | 3       | 3       | 3       | 3       | 10 Design Plans                       |
| New Home               | 18     | 2      | 4       | 4       | 4       | 4       | 1 Mythic General Decoration Component |
| Daybreak Song          | 18     | 2      | 3       | 3       | 5       | 5       | 1 Mythic General Decoration Component |
| Island Splendors       | 18     | 0      | 2       | 2       | 7       | 7       | 3 Mythic General Hero Shard           |

The album has 135 pieces: 23 at 1 star, 31 at 2 stars, 30 at 3 stars, 29 at 4 stars, and 22 at 5
stars.

### Explore the World

The buff is Troops Attack +2%. The completion rewards are 30 8h Troop Training Speedup and 100
Enhancement XP Component (100).

| Puzzle              | Pieces | 1 star | 2 stars | 3 stars | 4 stars | 5 stars | Reward                              |
| ------------------- | ------ | ------ | ------- | ------- | ------- | ------- | ----------------------------------- |
| War on Winter       | 9      | 4      | 3       | 2       | 0       | 0       | 2,500 Hardened Alloy                |
| Exploration Journal | 12     | 4      | 4       | 3       | 1       | 0       | 30 Polishing Solution               |
| Hunting Guild       | 12     | 3      | 3       | 4       | 2       | 0       | 7 Enhancement XP Component (100)    |
| The Raging Bear     | 12     | 3      | 3       | 3       | 3       | 0       | 3 3h General Speedup                |
| Treasure Kingdom    | 15     | 3      | 5       | 4       | 2       | 1       | 3 Essence Stones                    |
| Wealth Is Knowledge | 15     | 3      | 4       | 4       | 2       | 2       | 8 Charm Guide                       |
| Ruins of Old        | 15     | 3      | 3       | 3       | 3       | 3       | 2 Mythic General Hero Shard         |
| Cryptid Days        | 18     | 2      | 4       | 4       | 4       | 4       | 2 8h Troop Training Speedup         |
| Call of the Stars   | 18     | 2      | 3       | 3       | 5       | 5       | 4 Random Chief Charm Material Chest |

The album has 126 pieces: 27 at 1 star, 32 at 2 stars, 30 at 3 stars, 22 at 4 stars, and 15 at 5
stars.

### Song of Heroes

The buff is Resource Gathering Speed +5%. The completion rewards are 40 Mythic General Hero Shard
and 50 Lucky Hero Gear Chest.

| Puzzle              | Pieces | 1 star | 2 stars | 3 stars | 4 stars | 5 stars | Reward                           |
| ------------------- | ------ | ------ | ------- | ------- | ------- | ------- | -------------------------------- |
| Dauntless Heroes    | 9      | 5      | 3       | 1       | 0       | 0       | 45 Enhancement XP Component (10) |
| Snow Angel          | 9      | 4      | 3       | 2       | 0       | 0       | 2,500 Hardened Alloy             |
| Everyday Champions  | 12     | 4      | 4       | 3       | 1       | 0       | 30 Polishing Solution            |
| Arcadia's Legacy    | 12     | 3      | 3       | 4       | 2       | 0       | 7 Enhancement XP Component (100) |
| "I Am the Fire."    | 12     | 3      | 3       | 3       | 3       | 0       | 3 3h General Speedup             |
| Artisan Architect   | 15     | 3      | 5       | 4       | 2       | 1       | 3 Chief Gear Materials Chest     |
| Life Vs Death       | 15     | 3      | 4       | 4       | 2       | 2       | 4 Lucky Hero Gear Chest          |
| The Icebreakers     | 15     | 3      | 3       | 3       | 3       | 3       | 10 Design Plans                  |
| Epic of a New World | 18     | 2      | 4       | 4       | 4       | 4       | 6 Lucky Hero Gear Chest          |

The album has 117 pieces: 30 at 1 star, 32 at 2 stars, 28 at 3 stars, 17 at 4 stars, and 10 at 5
stars. The reward of Dauntless Heroes is 45 of the Enhancement XP Component of 10.

### Rekindled Flames

The buff is Resource Production Speed +5%. The completion rewards are 30 8h General Speedup and 20
Mythic General Hero Shard.

| Puzzle        | Pieces | 1 star | 2 stars | 3 stars | 4 stars | 5 stars | Reward                           |
| ------------- | ------ | ------ | ------- | ------- | ------- | ------- | -------------------------------- |
| Furnace       | 9      | 7      | 2       | 0       | 0       | 0       | 2,000 Hardened Alloy             |
| City Founding | 9      | 5      | 3       | 1       | 0       | 0       | 45 Enhancement XP Component (10) |
| Dawn Alliance | 9      | 4      | 3       | 2       | 0       | 0       | 6 1h General Speedup             |
| Decisions     | 12     | 4      | 4       | 3       | 1       | 0       | 30 Polishing Solution            |
| Menace Afoot  | 12     | 3      | 3       | 4       | 2       | 0       | 7 Enhancement XP Component (100) |
| Heroes        | 12     | 3      | 3       | 3       | 3       | 0       | 3 3h General Speedup             |
| Food Power    | 15     | 3      | 5       | 4       | 2       | 1       | 3 Essence Stones                 |
| A New Order   | 15     | 3      | 4       | 4       | 2       | 2       | 8 Charm Guide                    |
| True Explorer | 15     | 3      | 3       | 3       | 3       | 3       | 2 Mythic General Hero Shard      |

The album has 108 pieces: 35 at 1 star, 30 at 2 stars, 24 at 3 stars, 13 at 4 stars, and 6 at 5
stars.

### Tundra Alliance

The buff is Troops Attack +2%. The completion rewards are 100 Lucky Hero Gear Chest and 40 Essence
Stones.

| Puzzle                      | Pieces | 1 star | 2 stars | 3 stars | 4 stars | 5 stars | Reward                           |
| --------------------------- | ------ | ------ | ------- | ------- | ------- | ------- | -------------------------------- |
| Alliance-Building           | 12     | 3      | 3       | 4       | 2       | 0       | 35 Polishing Solution            |
| One Heart                   | 12     | 3      | 3       | 3       | 3       | 0       | 7 Enhancement XP Component (100) |
| Heroes' Aid                 | 15     | 3      | 5       | 4       | 2       | 1       | 3 Essence Stones                 |
| Alliance Resources          | 15     | 3      | 4       | 4       | 2       | 2       | 8 Charm Guide                    |
| Twisted Obsession           | 15     | 3      | 3       | 3       | 3       | 3       | 2 Mythic General Hero Shard      |
| Virtues and Crimes          | 18     | 2      | 4       | 4       | 4       | 4       | 2 8h General Speedup             |
| Children of the "New World" | 18     | 2      | 3       | 3       | 5       | 5       | 5 Chief Gear Materials Chest     |
| Horn of Command             | 18     | 2      | 3       | 3       | 5       | 5       | 5 Essence Stones                 |
| Battlefield Epic            | 18     | 0      | 2       | 2       | 7       | 7       | 3 Mythic General Hero Shard      |

The album has 141 pieces: 21 at 1 star, 30 at 2 stars, 30 at 3 stars, 33 at 4 stars, and 27 at 5
stars.

### Battlefield Epic

The buff is Troops Defense +2%. The completion rewards are 80 Chief Gear Materials Chest and 100
Design Plans.

| Puzzle                  | Pieces | 1 star | 2 stars | 3 stars | 4 stars | 5 stars | Reward                       |
| ----------------------- | ------ | ------ | ------- | ------- | ------- | ------- | ---------------------------- |
| Imperial Foundry        | 12     | 3      | 3       | 3       | 3       | 0       | 3 3h General Speedup         |
| King of the Battlefield | 15     | 3      | 5       | 4       | 2       | 1       | 3 Essence Stones             |
| Orichalcum              | 15     | 3      | 5       | 4       | 2       | 1       | 3 Chief Gear Materials Chest |
| City of Kings           | 15     | 3      | 4       | 4       | 2       | 2       | 4 Lucky Hero Gear Chest      |
| Pilot's Paradise        | 15     | 3      | 3       | 3       | 3       | 3       | 10 Design Plans              |
| Great Contest           | 18     | 2      | 4       | 4       | 4       | 4       | 6 Lucky Hero Gear Chest      |
| Canyon Clash            | 18     | 2      | 3       | 3       | 5       | 5       | 2 8h Troop Training Speedup  |
| Hero's Glory            | 18     | 0      | 2       | 2       | 7       | 7       | 15 Charm Design              |
| Grand Banquet           | 18     | 0      | 2       | 2       | 7       | 7       | 3 Mythic General Hero Shard  |

The album has 144 pieces: 19 at 1 star, 31 at 2 stars, 29 at 3 stars, 35 at 4 stars, and 30 at 5
stars.

### Spectacular Adventures

The buff is Troops Attack +2%. The completion rewards are 70 Random Chief Charm Material Chest and
100 Charm Design.

| Puzzle             | Pieces | 1 star | 2 stars | 3 stars | 4 stars | 5 stars | Reward                       |
| ------------------ | ------ | ------ | ------- | ------- | ------- | ------- | ---------------------------- |
| Fishing Tournament | 12     | 3      | 3       | 3       | 3       | 0       | 35 Polishing Solution        |
| Snowbusters        | 15     | 3      | 5       | 4       | 2       | 1       | 3 Essence Stones             |
| Bandit             | 15     | 3      | 5       | 4       | 2       | 1       | 3 Chief Gear Materials Chest |
| Red-Haired Joe     | 15     | 3      | 4       | 4       | 2       | 2       | 8 Charm Guide                |
| A "Queen" Arises   | 15     | 3      | 3       | 3       | 3       | 3       | 2 Mythic General Hero Shard  |
| The Eagles         | 18     | 2      | 4       | 4       | 4       | 4       | 6 Lucky Hero Gear Chest      |
| Bounty Hunter      | 18     | 2      | 3       | 3       | 5       | 5       | 2 8h General Speedup         |
| Wandering Merchant | 18     | 0      | 2       | 2       | 7       | 7       | 3 Mythic General Hero Shard  |
| Tundra Adventure   | 18     | 0      | 2       | 2       | 7       | 7       | 15 Design Plans              |

The album has 144 pieces: 19 at 1 star, 31 at 2 stars, 29 at 3 stars, 35 at 4 stars, and 30 at 5
stars.

### Divine Weapons

The buff is Troops Defense +2%. The completion rewards are 80 Essence Stones and 1 Custom Mythic
Hero Gear Chest.

| Puzzle                  | Pieces | 1 star | 2 stars | 3 stars | 4 stars | 5 stars | Reward                              |
| ----------------------- | ------ | ------ | ------- | ------- | ------- | ------- | ----------------------------------- |
| Master Blacksmith       | 12     | 3      | 3       | 3       | 3       | 0       | 7 Enhancement XP Component (100)    |
| Legendary Divine Weapon | 15     | 3      | 5       | 4       | 2       | 1       | 3 Essence Stones                    |
| Tundra Trade Route      | 15     | 3      | 5       | 4       | 2       | 1       | 3 Chief Gear Materials Chest        |
| Merchant Escort         | 15     | 3      | 4       | 4       | 2       | 2       | 4 Lucky Hero Gear Chest             |
| Cryptid Invasion        | 15     | 3      | 3       | 3       | 3       | 3       | 10 Design Plans                     |
| Steam Rhapsody          | 18     | 2      | 4       | 4       | 4       | 4       | 5 Essence Stones                    |
| Ice Journey             | 18     | 2      | 3       | 3       | 5       | 5       | 4 Random Chief Charm Material Chest |
| Essence Stones          | 18     | 0      | 2       | 2       | 7       | 7       | 15 Charm Design                     |
| Exotic Charm            | 18     | 0      | 2       | 2       | 7       | 7       | 15 Design Plans                     |

The album has 144 pieces: 19 at 1 star, 31 at 2 stars, 29 at 3 stars, 35 at 4 stars, and 30 at 5
stars.

### The Labyrinth

The buff is Troops Attack +2%. The completion rewards are 100 Lucky Hero Gear Chest and 200 Fire
Crystal.

| Puzzle               | Pieces | 1 star | 2 stars | 3 stars | 4 stars | 5 stars | Reward                              |
| -------------------- | ------ | ------ | ------- | ------- | ------- | ------- | ----------------------------------- |
| Underworld Mysteries | 12     | 3      | 3       | 3       | 3       | 0       | 3 3h General Speedup                |
| The World Below      | 15     | 2      | 2       | 4       | 6       | 1       | 2 Mythic General Hero Shard         |
| Digging To Danger    | 15     | 3      | 5       | 4       | 2       | 1       | 3 Chief Gear Materials Chest        |
| Fungal Forest        | 15     | 3      | 4       | 4       | 2       | 2       | 4 Lucky Hero Gear Chest             |
| Great Furnace        | 15     | 3      | 3       | 3       | 3       | 3       | 10 Design Plans                     |
| The Undergrounders   | 18     | 2      | 4       | 4       | 4       | 4       | 4 Random Chief Charm Material Chest |
| The Project          | 18     | 1      | 2       | 3       | 6       | 6       | 6 Lucky Hero Gear Chest             |
| Gaia Heart           | 18     | 1      | 2       | 3       | 6       | 6       | 2 8h General Speedup                |
| The Deepest Echo     | 18     | 0      | 2       | 2       | 7       | 7       | 6 Essence Stones                    |

The album has 144 pieces: 18 at 1 star, 27 at 2 stars, 30 at 3 stars, 39 at 4 stars, and 30 at 5
stars.

### Nature's Strength

The buff is Troops Defense +2%. The completion rewards are 80 Essence Stones and 200 Fire Crystal.

| Puzzle              | Pieces | 1 star | 2 stars | 3 stars | 4 stars | 5 stars | Reward                                   |
| ------------------- | ------ | ------ | ------- | ------- | ------- | ------- | ---------------------------------------- |
| Friend of Nature    | 12     | 3      | 3       | 3       | 3       | 0       | 35 Polishing Solution                    |
| Wild At Heart       | 15     | 3      | 5       | 4       | 2       | 1       | 3 Essence Stones                         |
| Beast Unleashed     | 15     | 2      | 2       | 4       | 6       | 1       | 2 Mythic General Hero Shard              |
| Wild Legion         | 15     | 3      | 4       | 4       | 2       | 2       | 3 Chief Gear Materials Chest             |
| Pets-In-Arms        | 15     | 3      | 3       | 3       | 3       | 3       | 10 Design Plans                          |
| Master Tamer        | 18     | 2      | 3       | 3       | 5       | 5       | 2 Advanced Wild Mark                     |
| Superhuman Strength | 18     | 2      | 3       | 3       | 5       | 5       | 2 Advanced Wild Mark                     |
| Kasia's Struggle    | 18     | 0      | 2       | 2       | 7       | 7       | 5 Pet Advancement Materials Custom Chest |
| Call of the Wild    | 18     | 1      | 2       | 3       | 6       | 6       | 5 Pet Advancement Materials Custom Chest |

The album has 144 pieces: 19 at 1 star, 27 at 2 stars, 29 at 3 stars, 39 at 4 stars, and 30 at 5
stars.

### Ballad of Wind and Cold

The buff is Troops Defense +2%. The completion rewards are 80 Chief Gear Materials Chest and 200
Fire Crystal.

| Puzzle                 | Pieces | 1 star | 2 stars | 3 stars | 4 stars | 5 stars | Reward                              |
| ---------------------- | ------ | ------ | ------- | ------- | ------- | ------- | ----------------------------------- |
| Honor and Glory        | 12     | 3      | 3       | 3       | 3       | 0       | 3 3h General Speedup                |
| Frostwind Track        | 15     | 2      | 2       | 4       | 6       | 1       | 10 Design Plans                     |
| Words of the Forgotten | 15     | 2      | 2       | 4       | 6       | 1       | 3 Chief Gear Materials Chest        |
| Monument to the Flame  | 15     | 3      | 4       | 4       | 2       | 2       | 8 Charm Design                      |
| Alliance Showdown      | 15     | 3      | 3       | 3       | 3       | 3       | 2 Mythic General Hero Shard         |
| State Versus State     | 18     | 2      | 4       | 4       | 4       | 4       | 4 Random Chief Charm Material Chest |
| The Summit of Battle   | 18     | 1      | 2       | 3       | 6       | 6       | 2 8h General Speedup                |
| Castle of Conflict     | 18     | 1      | 2       | 3       | 6       | 6       | 5 Chief Gear Materials Chest        |
| Remaker of Order       | 18     | 0      | 2       | 2       | 7       | 7       | 6 Essence Stones                    |

The album has 144 pieces: 17 at 1 star, 24 at 2 stars, 30 at 3 stars, 43 at 4 stars, and 30 at 5
stars.

## Notes

The pieces, the star levels, and the reward amounts of the 12 albums are read from the album screens
of the game, and the images are cut from the same screens. The package owner names the items of the
album reward (Random Chief Charm Material Chest), of Fiery Crystal (Enhancement XP Component), of
Heirs of Empire (Chief Gear Materials Chest), and of Fire Reborn (Mythic General Hero Shard). The
items of the other rewards are read from the icons of the screens. The reward of Fiery Crystal is 7
of the Enhancement XP Component with the 100 on its icon, as the screen shows it. The item
`enhancement-xp-component` covers both the 10 and the 100 component.

These parts are not in the data yet:

- The other albums of the event. The [Events](../events/README.md) module lists the buff of each of
  them.
