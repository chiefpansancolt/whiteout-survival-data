# Chief Charm Converter

The exchange rates of the Chief Charm material converter. Use it to turn one charm material into
another, for example Charm Guides into Charm Secrets.

## Usage

```ts
import { chiefCharmConverter } from "whiteout-survival-data";

// Every way to spend Charm Guides
const fromCharmGuide = chiefCharmConverter().byFromItem("charm-guide").get();

// Every way to get Charm Secrets
const toCharmSecrets = chiefCharmConverter().byToItem("charm-secrets").get();

// One rate: 40 Charm Guides give 1 Charm Secrets
const rate = chiefCharmConverter().find("charm-guide-to-charm-secrets");
console.log(rate?.fromQuantity, rate?.toQuantity);
```

## Query methods

| Method               | Returns         | Description                       |
| -------------------- | --------------- | --------------------------------- |
| `byFromItem(itemId)` | converter query | Conversions that consume the item |
| `byToItem(itemId)`   | converter query | Conversions that produce the item |

The terminal methods `get`, `first`, `find`, `findByName`, `search`, and `count` are described in
[How It Works](../../../README.md#how-it-works).

## Data

The module holds 4 conversions from `data/converters/chief-charm.json`. Each one has `fromItemId`
and `fromQuantity`, `toItemId` and `toQuantity`. Both item ids are ids from `items()`.

## Notes

These conversions have no `weeklyLimit`. The Chief Gear converter does have one. See
[Chief Gear Converter](../chief-gear-converter/README.md).
