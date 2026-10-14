# Tundra Album

The albums of the Tundra Album event. An album has 9 puzzles. A puzzle is built from pieces of 1 to
5 stars, gives a reward when it is done, and the album gives a buff when all 9 puzzles are done. Use
it to see what an album holds and what finishing it gives.

The package holds four albums so far, Crystalline Mysteries, Daybreak Island, Explore the World, and
Song of Heroes. More albums are added later.

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

console.log(tundraAlbum().count()); // 4
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
`itemId`, an id from `items()`. A piece has `id`, `name`, `img`, and `stars` (1 to 5). The id of a
piece is the id of its puzzle and its position, such as `fiery-crystal-1`. The name of a piece is
the name of its puzzle, a dash, and its position, such as `Fiery Crystal - 1`. The pieces are in the
order of the album, from 1 star up. `img` is the path of an image in `images/tundra-album/`: the
picture of a puzzle, and the tile of a piece as the game shows it, with its stars.

### Crystalline Mysteries

The buff is Troops Attack +2%. The completion rewards are 70 Random Chief Charm Material Chest and
200 Fire Crystal.

| Puzzle             | Pieces | 1 star | 2 stars | 3 stars | 4 stars | 5 stars | Reward                       |
| ------------------ | ------ | ------ | ------- | ------- | ------- | ------- | ---------------------------- |
| Fiery Crystal      | 12     | 3      | 3       | 3       | 3       | 0       | 7 Enhancement XP Component   |
| Mining the Fire    | 15     | 3      | 5       | 4       | 2       | 1       | 3 Essence Stones             |
| Heirs of Empire    | 15     | 3      | 5       | 4       | 2       | 1       | 3 Chief Gear Materials Chest |
| Sins of Empire     | 15     | 3      | 4       | 4       | 2       | 2       | 3 Essence Stones             |
| Fire Reborn        | 15     | 3      | 3       | 3       | 3       | 3       | 2 Mythic General Hero Shard  |
| The Burning Legion | 18     | 2      | 4       | 4       | 4       | 4       | 24 Fire Crystal              |
| Promises of Fire   | 18     | 2      | 3       | 3       | 5       | 5       | 30 Fire Crystal              |
| Crystalline Rage   | 18     | 0      | 2       | 2       | 7       | 7       | 30 Fire Crystal              |
| Fire Crystal Era   | 18     | 0      | 2       | 2       | 7       | 7       | 30 Fire Crystal              |

The album has 144 pieces: 19 at 1 star, 31 at 2 stars, 29 at 3 stars, 35 at 4 stars, and 30 at 5
stars.

### Daybreak Island

The buff is Troops Defense +2%. The completion rewards are 16 Mythic General Decoration Component
and 15 8h General Speedup.

| Puzzle                 | Pieces | 1 star | 2 stars | 3 stars | 4 stars | 5 stars | Reward                                |
| ---------------------- | ------ | ------ | ------- | ------- | ------- | ------- | ------------------------------------- |
| Daybreak Island Legend | 12     | 4      | 4       | 3       | 1       | 0       | 30 Polishing Solution                 |
| Island of Dreams       | 12     | 3      | 3       | 4       | 2       | 0       | 7 Enhancement XP Component            |
| Tree of Life           | 12     | 3      | 3       | 3       | 3       | 0       | 3 3h General Speedup                  |
| Call of the Sea        | 15     | 3      | 5       | 4       | 2       | 1       | 3 Chief Gear Materials Chest          |
| Distant Resonance      | 15     | 3      | 4       | 4       | 2       | 2       | 4 Lucky Hero Gear Chest               |
| Caravan Visit          | 15     | 3      | 3       | 3       | 3       | 3       | 10 Design Plans                       |
| New Home               | 18     | 2      | 4       | 4       | 4       | 4       | 1 Mythic General Decoration Component |
| Daybreak Song          | 18     | 2      | 3       | 3       | 5       | 5       | 1 Mythic General Decoration Component |
| Island Splendors       | 18     | 0      | 2       | 2       | 7       | 7       | 3 Mythic General Decoration Component |

The album has 135 pieces: 23 at 1 star, 31 at 2 stars, 30 at 3 stars, 29 at 4 stars, and 22 at 5
stars.

