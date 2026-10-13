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

| Facility          | Furnace level | Source                                                 |
| ----------------- | ------------- | ------------------------------------------------------ |
| Suggestion Box    | 2             | The package owner, from the game                       |
| Hero Hall         | 4             | WhiteOutData                                           |
| Explorer's Cabin  | 4             | WhiteOutData                                           |
| Chief's House     | 6             | WhiteOutData and the Heaven Guardian Chief Order guide |
| Lighthouse        | 7             | WhiteOutData                                           |
| Arena             | 8             | WhiteOutData                                           |
| Enlistment Office | 11            | WhiteOutData                                           |
| Beast Cage        | 18            | WhiteOutData. The pets list Furnace 18 as well         |
| Dawn Academy      | 25            | Its own description                                    |

WhiteOutData states each level in a sentence such as "When Furnace is upgraded to level 7, it
unlocks Shelter 6, Lighthouse, Infantry Camp, and Barricade." The Whiteout Survival Wiki has no
table for them. The WoS Tools Furnace table agrees on Hero Hall, which it lists among the buildings
that you need before Furnace 5. An older guide gave Hero Hall and Explorer's Cabin as Furnace 6,
which no other source states. No page states the level of the Suggestion Box, so its Furnace level 2
is the statement of the package owner.
