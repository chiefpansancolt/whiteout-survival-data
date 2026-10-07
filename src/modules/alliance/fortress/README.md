# Alliance Fortress

The castle, the 4 strongholds, and the 12 fortresses on the alliance map, with their coordinates and
the reward of each phase.

## Usage

```ts
import { allianceFortress } from "whiteout-survival-data";

// The 4 strongholds with their map coordinates
allianceFortress()
  .ofKind("stronghold")
  .get()
  .map((s) => [s.name, s.x, s.y]);
// [['Stronghold 1', 597, 800], ['Stronghold 2', 400, 597], ...]

// Phase 1 reward of one stronghold
allianceFortress().find("stronghold-1")?.rewards[0]; // { phase: 1, reward: 'Shards' }

// Number of fortresses
allianceFortress().ofKind("fortress").count(); // 12
```

## Query methods

| Method      | Returns                 | Description                                            |
| ----------- | ----------------------- | ------------------------------------------------------ |
| `ofKind(k)` | `AllianceFortressQuery` | Keeps one kind: `castle`, `stronghold`, or `fortress`. |

The shared terminal methods (`get`, `first`, `find`, `findByName`, `search`, `count`) are described
in [How It Works](../../../../README.md#how-it-works).

## Data

The data is in `data/alliance/alliance-fortress.json`. It has 17 entries: 1 castle, 4 strongholds,
and 12 fortresses. An entry has `id`, `name`, `kind`, `x` and `y` (map coordinates), and `rewards`,
a list of `{ phase, reward }`. The castle is at (597, 597).

## Notes

Each stronghold and fortress has 8 rewards, one for each phase. They are transcribed from a
user-provided "Stronghold & Fortress Rewards" rotation image. The rewards of the castle are not
documented, so its `rewards` array is empty.
