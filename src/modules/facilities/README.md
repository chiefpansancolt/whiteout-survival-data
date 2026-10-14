# Facilities

Nine functional buildings that have no levels, power, or build cost. Use it to look up what each hub
does in the game.

## Usage

```ts
import { facilities } from "whiteout-survival-data";

const heroHall = facilities().findByName("Hero Hall");
console.log(heroHall?.description);

const matches = facilities().search("office");
console.log(matches.map((facility) => facility.name)); // [ 'Enlistment Office' ]

console.log(facilities().count()); // 9
```

## Query methods

`facilities()` has no filters of its own. The shared terminal methods (`get`, `first`, `find`,
`findByName`, `search`, `count`) are described in [How It Works](../../../README.md#how-it-works).

## Data

The data is in `data/chief/facilities.json`. Each of the 9 entries has five fields: `id`, `name`,
`img` (icon path), `description` (what the facility does in the game), and `unlockFurnaceLevel`, the
Furnace level at which the facility unlocks. The entries are Hero Hall, Dawn Academy, Beast Cage,
Lighthouse, Arena, Chief's House, Explorer's Cabin, Suggestion Box, and Enlistment Office.

## Notes

These buildings have no upgrade levels, no power, and no build cost. A `Building` entry would leave
`levels`, `power`, and `maxLevelLabel` empty, so facilities use their own minimal shape.

Enlistment Office replaces troops lost in battle from a reserve pool once the Infirmary's injured
troops capacity is exceeded. Accumulated Loyalty gates it, and its capacity is four times the
Infirmary's own.

Every facility has an `unlockFurnaceLevel`:

| Facility          | Furnace level |
| ----------------- | ------------- |
| Suggestion Box    | 2             |
| Hero Hall         | 4             |
| Explorer's Cabin  | 4             |
| Chief's House     | 6             |
| Lighthouse        | 7             |
| Arena             | 8             |
| Enlistment Office | 11            |
| Beast Cage        | 18            |
| Dawn Academy      | 25            |

The package owner gave the Furnace level 2 of the Suggestion Box from the game. The description of
Dawn Academy states its level. The pets module also lists Furnace level 18 for the Beast Cage.
