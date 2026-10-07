# Research

The Research Center tech tree: 290 nodes, one per research line, each with its per-level cost, time,
and bonus. Use it to look up what a research costs, what it requires, and what it gives.

## Usage

```ts
import { research } from "whiteout-survival-data";

const battle = research().byCategory("Battle").byTier(1).get();
console.log(battle.length);

const node = research().findByName("Assaut Techniques I");
console.log(node?.levels[0].cost); // meat, wood, coal, iron, steel
console.log(node?.levels[0].bonus); // [ { stat: 'Troops Lethality', value: '0.50%' } ]

const gates = research().find("molten-blades-ii")?.levels[0].prerequisites;
console.log(gates); // War Academy FC 10 and Indomitable Wall level 1
```

## Query methods

| Method          | Returns         | Description                                        |
| --------------- | --------------- | -------------------------------------------------- |
| `byCategory(c)` | `ResearchQuery` | Nodes in one of the 9 categories                   |
| `byTier(tier)`  | `ResearchQuery` | Nodes at the given tier position in their category |

The shared terminal methods (`get`, `first`, `find`, `findByName`, `search`, `count`) are described
in [How It Works](../../../README.md#how-it-works).

## Data

The data is in `data/chief/research.json`. Each node has `id`, `name`, `img`, `category`, `tier`,
and `levels`. A level has `level`, `prerequisites`, `cost`, `bonus`, `power`, and an optional
`researchTimeSeconds`. The nodes are sourced page by page, like `items()`, because each research
line has its own detail page with its own cost, time, and bonus table.

`category` has 9 values. `tier` is the position of the node inside its category's own tier count.

| Category                               | Nodes   | Tiers |
| -------------------------------------- | ------- | ----- |
| Battle                                 | 102     | 6     |
| Growth                                 | 45      | 7     |
| Economy                                | 44      | 6     |
| T11 Infantry, T11 Marksman, T11 Lancer | 10 each | 7     |
| T12 Infantry, T12 Marksman, T12 Lancer | 23 each | 8     |

`cost` entries are `{ itemId, amount }`, and `itemId` resolves to an entry in `items()`. Research
costs use the same resources as building costs (Meat, Wood, Coal, Iron, Steel). The latest T11 and
T12 tiers also use Fire Crystal Shard and Refined Fire Crystal. Each `itemId` was resolved by
matching the cost icon's source filename to the icon of a cataloged item.

`prerequisites` is a flat list. Each entry has a `type` that says where it resolves.

| Type         | `id`                         | `level`                                           |
| ------------ | ---------------------------- | ------------------------------------------------- |
| `building`   | A `buildings()` id           | Normalized to match `BuildingLevel.label` exactly |
| `research`   | The id of another node       | A level of that node                              |
| `unreleased` | A best-effort slugified name | A tech line with no published wiki page yet       |

A `building` entry such as `Research Center 7` or `War Academy FC 10` round-trips into
`buildings().find(id)!.levels`. An `unreleased` entry does not resolve against `research()` by
design, so the gap stays visible instead of being dropped or pointed at the wrong node. No node uses
it now. The 12 Molten X II nodes (`Molten Blades II` and eleven others across the three T12 troop
lines) needed it until their pages went live. The wiki uses a Unicode Roman numeral in their URL
slug (`molten-blades-Ⅱ`), while this package's ids use ASCII `-ii`.

## Notes

### Corrected wiki spellings

Several prerequisite names resolve only after fixing spelling errors on the source wiki. The package
corrects them with an explicit alias list built by checking every node name in the manifest. It does
not use fuzzy matching.

| Wiki spelling               | Node name             |
| --------------------------- | --------------------- |
| `Assault Techniques`        | `Assaut Techniques`   |
| `Bulwark Formation`         | `Bulwark Formations`  |
| `Coal Minning`              | `Coal Mining`         |
| `Ion Mining`, `Iorn Mining` | `Iron Mining`         |
| `Marskman Armor`            | `Marksman Armor`      |
| `Helios Marksmen`           | `Helios Marksman`     |
| `Survival Expansion`        | `Survival Techniques` |

### Missing research time

`researchTimeSeconds` is optional. Some source pages have no Time value for some levels. This
affects 20 nodes: `bulwark-formations-iv`, `picket-lines-iv`, and 18 Exalted nodes (for example
`exalted-blunderbuss`).

### Bonus array

`bonus` is an array because a level can grant more than one stat. Most levels grant one stat. 9
nodes have levels with two stats, for example `helios-infantry-training`.

### Exalted capstones

`exalted-infantry`, `exalted-marksman`, and `exalted-lancer` do not exist on the wiki yet. They were
added from in-game knowledge, not scraped. Each is a capstone that unlocks once all 5 of its T12
troop type's tier 1 Exalted items reach level 5. Each has one level and 8,000,000 power. The cost
and bonus are empty arrays because no data is known, and no value was guessed. `img` is `""` because
no icon exists to reference.

### Added and scraped prerequisites

Each troop type's 4 tier 2 Molten X I items also require that troop type's Exalted capstone at level
1, next to their War Academy building gate. This comes from in-game knowledge. The wiki's
Prerequisites column omits it for these 12 nodes.

Each troop type's 4 tier 4 Molten X II items (`Molten Blades II` and so on) require that troop
type's tier 3 node (`indomitable-wall`, `starfire`, or `meridian-phalanx`) at level 1. This was
scraped from each node's own page.

Each troop type's 4 tier 6 Molten X III items require that troop type's Solar Supremacy node at
level 15. This was also scraped.
