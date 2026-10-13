# Items

The 326 functional items of the game: resources, currencies, chests, buffs, speedups, and more. Use
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
`description`, a list of `sources`, and an optional `rewardRates`. The 30 speedup items also have a
`speedup` with its `type` (`general`, `construction`, `troop`, `research`, `learning`, or `healing`)
and its length in `minutes`, read from the id (`speedup-general-1h` is 60 minutes).

`category` is one of 12 values.

| Category       | Items |
| -------------- | ----- |
| Chest          | 60    |
| Event          | 58    |
| Others         | 41    |
| Buff           | 31    |
| Hero Items     | 23    |
| Speedups       | 30    |
| Experts        | 17    |
| Gear Materials | 10    |
| Pet            | 6     |
| Fire Crystal   | 4     |
| Teleporter     | 4     |
| Furniture      | 42    |

`id` is the wiki URL slug of the item, not a new slug made from the name. Several names repeat
across categories, and the source slugs are already unique. The Skins module has the same rule.

`sources` is a plain list of where an item drops from, such as shops, events, and activities. It is
empty for 100 items, where the wiki does not document a source.

`rewardRates` is a loot table, a list of `{ reward, amount, probabilityPercent }`. Only chests carry
it, and only 12 of the 60 chests do.

## Notes

The data comes from the master item catalog page of the wiki, which covers 415 items across 18
category tabs. Birthday Card entries are skipped, because they are a yearly login gift with no
gameplay data. The other 17 tabs split by kind. Functional items are in this module, and cosmetic
skins are in `skins()`.

The first 10 categories are the tab labels of the wiki. `Speedups` is not a wiki tab. It holds the
30 general and type-specific speedup items (1m to 8h), which the catalog does not list. Their icons
are cropped from in-game Backpack screenshots. Each of the six types (general, construction,
research, troop, learning, and healing) has a 1m, 5m, 1h, 3h, and 8h item. Nine items have no icon
yet, so their `img` is an empty string and their `sources` are empty: the 3h and 8h speedups of
construction, troop, research, and healing, and the 8h speedup of learning. They are placeholders,
so no source states them yet.

The source site tags five items under more than one tab, all of them involving Chest. Seeker's Chest
is tagged both `Chest` and `Experts`. `Chest` wins in every case because it is the more specific
category.

The wiki shows chest rewards in two structured shapes: a "Reward Rates" bullet list, and an `Item`,
`Quantity`, `Chance` table in which the item name cell spans several tiers. The parser reads both.
The other chests describe rewards in prose only and get no `rewardRates`.

### Furniture

The 42 furniture items are the pieces that the nine entertainment buildings need, plus the Blueprint
that each of them needs. They come from the in-game data of the package owner, not from the wiki.
The owner states that furniture is bought with Wish Sigils in the Wish Shop, so `sources` is
`Wish Shop` for all of them. The Wish Sigil is its own item, `wish-sigil`. No icon exists, so `img`
is an empty string. A piece that several buildings use is one item: the Blueprint
(`furniture-blueprint`), the Counter, and the Table & Chair Set. Its price can differ by building,
so the `pricePerItem` stays on the cost of the building and not on the item.

### Wish Sigil

The Wish Sigil is the currency of the Wish Shop, which the package owner states for the furniture of
the entertainment buildings. It is in `Others`, with the other standing currencies, because the game
gives it as a daily reward and not as an event token. Its `sources` are the two that the game lists
on the Obtain more screen of the item: the Wish Station ("Obtained by completing Survivor Wishes")
and the Development Index Daily Reward. The `description` is written for the package. The Wish
Voucher is a different item, which unlocks random Kasia's Wish House rewards.

The icon is cropped from a screenshot of that screen that the package owner supplied. The coin is
cut from its orange tile on a transparent background.

### Gareth Sigil

The wiki item list has no Gareth Sigil. The item is here because the Heaven Guardian guides state
that Gareth has a named sigil, in the same group as the sigils of the other nine experts, and that
named sigils come from Expert progression such as Tundra Trek and Frontier Trek, from packs, and
from the conversion of Common Expert Sigils. The `description` and the `sources` are the ones that
all nine other named sigils have, written for Gareth. The game wording of this item was not found.

The icon is cropped from a screenshot of a rewards screen that the package owner supplied. It shows
the sigil as a reward with a count of 200, on its orange tile. The crystal is lifted from the tile
to a transparent background, with the digits of the count rebuilt from the pixels around them, and
is fitted to the same 128 by 128 frame as the other sigils. The source was small, so the face is
softer than on the other icons.
