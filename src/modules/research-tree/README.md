# Research Tree

The layout of the Research tech tree: the seven tabs, the position of every node, and the links
between them. Use it to draw the tree without writing a graph layout. The module gives positions and
shapes. A page draws the icons, names, and lines.

## Usage

```ts
import { research, RESEARCH_TREE_LAYOUT, researchTree } from "whiteout-survival-data";

const tabs = researchTree();
console.log(tabs.map((tab) => `${tab.name}: ${tab.nodes.length} nodes`));
// ['Battle: 102 nodes', 'Growth: 45 nodes', 'Economy: 44 nodes', 'War Academy Troops: 31 nodes', ...]

// A node of a tab: its centre, and the node to read from research()
const tab = tabs.find((t) => t.id === "t12-infantry")!;
const capstone = tab.nodes.find((n) => n.id === "exalted-infantry");
console.log(capstone?.x, capstone?.y, research().find("exalted-infantry")?.name);

// The links of a tab, with the shape of each line
console.log(tab.edges[0]); // { from: 'exalted-trek', to: 'exalted-armament', shape: 'horizontal' }

console.log(RESEARCH_TREE_LAYOUT.nodeWidth); // 76
```

## Functions

| Function                | Returns             | Description                                                               |
| ----------------------- | ------------------- | ------------------------------------------------------------------------- |
| `researchTree(source?)` | `ResearchTreeTab[]` | The seven tabs. `source` defaults to all nodes from `research()`          |
| `RESEARCH_TREE_LAYOUT`  | object              | The sizes the layout uses, in pixels, so a page can draw at the same size |

## Data

`researchTree()` returns one entry for each tab.

| Field        | Meaning                                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| `id`, `name` | The tab, such as `t12-infantry` and `T12 Infantry`                                                       |
| `categories` | The `research()` categories that the tab shows                                                           |
| `width`      | Width of the tab in pixels, with the padding                                                             |
| `height`     | Height of the tab in pixels, with the padding                                                            |
| `nodes`      | Each node has `id`, `kind` (`research` or `hub`), `x`, `y`, and `labelAbove`                             |
| `edges`      | Each link has `from`, `to`, `shape` (`vertical`, `horizontal`, or `up`), and an optional `splitFraction` |

`x` and `y` are the centre of the node icon. The label sits below the icon, or above it when
`labelAbove` is set. The top left of every tab is at the padding, so no node has a negative
position. A node of kind `research` is a node of `research()`. The one node of kind `hub` has the id
`fire-crystal-shard`, an item of `items()`.

The sizes are in `RESEARCH_TREE_LAYOUT`: `rankGap` 150, `laneGap` 96, `nodeWidth` 76, `nodeHeight`
52, `labelHeight` 42, and `padding` 20.

| Tab                  | `categories`                           | Layout                                          |
| -------------------- | -------------------------------------- | ----------------------------------------------- |
| `battle`             | Battle                                 | Downward, in ranks                              |
| `growth`             | Growth                                 | Downward, in ranks                              |
| `economy`            | Economy                                | Downward, in ranks                              |
| `war-academy-troops` | T11 Infantry, T11 Lancer, T11 Marksman | Three branches around one hub                   |
| `t12-infantry`       | T12 Infantry                           | A chain, a capstone, a stack, and a side branch |
| `t12-marksman`       | T12 Marksman                           | The same as `t12-infantry`                      |
| `t12-lancer`         | T12 Lancer                             | The same as `t12-infantry`                      |

## Notes

A link is a prerequisite between two nodes of the same tab: a node needs a level of another node. A
link comes from the `research` entries in the `prerequisites` of every level, once for each pair.
Building prerequisites give no link. A level that needs the level before it of the same node gives
no link, because that is not a link between two nodes.

Battle, Growth, and Economy use a rank layout. A node is one rank below its deepest prerequisite,
and the ranks are `rankGap` apart. Inside a rank the nodes are `laneGap` apart and are ordered four
times by the average position of their neighbours, to keep the lines short.

The War Academy tab puts the Fire Crystal Shard hub at the top left. The T11 Infantry branch runs to
the right of the hub, the T11 Lancer branch runs down, and the T11 Marksman branch runs up with its
labels above the icons. Each branch starts at its tier 1 node. A link from the hub to that node has
the shape of the branch.

The T12 tabs lay out the five tier 1 nodes as a chain, put the Exalted capstone below the chain, and
stack tiers 2 to 6 below it, each tier in a row one rank down. Tiers 7 and 8 branch to the right of
the tier 3 node. The chain and the branches use the `horizontal` shape, and the stack uses the
`vertical` shape. The link from tier 3 to tier 7 has a `splitFraction` of 0.85, so that its line
splits late, and the link to tier 8 has 0.5.

The layout was moved from the Research tree sample page, and the positions are the same.
