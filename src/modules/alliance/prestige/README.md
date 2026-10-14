# Alliance Prestige Buildings

The prestige buildings that an alliance can build in its territory after it does well in an event,
with the bonus that each one gives. Use it to see which event gives each building and what it
grants.

## Usage

```ts
import { alliancePrestige, events } from "whiteout-survival-data";

const statue = alliancePrestige().find("championship-statue");
console.log(statue?.source); // { event: 'Alliance Championship', eventId: 'alliance-championship', requirement: 'Reach Silver III' }

// The bonus of one tier of the Championship Statue. It applies to all four resources.
const ultimate = statue?.levels.find((level) => level.name === "Ultimate");
console.log(ultimate?.bonuses.map((b) => `${b.stat} ${b.value}`));
// [ 'Resource Gathering Speed +10%' ]

// The event that gives a building, when the package has it
const horn = alliancePrestige().find("battle-horn");
console.log(horn?.source?.eventId && events().find(horn.source.eventId)?.name); // 'Alliance Showdown'

console.log(alliancePrestige().count()); // 6
```

## Query methods

This module has no filters of its own. Use the shared terminal methods (`get`, `first`, `find`,
`findByName`, `search`, `count`), which are described in
[How It Works](../../../../README.md#how-it-works).

## Data

The data is in `data/alliance/alliance-prestige.json`. It has 6 entries: Championship Statue,
Guardian, Foundry Rewards, Battle Horn, Weapons Master, and Siege Herald. An entry has `id`, `name`,
`source`, and `levels`.

- `source` has `event` (the name of the event), `requirement` (what the alliance must reach), and
  `eventId` (the id of the event in `events()`, left out when the package has no data for the
  event).
- `levels` is a list of 4 tiers. A tier has `name` and `bonuses`, a list of
  `{ stat, statKey, value, amount, unit }`. Each tier has one bonus, `Resource Gathering Speed`,
  which applies to all four resources (meat, wood, coal, and iron).

| Building            | Event                 | Requirement              |
| ------------------- | --------------------- | ------------------------ |
| Championship Statue | Alliance Championship | Reach Silver III         |
| Guardian            | Alliance Mobilization | Reach Senior Tier        |
| Foundry Rewards     | Foundry Battle        | S-rated                  |
| Battle Horn         | Alliance Showdown     | 5-Star                   |
| Weapons Master      | Tundra Arms League    | Advance to Championships |
| Siege Herald        | Winter Siege          | Reach Pioneer Tier       |

The bonus of a tier is +3%, +5%, +7%, and +10%, in the order of the tiers.

## Notes

The Championship Statue gives its bonus to the members in the territory of the alliance. Its tiers
are Silver, Gold, Diamond, and Ultimate, and the alliance unlocks it when it reaches Silver III in
the Alliance Championship.

The event and the requirement of every building other than the Championship Statue are the
statements of the package owner. The package owner also states that every prestige building has four
tiers with the same percent as the Championship Statue, and gives a gathering speed for all four
resources. The tiers of the other five buildings are named `Tier 1` to `Tier 4`, because the names
of their tiers are not known. The package has no Winter Siege event, so Siege Herald has no
`eventId`.

The cost to build a prestige building is not in the data.
