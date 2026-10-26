# Items

The 418 functional items of the game: resources, currencies, chests, buffs, speedups, and more. Use
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
`description`, a list of `sources`, and an optional `rewardRates`. The 25 speedup items also have a
`speedup` with its `type` (`general`, `construction`, `troop`, `research`, `learning`, or `healing`)
and its length in `minutes`, read from the id (`speedup-general-1h` is 60 minutes).

`category` is one of 14 values.

| Category           | Items |
| ------------------ | ----- |
| Chest              | 55    |
| Resources          | 45    |
| Event              | 58    |
| Others             | 39    |
| Buff               | 31    |
| Hero Items         | 75    |
| Speedups           | 25    |
| Experts            | 17    |
| Chief Material     | 7     |
| Hero Gear Material | 6     |
| Pet                | 7     |
| Fire Crystal       | 4     |
| Teleporter         | 4     |
| Furniture          | 45    |

`id` is a unique slug, not a slug made from the name alone. Several names repeat across categories.
The Skins module has the same rule.

`sources` is a plain list of where an item drops from, such as shops, events, and activities. It is
empty for 184 items.

`rewardRates` is a loot table, a list of `{ reward, amount, probabilityPercent }`. Only chests carry
it, and only 12 of the 55 chests do.

## Notes

Birthday Card entries are skipped, because they are a yearly login gift with no gameplay data.
Functional items are in this module, and cosmetic skins are in `skins()`.

`Speedups` holds the 25 general and type-specific speedup items that are in the game. Their icons
are cropped from in-game Backpack screenshots. General and troop have 1m, 5m, 1h, 3h, and 8h items.
Construction, research, and learning have 1m, 5m, 1h, and 3h items. Healing has 1m, 5m, and 1h
items. The game has no other lengths, so the package has no items for them.

The icon of the 8h Troop Training Speedup is cropped from an album screen, the reward of the puzzle
Canyon Clash, and the amount on it is painted out. The icons of the 3h Research, 3h Troop Training,
and 3h Construction Speedups are cropped from the tooltips of piece count rewards of the Tundra
Album.

The icons of Alliance XP and Activity Triumph Points, two items of the activity bar of the Daily
Missions, are cropped from the tooltip of a reward level of the bar, and the frame is removed. The
four resource packs of the bar, 10k Meat, 10k Wood, 1k Coal, and 1k Iron, are in `Resources`. The
names are as the game words them.

Five items fit more than one category, all of them involving Chest. Seeker's Chest fits both `Chest`
and `Experts`. `Chest` wins in every case because it is the more specific category.

Chest rewards come in two structured shapes: a "Reward Rates" bullet list, and an `Item`,
`Quantity`, `Chance` table in which the item name cell spans several tiers. The parser reads both.
The other chests describe rewards in prose only and get no `rewardRates`.

### Enhancement XP Component

Hero gear upgrades use the Enhancement XP Component in two sizes, so `Hero Gear Material` has
`enhancement-xp-component-10` and `enhancement-xp-component-100`, named
`10 Enhancement XP Component` and `100 Enhancement XP Component`. They share one icon. A reward with
no size in its source links to the 100 item. The upgrade costs of hero gear are plain XP and do not
link to an item. Their id is `enhancement-xp`, which is not in `items()`.

### Custom Mythic Hero Gear Chest

The Custom Mythic Hero Gear Chest is in `Hero Gear Material` and not in `Chest`, because hero gear
empowerment spends it as a material, with Mithril.

### Hero Shards

Every hero has a Shard item in `Hero Items`, named `<Hero> Shard`. 30 of them have an icon, which is
also the `shardImg` of the hero. The shards of the other 35 heroes, Jeronimo to Eleanor, have no
icon yet, so their `img` is an empty string. The id of these 35 is the id of the hero plus `-shard`,
such as `jeronimo-shard`. The shards of the first 30 keep their older ids, such as
`hero-shard-gen-1a`. The package has no sources for the 35 new shards.

### Gift Strength in Unity

The Gift Strength in Unity is a reward of Alliance Mobilization. It is in `Others` and has no icon
yet, so its `img` is an empty string.

### Mythic Hero Gear

The Mythic Hero Gear is in `Hero Gear Material`. It has no icon yet, so its `img` is an empty
string.

### Resources

The 45 items of `Resources` are the three Custom Resource Chests, the three Custom Secured Resource
Chests, the plain `meat`, `wood`, `coal`, `iron`, and `steel` items, and the resource packs of Meat,
Wood, Coal, and Iron. They match the Resources tab of the in-game Backpack. Meat and Wood have packs
of 1k, 10k, 100k, and 1M. Coal and Iron have packs of 100, 1k, 10k, 100k, and 1M. Every pack from 1k
up also has a Secured version, which the game marks with a shield.

An id is the resource and the size, such as `meat-10k`, with `-secured` added for the Secured
version, such as `meat-10k-secured`. A Custom Secured Resource Chest uses the icon of the Custom
Resource Chest of the same level.

The pack icons are cropped from Backpack screenshots in `images/items/resources/`, with their frame,
and the amount on each is painted out. The screenshots had no 1M Secured Coal and no 1M Secured
Iron. Their icons are the 1M icon with the shield of the 1M Secured Wood added. The package has no
loot, source, or content data for the Secured chests and packs, so they only have a name, an icon,
and for the packs a description.

### Furniture

The 45 furniture items are the pieces that the nine entertainment buildings need, plus a Blueprint
for each building. They come from the in-game data of the package owner. The owner states that
furniture is bought with Wish Sigils in the Wish Shop, so `sources` is `Wish Shop` for all of them.
The Wish Sigil is its own item, `wish-sigil`. The Farm, the Climbing Gym, and the Yoga Studio each
have their own Blueprint item (`farm-blueprint`, `climbing-gym-blueprint`, and
`yoga-studio-blueprint`), because the game shows a different picture for each building. The other
six buildings still share one Blueprint, `furniture-blueprint`. A Blueprint is named `Blueprint`, as
in the costs of the buildings.

The 17 items of the Farm, the Climbing Gym, and the Yoga Studio have an icon in
`images/items/furniture/`. The icons are cropped from the Wish Shop screens with their frame, as the
game shows them, including the amount. The other 28 items have none yet, so their `img` is an empty
string. A piece that several buildings use is one item: the Counter and the Table & Chair Set. Its
price can differ by building, so the `pricePerItem` stays on the cost of the building and not on the
item.

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

Gareth has a named sigil, in the same group as the sigils of the other nine experts. Named sigils
come from Expert progression such as Tundra Trek and Frontier Trek, from packs, and from the
conversion of Common Expert Sigils. The `description` and the `sources` are the ones that all nine
other named sigils have, written for Gareth. The game wording of this item was not found.

The icon is cropped from a screenshot of a rewards screen that the package owner supplied. It shows
the sigil as a reward with a count of 200, on its orange tile. The crystal is lifted from the tile
to a transparent background, with the digits of the count rebuilt from the pixels around them, and
is fitted to the same 128 by 128 frame as the other sigils. The source was small, so the face is
softer than on the other icons.
