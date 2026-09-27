# whiteout-survival-data

<div align="center">
  <h3>A comprehensive, fully-typed dataset for Whiteout Survival</h3>
  <p>Structured JSON data, image assets, and a chainable query builder API for heroes, buildings, research, pets, and more.</p>

![GitHub Release](https://img.shields.io/github/v/release/chiefpansancolt/whiteout-survival-data?style=flat-square)

</div>

---

## 📦 Installation

```bash
npm install whiteout-survival-data
# or
pnpm add whiteout-survival-data
```

---

## 🚀 Quick Start

Every module exports a **factory function** that returns a chainable query builder.

```ts
import { buildings } from "whiteout-survival-data";

const furnace = buildings().findByName("Furnace");
furnace.levels.find((l) => l.label === "FC 10");
```

---

## ⚙️ How It Works

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

## 📚 Modules

### 🏠 Buildings

| Module    | Factory       | Items | Description                                       |
| --------- | ------------- | ----- | ------------------------------------------------- |
| buildings | `buildings()` | 2     | Buildings with full per-level upgrade progression |

Each `Building` nests its full level-by-level progression under `levels`. Every tracked building
follows the same 80-level shape: standard Levels 1–30, then a 50-entry Fire Crystal extension
(`30-1..30-4`, then `FC 1` through `FC 9` — each with a base row and four sub-levels
`FC N-1..FC N-4` — ending at `FC 10` alone, the max level). Fire Crystal levels add Fire Crystals
(from `FC 1`) and Refined Fire Crystals (from `FC 5-1`) to the cost.

The source wikis show no Prerequisites column for Fire Crystal levels, but each one still requires
the previous Fire Crystal level of that same building to be complete first — `prerequisites` is
derived rather than scraped for this range, self-referencing the building by name:

- A tier's base row (`FC N`) requires the previous tier's last sub-level (`FC (N-1)-4`).
- A tier's first sub-level (`FC N-1`) requires the previous tier's base row (`FC (N-1)`).
- A tier's remaining sub-levels (`FC N-2..4`) each require the one directly before them.
- The pre-FC stage (`30-1..30-4`) chains off the building's own standard Level 30.
- `FC 1-1` is the one exception: since the pre-FC stage has no separate base row, it requires
  standard Level 30 directly instead of a "tier 0" base.

- **Furnace** — the town HQ; caps every other building's max level.
- **Embassy** — stores Alliance reinforcements and gates Alliance assistance; every standard level
  requires the Furnace at the matching level (Levels 1–8 all just require Furnace Lv.8).

---

## 📋 Raw Data Access

JSON data files can be imported directly, without importing the JS/TS package:

```ts
import buildings from "whiteout-survival-data/data/buildings.json";
```

---

## 📈 Change Log

Check out the [Change Log](CHANGELOG.md) for new breaking changes, features, and bug fixes per
release of a new version.

---

## 🤝 Contributing

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

## 🛠️ Development

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

## 💖 Support the Project

If you find this project helpful, consider supporting its development:

<div align="center">

[![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsor-pink?style=for-the-badge&logo=github)](https://github.com/sponsors/chiefpansancolt)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/chiefpansancolt)
[![Patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://patreon.com/chiefpansancolt)

</div>

---

## 📄 License

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
