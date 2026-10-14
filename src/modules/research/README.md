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

The data is in `data/chief/research.json`. Each node has `id`, `name`, `img`, `category`, `queue`,
`tier`, and `levels`. A level has `level`, `prerequisites`, `cost`, `bonus`, `power`, and an
optional `researchTimeSeconds`.

`category` has 9 values. `queue` is `main` for Growth, Economy, and Battle, and `warAcademy` for the
six T11 and T12 categories, because the game researches the two groups in separate queues. `tier` is
the position of the node inside its category's own tier count. `researchTree()` gives the position
of each node in a tree.

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
| `unreleased` | A best-effort slugified name | A tech line that is not published yet             |

A `building` entry such as `Research Center 7` or `War Academy FC 10` round-trips into
`buildings().find(id)!.levels`. An `unreleased` entry does not resolve against `research()` by
design, so the gap stays visible instead of being dropped or pointed at the wrong node. No node uses
it now. The 12 Molten X II nodes (`Molten Blades II` and eleven others across the three T12 troop
lines) needed it until they were published.

## Notes

### Corrected spellings

Several prerequisite names resolve only after fixing spelling errors. The package corrects them with
an explicit alias list built by checking every node name in the manifest. It does not use fuzzy
matching.

| Misspelled name             | Node name             |
| --------------------------- | --------------------- |
| `Assault Techniques`        | `Assaut Techniques`   |
| `Bulwark Formation`         | `Bulwark Formations`  |
| `Coal Minning`              | `Coal Mining`         |
| `Ion Mining`, `Iorn Mining` | `Iron Mining`         |
| `Marskman Armor`            | `Marksman Armor`      |
| `Helios Marksmen`           | `Helios Marksman`     |
| `Survival Expansion`        | `Survival Techniques` |

### Corrected stat of one level

All 50 levels of `molten-plating-ii` use `Infantry Health`, as the rest of the Infantry Molten II
lines do for their own troop type.

### Research time

`researchTimeSeconds` is optional, and every level in the data has one. The 15 lines with five
levels (for example `exalted-blunderbuss`) upgrade instantly, as the package owner states, so all 75
levels have `researchTimeSeconds` 0. The three Exalted capstones, `exalted-infantry`,
`exalted-lancer`, and `exalted-marksman`, are placeholders that unlock once the five lines of the
troop type are complete. They take no time, so their level has `researchTimeSeconds` 0 too.

Level 1 of `bulwark-formations-iv` and `picket-lines-iv` has the time 32,000 seconds, which is
`08:53:20`. It fits the other levels: 32,000, 41,600, 64,000, 96,000, and 240,480 seconds.

### Bonus array

`bonus` is an array because a level can grant more than one stat. Most levels grant one stat. 9
nodes have levels with two stats, for example `helios-infantry-training`.

A bonus has `stat`, `statKey`, `value`, `amount`, `unit`, and `totalAmount`. `value` is the text of
the bonus, such as `"1.25%"`, `"600"`, or `"1,000"`. `amount` and `unit` are the parsed form: a `%`
gives `percent` and a plain number gives `flat`, with the commas removed. `amount` is the bonus that
the level adds, not the bonus so far. `totalAmount` is the bonus up to this level: the sum of the
`amount` of the same stat over the levels of the node up to this level. So `1.25`, `1.25`, and `1.5`
have the totals `1.25`, `2.5`, and `4`.

The T12 nodes are the exception for `value`. For T12 nodes, `value` is the bonus up to the level,
not the bonus of the level. `exalted-shoulderguard` has `3.00%`, `6.00%`, `9.00%`, `12.00%`, and
`15.00%`, so its `amount` is 3 on every level and its `totalAmount` is 3, 6, 9, 12, and 15, the
value. A Molten II line has 50 levels of 1, and a total of 50 at level 50. All 63 T12 bonuses with
several levels have one constant gain, which fits this reading. The package owner confirmed that the
T12 values are totals. The rule for `amount` and `totalAmount` is the same for every node, so a page
can add up `amount` for any node. The three bonuses of the `Other` stat hold unlock text such as
`Unlock XI Helios Infantry`. They have no `statKey`, `amount`, `unit`, or `totalAmount`.

`statKey` is the stat name in lowercase kebab-case, for example `"Infantry Attack"` gives
`infantry-attack`. It is the same key in `research()`, `skins()`, `experts()`, `vip()`, and
`allianceTech()`, so a page can add up bonuses from different modules. Two of the names are written
in the singular, so these map to the plural key:

| Stat name       | `statKey`          |
| --------------- | ------------------ |
| `Troop Attack`  | `troops-attack`    |
| `Troop Defense` | `troops-defense`   |
| `Other`         | none (unlock text) |

The 4 modules hold 58 stat names with a key and 56 keys. Alliance Tech adds 10 more, such as
`alliance-banner-cap`. The mapping was made from the list of names, not by matching similar names.

### Exalted capstones

`exalted-infantry`, `exalted-marksman`, and `exalted-lancer` were added from in-game knowledge. Each
is a capstone that unlocks once all 5 of its T12 troop type's tier 1 Exalted items reach level 5.
Each has one level and 8,000,000 power. The cost and bonus are empty arrays because no data is
known, and no value was guessed. `img` is `""` because no icon exists to reference.

### Added prerequisites

Each troop type's 4 tier 2 Molten X I items also require that troop type's Exalted capstone at level
1, next to their War Academy building gate. This comes from in-game knowledge.

The package gives Infirmary Capacity at all three levels of Ward Expansion III, as level 1 does, at
the request of the package owner.

Tool Enhancement I also requires Tooling Up I at level 1, next to Ward Expansion I and Camp
Expansion I. It was added at the request of the package owner, so that Tooling Up I is linked in the
tree.

Each troop type's 4 tier 4 Molten X II items (`Molten Blades II` and so on) require that troop
type's tier 3 node (`indomitable-wall`, `starfire`, or `meridian-phalanx`) at level 1.

Each troop type's 4 tier 6 Molten X III items require that troop type's Solar Supremacy node at
level 15.
