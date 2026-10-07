# Items

The 273 functional items of the game: resources, currencies, chests, buffs, speedups, and more. Use
it to look up an item by id, to resolve the item ids that other modules use for rewards and costs,
or to read the loot table of a chest.

## Usage

```ts
import { items } from "whiteout-survival-data";

// All chests
const chests = items().byCategory("Chest").get();

// Look up an item by id
const chest = items().find("arena-star-chest");
console.log(chest?.name, chest?.category); // "Arena Star Chest" "Chest"

// The first rows of a chest loot table
console.log(chest?.rewardRates?.slice(0, 2));

// Search by name
const arena = items().search("arena");
```

## Query methods

| Method          | Returns     | Description                                              |
| --------------- | ----------- | -------------------------------------------------------- |
| `byCategory(c)` | `ItemQuery` | Items in category `c`. See the category list under Data. |

The shared terminal methods `get`, `first`, `find`, `findByName`, `search`, and `count` are
described in [How It Works](../../../README.md#how-it-works).

## Data

Items are in `data/chief/items.json`. Each entry has `id`, `name`, `img`, `category`, an optional
`description`, a list of `sources`, and an optional `rewardRates`.

`category` is one of 11 values.

| Category       | Items |
| -------------- | ----- |
| Chest          | 60    |
| Event          | 58    |
| Others         | 40    |
| Buff           | 31    |
| Hero Items     | 23    |
| Speedups       | 21    |
| Experts        | 16    |
| Gear Materials | 10    |
| Pet            | 6     |
| Fire Crystal   | 4     |
| Teleporter     | 4     |

`id` is the wiki URL slug of the item, not a new slug made from the name. Several names repeat
across categories, and the source slugs are already unique. The Skins module has the same rule.

`sources` is a plain list of where an item drops from, such as shops, events, and activities. It is
empty for 91 items, where the wiki does not document a source.

`rewardRates` is a loot table, a list of `{ reward, amount, probabilityPercent }`. Only chests carry
it, and only 12 of the 60 chests do.

## Notes

The data comes from the master item catalog page of the wiki, which covers 415 items across 18
category tabs. Birthday Card entries are skipped, because they are a yearly login gift with no
gameplay data. The other 17 tabs split by kind. Functional items are in this module, and cosmetic
skins are in `skins()`.

The first 10 categories are the tab labels of the wiki. `Speedups` is not a wiki tab. It holds the
21 general and type-specific speedup items (1m to 8h), which the catalog does not list. Their icons
are cropped from in-game Backpack screenshots. The 3h and 8h icons are not added yet for most types.

The source site tags five items under more than one tab, all of them involving Chest. Seeker's Chest
is tagged both `Chest` and `Experts`. `Chest` wins in every case because it is the more specific
category.

The wiki shows chest rewards in two structured shapes: a "Reward Rates" bullet list, and an `Item`,
`Quantity`, `Chance` table in which the item name cell spans several tiers. The parser reads both.
The other chests describe rewards in prose only and get no `rewardRates`.
