# Chief Orders

The orders of the Chief's House. Each order costs Contentment and has a cooldown. Use it to show
what an order does, what it costs, and when it can be used again.

There are six orders at the start. From Fire Crystal level 1, three of them are replaced by new
orders, so the data holds nine orders and `atFireCrystalLevel()` returns the ones in effect.

## Usage

```ts
import { chiefOrderReadyAt, chiefOrders } from "whiteout-survival-data";

console.log(chiefOrders().count()); // 9
console.log(chiefOrders().atFireCrystalLevel(0).count()); // 6
console.log(
  chiefOrders()
    .atFireCrystalLevel(1)
    .get()
    .map((order) => order.name),
);
// ['Double Time', 'Rush Job', 'Comprehensive Care', 'Dawn Alliance Commendation', 'Crunch Time', 'Advanced Training']

const doubleTime = chiefOrders().find("double-time")!;
console.log(doubleTime.contentmentCost); // 800000
console.log(doubleTime.cooldownSeconds / 3600); // 23
console.log(doubleTime.bonus?.amount); // 20

// When the order can be used again
const usedAt = new Date("2026-10-12T10:00:00Z");
console.log(chiefOrderReadyAt(doubleTime, usedAt).toISOString()); // '2026-10-13T09:00:00.000Z'
```

## Query methods

| Method                      | Returns                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------- |
| `atFireCrystalLevel(level)` | The orders in effect at a Fire Crystal level. Level 0 is before the first upgrade. |

The shared terminal methods (`get`, `first`, `find`, `findByName`, `search`, `count`) are described
in [How It Works](../../../README.md#how-it-works).

`chiefOrderReadyAt(order, usedAt)` returns the time at which the cooldown of the order ends. The
cooldown starts when the order is used.

## Data

The data is in `data/chief/chief-orders.json`. Each order has an `id`, a `name`, the `effect` in the
wording of the source, a `contentmentCost`, and a `cooldownSeconds`. An order can have a `note` that
the source gives.

| Order               | Contentment cost | Cooldown |
| ------------------- | ---------------- | -------- |
| Double Time         | 800,000          | 23 hours |
| Rush Job            | 150,000          | 24 hours |
| Productivity Day    | 50,000           | 12 hours |
| Urgent Mobilization | 50,000           | 8 hours  |
| Festivities         | 50,000           | 24 hours |
| Comprehensive Care  | 150,000          | 4 hours  |

Double Time and Advanced Training have a `bonus`, because their effect is a percent over a window of
real time. Double Time reduces the time of construction and upgrades that start in the next five
minutes by 20%. Advanced Training raises troop training speed by 20% for two hours. The `bonus` has
the same `stat`, `statKey`, `value`, `amount`, and `unit` fields as the bonuses of the other
modules, and a `windowSeconds`. Use the `statKey` to add it to calculations. The other effects are
in the `effect` text only.

### Orders of the Fire Crystal Age

At Fire Crystal level 1, each of these orders takes the place of one of the first six. The new order
has `unlockFireCrystalLevel` 1, and its `replaces` field holds the `id` of the order it replaces.

| Order                      | Replaces            | Contentment cost | Cooldown |
| -------------------------- | ------------------- | ---------------- | -------- |
| Dawn Alliance Commendation | Festivities         | 800,000          | 2 days   |
| Crunch Time                | Urgent Mobilization | 100,000          | 12 hours |
| Advanced Training          | Productivity Day    | 150,000          | 2 days   |

Dawn Alliance Commendation gives one random reward from the Dawn Alliance vault. Its `rewards` list
has ten entries, and each has an `itemId` from `items()`, a `quantity`, and a `chance` of 10
percent: Fire Crystal (5x and 10x), Essence Stones (3x), Lucky Hero Gear Chest (3), Design Plans (3x
and 8x), Charm Design (3x and 8x), and Charm Guide (3x and 8x). Crunch Time gives +100% resource
output for 24 hours of Survivor Time, like Productivity Day, so it has no `bonus`.

## Sources and assumptions

The six first orders come from one guide, the
[Chief Order guide on Heaven Guardian](https://heaven-guardian.com/whiteout-survival-chiefs-house-orders-guide/).
The Whiteout Survival Wiki has no page for the orders. The three orders of the Fire Crystal Age come
from the package owner, who read them in the game. No web source states them.

- The guide states the Chief's House opens at Furnace level 6 and does not give a different level
  for any order. The `chiefs-house` facility has `unlockFurnaceLevel` 6 for this reason.
- The six first orders have an `img`, a PNG in `images/chief-orders/`. The icons are cropped from
  the Chief Order screenshot of the Heaven Guardian guide, at the size of the screenshot. The three
  orders of the Fire Crystal Age have no `img`, because no source shows their icons.
- The cooldowns are lengths of time. The guide does not state a daily reset time, so the package has
  none. Use `chiefOrderReadyAt` with the time the order was used.
- Survivor Time is in the wording of the source. The guide does not say how it relates to real time.
- The Contentment cost of an order can differ from the guide in the game. The package keeps the
  guide values.
