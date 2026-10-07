# whiteout-survival-data

<div align="center">
  <h3>A comprehensive, fully-typed dataset for Whiteout Survival</h3>
  <p>Structured JSON data, image assets, and a chainable query builder API for heroes, buildings, research, pets, and more.</p>

![GitHub Release](https://img.shields.io/github/v/release/chiefpansancolt/whiteout-survival-data?style=flat-square)

</div>

> ⚠️ **Work in progress.** This package has not had a first release yet. Data is still being
> gathered, cross-checked, and corrected, so some fields are placeholders, some values may be wrong,
> and the API surface can still change without notice. Treat everything here as unstable until the
> first tagged release.

---

## Installation

```bash
npm install whiteout-survival-data
# or
pnpm add whiteout-survival-data
```

---

## Quick Start

Every module exports a **factory function** that returns a chainable query builder.

```ts
import { buildings } from "whiteout-survival-data";

const furnace = buildings().findByName("Furnace");
furnace.levels.find((l) => l.label === "FC 10");
```

---

## How It Works

All standard modules follow the same **query builder pattern** built on a shared `QueryBase<T>`
class:

```ts
factory() // Start with all data
  .filterMethod() // Chain filters (returns new query)
  .sortMethod() // Chain sorts (returns new query)
  .terminalMethod(); // Get results
```

### Terminal Methods

Every query builder provides these 6 terminal methods:

| Method              | Returns          | Description                           |
| ------------------- | ---------------- | ------------------------------------- |
| `.get()`            | `T[]`            | All results as an array               |
| `.first()`          | `T \| undefined` | First result                          |
| `.find(id)`         | `T \| undefined` | Find by exact ID                      |
| `.findByName(name)` | `T \| undefined` | Find by name (case-insensitive)       |
| `.search(query)`    | `T[]`            | Partial name match (case-insensitive) |
| `.count()`          | `number`         | Number of results                     |

---

## Modules

Each module has its own README with usage examples, the query methods, the shape of the data, and
notes on where the data came from. The counts below are the number of entries each factory returns.

### Buildings and city

| Factory        | Entries | Description                                                                 | Details                                         |
| -------------- | ------- | --------------------------------------------------------------------------- | ----------------------------------------------- |
| `buildings()`  | 27      | Every building with its per-level cost, build time, power, and requirements | [README](src/modules/buildings/README.md)       |
| `facilities()` | 9       | Buildings that have no upgrade levels                                       | [README](src/modules/facilities/README.md)      |
| `lumberCamp()` | 10      | Daybreak Island Lumber Camp upgrade table                                   | [README](src/modules/daybreak-island/README.md) |
| `treeOfLife()` | 10      | Daybreak Island Tree of Life upgrade table                                  | [README](src/modules/daybreak-island/README.md) |
| `decoration()` | 103     | Daybreak Island decorations                                                 | [README](src/modules/daybreak-island/README.md) |

### Heroes and experts

| Factory                    | Entries | Description                                                           | Details                                                   |
| -------------------------- | ------- | --------------------------------------------------------------------- | --------------------------------------------------------- |
| `heroes()`                 | 65      | Heroes with stats, skills, shard costs, levels, and exclusive weapons | [README](src/modules/heroes/README.md)                    |
| `heroWidgets()`            | 10      | Widgets that each exclusive weapon level costs                        | [README](src/modules/hero-widgets/README.md)              |
| `heroGearEnhancement()`    | 100     | Hero gear enhancement levels 1 to 100                                 | [README](src/modules/hero-gear-enhancement/README.md)     |
| `heroGearEmpowerment()`    | 100     | Hero gear empowerment levels 1 to 100                                 | [README](src/modules/hero-gear-empowerment/README.md)     |
| `heroGearMasteryForging()` | 84      | Hero gear mastery forging rows                                        | [README](src/modules/hero-gear-mastery-forging/README.md) |
| `heroGearStats()`          | 12      | Hero gear stats per slot, troop type, and level                       | [README](src/modules/hero-gear-stats/README.md)           |
| `experts()`                | 10      | Dawn Academy experts with skills, talents, and affinity levels        | [README](src/modules/experts/README.md)                   |
| `expertRelationships()`    | 11      | Expert relationship statuses by affinity level                        | [README](src/modules/experts/README.md)                   |
| `pets()`                   | 14      | Beast Cage pets with skills and level tables                          | [README](src/modules/pets/README.md)                      |

### Gear, troops, and research

| Factory                 | Entries | Description                             | Details                                               |
| ----------------------- | ------- | --------------------------------------- | ----------------------------------------------------- |
| `chiefGearSlots()`      | 6       | Chief Gear equip slots                  | [README](src/modules/chief-gear/README.md)            |
| `chiefGear()`           | 150     | Chief Gear upgrade table                | [README](src/modules/chief-gear/README.md)            |
| `chiefCharmSlots()`     | 3       | Chief Charm slots by troop type         | [README](src/modules/chief-charm/README.md)           |
| `chiefCharm()`          | 75      | Chief Charm upgrade table               | [README](src/modules/chief-charm/README.md)           |
| `chiefGearConverter()`  | 7       | Chief Gear material exchange rates      | [README](src/modules/chief-gear-converter/README.md)  |
| `chiefCharmConverter()` | 4       | Chief Charm material exchange rates     | [README](src/modules/chief-charm-converter/README.md) |
| `troops()`              | 3       | Troop tiers with cost and training time | [README](src/modules/troops/README.md)                |
| `research()`            | 290     | Research Center tech tree               | [README](src/modules/research/README.md)              |

### Alliance

| Factory              | Entries | Description                           | Details                                            |
| -------------------- | ------- | ------------------------------------- | -------------------------------------------------- |
| `allianceBanner()`   | 37      | Alliance territory banner build costs | [README](src/modules/alliance/territory/README.md) |
| `allianceTech()`     | 59      | Alliance technology tree              | [README](src/modules/alliance/tech/README.md)      |
| `allianceFacility()` | 8       | Map-based alliance facilities         | [README](src/modules/alliance/facility/README.md)  |
| `allianceFortress()` | 17      | Castle, strongholds, and fortresses   | [README](src/modules/alliance/fortress/README.md)  |

### Events, items, and account

| Factory       | Entries | Description                                 | Details                                    |
| ------------- | ------- | ------------------------------------------- | ------------------------------------------ |
| `events()`    | 65      | Game events with scoring, rewards, and tips | [README](src/modules/events/README.md)     |
| `eventBuff()` | 14      | Buff sources that apply in each game mode   | [README](src/modules/event-buff/README.md) |
| `items()`     | 273     | Item catalog with icons and sources         | [README](src/modules/items/README.md)      |
| `skins()`     | 191     | Cosmetic skins                              | [README](src/modules/skins/README.md)      |
| `vip()`       | 12      | VIP 1 to 12 progression                     | [README](src/modules/vip/README.md)        |

## Calculators

The calculators are plain functions built on the modules above. Each takes a goal object and returns
the resources, time, power, and event points for the plan. The
[calculators overview](src/modules/calculators/README.md) explains the shared conventions, and each
calculator has its own guide.

| Function                      | What it calculates                                                 | Details                                                    |
| ----------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| `calculateSvs()`              | State of Power score by day, phase, and event                      | [Guide](src/modules/calculators/docs/svs.md)               |
| `calculateAllianceShowdown()` | Alliance Showdown score, with the Dawn Hymn bonus                  | [Guide](src/modules/calculators/docs/alliance-showdown.md) |
| `calculateKingOfIcefield()`   | King of Icefield score                                             | [Guide](src/modules/calculators/docs/king-of-icefield.md)  |
| `calculateHallOfChief()`      | Hall of Chief score                                                | [Guide](src/modules/calculators/docs/hall-of-chief.md)     |
| `calculateChiefGear()`        | Materials, score, power, and event points for Chief Gear upgrades  | [Guide](src/modules/calculators/docs/chief-gear.md)        |
| `calculateChiefCharm()`       | Materials, score, power, and event points for Chief Charm upgrades | [Guide](src/modules/calculators/docs/chief-charm.md)       |
| `calculateTroops()`           | Troops, resources, and time for training and promotion             | [Guide](src/modules/calculators/docs/troops.md)            |
| `calculateResearch()`         | Resources, time, and power for research goals                      | [Guide](src/modules/calculators/docs/research.md)          |
| `calculatePets()`             | Pet food, items, stat gains, and event points for leveling pets    | [Guide](src/modules/calculators/docs/pets.md)              |
| `calculateExperts()`          | Books of Knowledge, sigils, EXP, and affinity for experts          | [Guide](src/modules/calculators/docs/experts.md)           |
| `calculateBuildings()`        | Resources, time, power, and event points for building upgrades     | [Guide](src/modules/calculators/docs/buildings.md)         |
| `calculateHeroGear()`         | Resources, power, stats, and event points for one hero gear piece  | [Guide](src/modules/calculators/docs/hero-gear.md)         |
| `calculateHeroUpgrade()`      | Shards, skill manuals, and Widgets for one hero                    | [Guide](src/modules/calculators/docs/hero-upgrade.md)      |

---

## Raw Data Access

JSON data files can be imported directly, without importing the JS/TS package:

```ts
import buildings from "whiteout-survival-data/data/chief/buildings.json";
```

---

## Change Log

Check out the [Change Log](CHANGELOG.md) for new breaking changes, features, and bug fixes per
release of a new version.

---

## Contributing

Bug Reports, Feature Requests, and Pull Requests are welcome on GitHub at
[https://github.com/chiefpansancolt/whiteout-survival-data](https://github.com/chiefpansancolt/whiteout-survival-data).
This project is intended to be a safe, welcoming space for collaboration, and contributors are
expected to adhere to the [Contributor Covenant](https://www.contributor-covenant.org/) code of
conduct.

To see more about Contributing check out this [document](.github/CONTRIBUTING.md).

1. Fork Repo and create new branch
2. Once all is changed and committed create a pull request.
3. Ensure all merge conflicts are fixed and CI is passing.

---

## Development

See [CONTRIBUTING.md](.github/CONTRIBUTING.md) for setup instructions and
[DEVELOPMENT.md](.github/DEVELOPMENT.md) for the full guide on adding new modules.

```bash
pnpm install         # Install dependencies
pnpm build           # Build with tsup
pnpm test:coverage   # Run tests with the 100% coverage gate
pnpm lint            # Type-check + ESLint
pnpm format          # Format with Prettier
pnpm sample          # Exercise queries end to end
```

---

## Support the Project

If you find this project helpful, consider supporting its development:

<div align="center">

[![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsor-pink?style=for-the-badge&logo=github)](https://github.com/sponsors/chiefpansancolt)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/chiefpansancolt)
[![Patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://patreon.com/chiefpansancolt)

</div>

---

## License

whiteout-survival-data is available as open source under the terms of the [MIT License](LICENSE).

---

## Disclaimer

This project is not affiliated with, endorsed by, or connected to Whiteout Survival or Century
Games. All game data is sourced from public wiki and community references. Game images and names are
used for reference purposes only.

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/chiefpansancolt">chiefpansancolt</a></p>
</div>
