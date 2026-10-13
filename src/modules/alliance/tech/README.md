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
affects), `stat`, `statKey`, and `levels`. A level has `level`, `prerequisites` (a list of
`{ id, level }` that point to other Alliance Tech nodes), `cost` (a list of `{ itemId, amount }`),
`timeSeconds`, `bonus`, the raw value of the stat at that level such as `'3%'`, and the parsed
`amount` and `unit` (`percent` or `flat`) of that value.

## Notes

Unlike `research()`, the nodes have no power column. Every prerequisite is another Alliance Tech
node. No building gates the tree.

`bonus` is `undefined` for the two one-off unlock nodes that have no stat effect, Tundra Surveying
and Fertile Land Expedition. These two nodes and Long Live Our Alliance have no `stat`, `statKey`,
`amount`, or `unit`. The other 56 nodes have a `stat` and a `statKey`.

The `stat` is a short name for what the node raises, written from its `description` with a reviewed
table. For example `Enhances all Troops’ Attack.` gives `Troops Attack`, and
`Speeds up alliance members’ Coal mining in the wilderness.` gives `Coal Gathering Speed`. The
`statKey` is the same kebab-case key as in `research()`, so `infantry-attack` means the same stat in
both. The `bonus` of each level is the bonus at that level, not a step. The bonuses of Storehouse
Expansion II are `50%`, `100%`, `200%`, `300%`, and `400%`, like Storehouse Expansion I, at the
request of the package owner.

Upgrade time is stored in seconds.

Two prerequisites need explanation:

- Marksman Attack I has no prerequisite for its Levels 4 and 5. Rally Expansion I has only 3 levels.
  Infantry Attack I and Lancer Attack I also leave their Levels 4 and 5 without a prerequisite.
- The only prerequisite of Tundra Surveying is Alliance Regimentation II at Level 5, the last level
  of that line, because Tundra Surveying is a one-off unlock gate.
