# Alliance Facility

The 8 map-based Alliance Facility types, with the bonus and the map locations of each level.

## Usage

```ts
import { allianceFacility } from "whiteout-survival-data";

// Bonus stat and levels of one facility
const defense = allianceFacility().find("defense");
defense?.bonusStat; // 'Troop Defense Boost'
defense?.levels.map((l) => [l.level, l.boosterPercent, l.available]); // [[2, 5, 8], [4, 8, 3]]

// Map coordinates of the level 1 construction facilities
allianceFacility().find("construction")?.levels[0].locations; // [{ x: 1068, y: 138 }, ...]

// Facilities whose name contains a word
allianceFacility().search("ing").length;
```

## Query methods

This module has no filters of its own. Use the shared terminal methods (`get`, `first`, `find`,
`findByName`, `search`, `count`), which are described in
[How It Works](../../../../README.md#how-it-works).

## Data

The data is in `data/alliance/alliance-facility.json`. It has 8 entries: construction, defense,
expedition, gathering, production, tech, training, and weapons. An entry has `id`, `name`,
`bonusStat`, and `levels`. A level has `level`, `boosterPercent`, `heavilyInjuredPercent`,
`lossesPercent` (the three percentages listed for the level in the in-game map info), `ownLimit`
(the most facilities of that level one alliance can own, always 1), `available` (facilities of that
level on the map, equal to `locations.length`), and `locations`, a list of `{ x, y }` map
coordinates. The 8 facilities have 12 levels in all.

## Notes

The wiki page `https://www.whiteoutsurvival.wiki/alliance-facility/facility/` has no structured
data. It has no facility types and no table, only prose about capture rules: a 30-minute capture, 3
days of control, stacking rules, and a limit of 12 facilities.

The facility types, per-level bonuses, and coordinates come from a user-provided screenshot of the
in-game map info. The screenshot documents only some levels of each facility. For example, `defense`
has Levels 2 and 4, and `gathering` has only Level 1. The missing levels are gaps. They are not
guessed.
