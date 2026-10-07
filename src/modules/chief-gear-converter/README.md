# Chief Gear Converter

The exchange rates of the Chief Gear material converter. Use it to turn one gear material into
another, for example Design Plans into Hardened Alloy.

## Usage

```ts
import { chiefGearConverter } from "whiteout-survival-data";

// Every way to spend Design Plans
const fromDesignPlans = chiefGearConverter().byFromItem("design-plans").get();

// Every way to get Hardened Alloy
const toHardenedAlloy = chiefGearConverter().byToItem("hardened-alloy").get();

// One rate: 10 Design Plans give 1 Lunar Amber, up to 500 times per week
const rate = chiefGearConverter().find("design-plans-to-lunar-amber");
console.log(rate?.fromQuantity, rate?.toQuantity, rate?.weeklyLimit);
```

## Query methods

| Method               | Returns         | Description                       |
| -------------------- | --------------- | --------------------------------- |
| `byFromItem(itemId)` | converter query | Conversions that consume the item |
| `byToItem(itemId)`   | converter query | Conversions that produce the item |

The terminal methods `get`, `first`, `find`, `findByName`, `search`, and `count` are described in
[How It Works](../../../README.md#how-it-works).

## Data

The module holds 7 conversions from `data/converters/chief-gear.json`. Each one has `fromItemId` and
`fromQuantity`, `toItemId` and `toQuantity`, and `weeklyLimit`. Both item ids are ids from
`items()`.

## Notes

`weeklyLimit` is the maximum number of times that an exchange can be used in one week. The Chief
Charm converter does not have this field. See
[Chief Charm Converter](../chief-charm-converter/README.md).
