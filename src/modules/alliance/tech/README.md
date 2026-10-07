# Alliance Tech

The Alliance Technology tree: 59 nodes across the Growth, Territory, and Battle categories, with the
cost, time, prerequisites, and bonus of every level.

## Usage

```ts
import { allianceTech } from "whiteout-survival-data";

// Tier 1 nodes of the Battle category
allianceTech()
  .byCategory("Battle")
  .byTier(1)
  .get()
  .map((n) => n.name);
// ['Infantry Attack I', 'Lancer Attack I', 'Marksman Attack I', 'Rally Expansion I', 'Troops Attack I']

// Cost, time, and bonus of the first level of one node
const level = allianceTech().findByName("Infantry Attack I")?.levels[0];
level?.cost; // [{ itemId: 'meat', amount: 22800 }, { itemId: 'wood', amount: 22800 }]
level?.timeSeconds; // 1800
level?.bonus; // '1%'
```

## Query methods

| Method          | Returns             | Description                                        |
| --------------- | ------------------- | -------------------------------------------------- |
| `byCategory(c)` | `AllianceTechQuery` | Keeps nodes in `Growth`, `Territory`, or `Battle`. |
| `byTier(n)`     | `AllianceTechQuery` | Keeps nodes in tier `n` (1 to 3).                  |

The shared terminal methods (`get`, `first`, `find`, `findByName`, `search`, `count`) are described
in [How It Works](../../../../README.md#how-it-works).

## Data

The data is in `data/alliance/alliance-tech.json`. It has 59 nodes in 3 categories, each split into
3 tiers. A node has `id`, `name`, `img`, `category`, `tier`, `description` (the stat the node
affects), and `levels`. A level has `level`, `prerequisites` (a list of `{ id, level }` that point
to other Alliance Tech nodes), `cost` (a list of `{ itemId, amount }`), `timeSeconds`, and `bonus`,
the raw value of the stat at that level, such as `'3%'`.

## Notes

The source is `https://www.whiteoutsurvival.wiki/alliance-tech/`, read one page per node like
`research()`. Unlike `research()`, the page has no power column. Every prerequisite is another
Alliance Tech node. No building gates the tree.

`bonus` is `undefined` for the two one-off unlock nodes that have no stat effect, Tundra Surveying
and Fertile Land Expedition.

The wiki writes upgrade time as `M:S` under one hour (such as `30:00`) and `H:M:S` from one hour
(such as `01:00:00`). Both forms are converted to seconds.

The wiki has three content errors. The package corrects them as follows:

- The Level column of Cooperative Protocols I and Alliance Regimentation I repeats the node name and
  level (`"Cooperative Protocols I 1"`) in every row. The package reads the trailing number.
- The Marksman Attack I page lists Rally Expansion I Levels 4 and 5 as prerequisites for its own
  Levels 4 and 5. Rally Expansion I has only 3 levels. Infantry Attack I and Lancer Attack I, which
  are otherwise identical, leave their Levels 4 and 5 without a prerequisite. The Marksman Attack I
  prerequisites for those levels are dropped to match.
- The only prerequisite of Tundra Surveying is "Alliance Regimentation II" with no level number.
  Every other cross-reference on the site has one. The package uses Level 5, the last level of that
  line, because Tundra Surveying is a one-off unlock gate.