### Explore the World

The buff is Troops Attack +2%. The completion rewards are 30 8h Troop Training Speedup and 100
Enhancement XP Component.

| Puzzle              | Pieces | 1 star | 2 stars | 3 stars | 4 stars | 5 stars | Reward                                |
| ------------------- | ------ | ------ | ------- | ------- | ------- | ------- | ------------------------------------- |
| War on Winter       | 9      | 4      | 3       | 2       | 0       | 0       | 2,500 Coal                            |
| Exploration Journal | 12     | 4      | 4       | 3       | 1       | 0       | 30 Polishing Solution                 |
| Hunting Guild       | 12     | 3      | 3       | 4       | 2       | 0       | 7 Enhancement XP Component            |
| The Raging Bear     | 12     | 3      | 3       | 3       | 3       | 0       | 3 3h General Speedup                  |
| Treasure Kingdom    | 15     | 3      | 5       | 4       | 2       | 1       | 3 Essence Stones                      |
| Wealth Is Knowledge | 15     | 3      | 4       | 4       | 2       | 2       | 8 Charm Guide                         |
| Ruins of Old        | 15     | 3      | 3       | 3       | 3       | 3       | 2 Mythic General Decoration Component |
| Cryptid Days        | 18     | 2      | 4       | 4       | 4       | 4       | 2 8h Troop Training Speedup           |
| Call of the Stars   | 18     | 2      | 3       | 3       | 5       | 5       | 4 Lucky Hero Gear Chest               |

The album has 126 pieces: 27 at 1 star, 32 at 2 stars, 30 at 3 stars, 22 at 4 stars, and 15 at 5
stars.

### Song of Heroes

The buff is Resource Gathering Speed +5%. The completion rewards are 40 Mythic General Hero Shard
and 50 Lucky Hero Gear Chest.

| Puzzle              | Pieces | 1 star | 2 stars | 3 stars | 4 stars | 5 stars | Reward                       |
| ------------------- | ------ | ------ | ------- | ------- | ------- | ------- | ---------------------------- |
| Dauntless Heroes    | 9      | 5      | 3       | 1       | 0       | 0       | 45 Enhancement XP Component  |
| Snow Angel          | 9      | 4      | 3       | 2       | 0       | 0       | 2,500 Coal                   |
| Everyday Champions  | 12     | 4      | 4       | 3       | 1       | 0       | 30 Polishing Solution        |
| Arcadia's Legacy    | 12     | 3      | 3       | 4       | 2       | 0       | 7 Enhancement XP Component   |
| "I Am the Fire."    | 12     | 3      | 3       | 3       | 3       | 0       | 3 3h General Speedup         |
| Artisan Architect   | 15     | 3      | 5       | 4       | 2       | 1       | 3 Chief Gear Materials Chest |
| Life Vs Death       | 15     | 3      | 4       | 4       | 2       | 2       | 4 Lucky Hero Gear Chest      |
| The Icebreakers     | 15     | 3      | 3       | 3       | 3       | 3       | 10 Design Plans              |
| Epic of a New World | 18     | 2      | 4       | 4       | 4       | 4       | 6 Lucky Hero Gear Chest      |

The album has 117 pieces: 30 at 1 star, 32 at 2 stars, 28 at 3 stars, 17 at 4 stars, and 10 at 5
stars. The reward of Dauntless Heroes is 45 of the Enhancement XP Component, with the 10 on its
icon.

## Notes

The pieces, the star levels, and the reward amounts of the four albums are read from the album
screens of the game, and the images are cut from the same screens. The package owner names the items
of the album reward (Random Chief Charm Material Chest), of Fiery Crystal (Enhancement XP
Component), of Heirs of Empire (Chief Gear Materials Chest), and of Fire Reborn (Mythic General Hero
Shard). The items of the other rewards are read from the icons of the screens. The reward of Fiery
Crystal is 7 of the Enhancement XP Component with the 100 on its icon, as the screen shows it. The
item `enhancement-xp-component` covers both the 10 and the 100 component.

These parts are not in the data yet:

- The other albums of the event. The [Events](../events/README.md) module lists the buff of each of
  them.
