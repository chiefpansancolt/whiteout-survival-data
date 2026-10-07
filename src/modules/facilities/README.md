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

The data is in `data/chief/facilities.json`. Each of the 9 entries has four fields: `id`, `name`,
`img` (icon path), and `description` (what the facility does in the game). The entries are Hero
Hall, Dawn Academy, Beast Cage, Lighthouse, Arena, Chief's House, Explorer's Cabin, Suggestion Box,
and Enlistment Office.

## Notes

These buildings have no upgrade levels, no power, and no build cost. A `Building` entry would leave
`levels`, `power`, and `maxLevelLabel` empty, so facilities use their own minimal shape.

Enlistment Office replaces troops lost in battle from a reserve pool once the Infirmary's injured
troops capacity is exceeded. Accumulated Loyalty gates it, and its capacity is four times the
Infirmary's own.
