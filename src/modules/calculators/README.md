# Calculators

The calculators turn the package data into answers. Each one takes a plan, such as the levels you
have and the levels you want, and returns the resources, time, power, or event points that the plan
needs. Every number comes from the package data, so a data fix changes a result without a code
change.

```ts
import { calculatePets } from "whiteout-survival-data";

calculatePets([{ id: "cave-hyena", current: 1, goal: 25 }]).resources;
// [{ itemId: 'pet-food', amount: 7145 }, { itemId: 'taming-manual', amount: 45 }]
```

## Shared conventions

A calculator is a plain function. It takes a goal object and returns a result object. It keeps no
state, so the same input always gives the same result.

Goals use `{ id, current, goal }` or a `from` and `to` pair. The `id` is the id of an entry in the
matching module, such as `pets()` or `buildings()`. The result counts the steps after `current` up
to and including `goal`.

An unknown id throws `Error`. A level out of range, or a goal below the current value, throws
`RangeError`. The document of each calculator lists its own errors.

Event points come from the scoring rows of `events()`. The calculators read the point value of a row
at run time and do not copy it into code. Resources in a result are `{ itemId, amount }` pairs, and
the `itemId` is an id from `items()`.

A calculator exports the constants that an app needs to show the same choices and limits, such as
`PET_ADVANCEMENT_INTERVAL`, `EXPERT_MAX_LEVEL`, and `TROOP_CALCULATOR`. The document of each
calculator names its constants.

## Calculators

| Calculator                    | Document                                       | What it calculates                                                       |
| ----------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------ |
| `calculateSvs()`              | [svs](docs/svs.md)                             | State of Power points for each day and phase, with Valeria's bonus.      |
| `calculateAllianceShowdown()` | [alliance-showdown](docs/alliance-showdown.md) | Alliance Showdown personal points for each day, with Baldur's bonus.     |
| `calculateKingOfIcefield()`   | [king-of-icefield](docs/king-of-icefield.md)   | King of Icefield points for each day.                                    |
| `calculateHallOfChief()`      | [hall-of-chief](docs/hall-of-chief.md)         | Hall of Chief points for each stage.                                     |
| `calculateChiefGear()`        | [chief-gear](docs/chief-gear.md)               | Materials, gear score, power, and event points to upgrade Chief Gear.    |
| `calculateChiefCharm()`       | [chief-charm](docs/chief-charm.md)             | Materials, charm score, power, and event points to upgrade Chief Charms. |
| `calculateTroops()`           | [troops](docs/troops.md)                       | Troops trained or promoted by each camp, with resources and time.        |
| `calculateResearch()`         | [research](docs/research.md)                   | Resources, time, and power to upgrade research lines to a goal level.    |
| `calculatePets()`             | [pets](docs/pets.md)                           | Pet food, advancement items, and stat gains to level pets.               |
| `calculateExperts()`          | [experts](docs/experts.md)                     | Books of Knowledge and expert sigils to level experts and their skills.  |
| `calculateBuildings()`        | [buildings](docs/buildings.md)                 | Resources, build time, power, and event points to upgrade buildings.     |
| `calculateHeroGear()`         | [hero-gear](docs/hero-gear.md)                 | Resources, power, stats, and event points to level one hero gear piece.  |
| `calculateHeroUpgrade()`      | [hero-upgrade](docs/hero-upgrade.md)           | Shards, skill manuals, and widgets to upgrade one hero.                  |
