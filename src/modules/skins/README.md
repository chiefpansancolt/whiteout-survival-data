# Skins

The 191 cosmetic skins of the game: avatar frames, nameplates, and march, city, and teleport skins.
Use it to look up a skin, its source, and the stat bonus it grants.

## Usage

```ts
import { skins } from "whiteout-survival-data";

// All avatar frames
const frames = skins().bySkinType("Avatar Frame").get();

// A skin with a stat bonus
const frame = skins().find("abundance-scent");
console.log(frame?.bonus);
// { stat: 'Troops Defense', statKey: 'troops-defense', value: '+2%', amount: 2, unit: 'percent' }

// Skins that grant no stat bonus
const plain = skins()
  .get()
  .filter((s) => s.bonus === undefined);
```

## Query methods

| Method             | Returns     | Description                                      |
| ------------------ | ----------- | ------------------------------------------------ |
| `bySkinType(type)` | `SkinQuery` | Skins of one type. See the type list under Data. |

The shared terminal methods `get`, `first`, `find`, `findByName`, `search`, and `count` are
described in [How It Works](../../../README.md#how-it-works).

## Data

Skins are in `data/chief/skins.json`. Each entry has `id`, `name`, an optional `img`, `skinType`,
`description`, an optional `bonus`, and a list of `sources`. As in the Items module, `id` is a URL
slug.

| Skin type     | Skins |
| ------------- | ----- |
| Avatar Frame  | 77    |
| March Skin    | 53    |
| City Skin     | 41    |
| Nameplate     | 20    |
| Name Card     | 12    |
| Teleport Skin | 6     |
| Chat          | 4     |
| Chief Profile | 2     |

`bonus` is a `{ stat, value }` pair, for example `Troops Defense` and `+2%`. It is set on 176 of the
215 skins. It is `undefined` when a skin grants no stat bonus. The `value` is a string.

## Notes

The 24 skins added most recently have no `img`, because no icon exists for them yet. The skins
`tundra-adventure` and `wing-of-the-icy-wind` keep their ids and icons. Their names are
`Tundra Adventurer` and `Wings of the Icy Wind`.

This module is the cosmetic half of the item catalog described in the [Items](../items/README.md)
module.

Every description follows one pattern, `Grants the [X <Skin Type>] (<duration>).` The duration is
too inconsistent to model as a field. It can be `Permanent`, `30 day`, or a breakdown by rank such
as `Permanent/7 days/3 days` with its own list of conditions. The duration stays in the free-text
`description`.

`bonus` is read only from a clean `Bonus: <stat> +<value>` line. A few City Skins, such as Frost
Sphere VI, have a long "Domain Bonus" text for an area effect on nearby allies. That text does not
reduce to one stat and value, so it stays in `description` only.
