# Collection Reward Levels

The collection levels of the game: what each level gives, and the medallion that you hold at each
level. A medallion gives buffs to your troops. Use it to show what a level gives, which medallion a
level reaches, and the buffs that the medallion adds to the buffs calculator.

The collection has 51 levels and 11 medallions. A medallion lasts 5 levels. The first level of each
medallion gives the medallion and no reward, and the other levels give rewards.

## Usage

```ts
import {
  collectionMedallionAt,
  collectionMedallions,
  collectionRewardLevels,
  items,
} from "whiteout-survival-data";

// The medallion that you hold at level 23, and its buffs
const medallion = collectionMedallionAt(23);
console.log(medallion?.name); // 'Gold Medallion I'
console.log(medallion?.buffs.map((b) => `${b.stat} ${b.value}`));
// [ "Troops' Attack +4.0%", "Troops' Defense +2.0%", "Troops' Lethality +2.0%", "Troops' Health +2.0%" ]

// The rewards of a level
const level = collectionRewardLevels().find((l) => l.level === 7);
console.log(level?.rewards.map((r) => `${r.amount} ${items().find(r.itemId)?.name}`));
// [ '200 Skin Token', '2000 Gems', '2 Mythic General Hero Shard', '10 Lucky Hero Gear Chest' ]

console.log(collectionMedallions().count(), collectionRewardLevels().length); // 11 51
```

## Functions

| Function                                | Returns                            | Description                                                                   |
| --------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------- |
| `collectionMedallions(source?)`         | `CollectionMedallionQuery`         | The medallions, from the lowest. `source` defaults to the data of the package |
| `collectionRewardLevels(source?)`       | `CollectionRewardLevel[]`          | The 51 levels with what each gives, from level 1                              |
| `collectionMedallionAt(level, source?)` | `CollectionMedallion \| undefined` | The medallion that you hold at a level. It gives `undefined` below level 1    |
| `COLLECTION_MAX_LEVEL`                  | `51`                               | The highest collection level                                                  |

The shared terminal methods (`get`, `first`, `find`, `findByName`, `search`, `count`) of the
medallions are described in [How It Works](../../../README.md#how-it-works).

## Data

The medallions are in `data/collection-medallions.json`. A medallion has these fields.

| Field         | Meaning                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------- |
| `id`          | The id, such as `gold-medallion-1`                                                              |
| `name`        | The name as the game words it, such as `Gold Medallion I`                                       |
| `img`         | The picture of the medallion, in `images/collection-medallions/`                                |
| `unlockLevel` | The first collection level that gives the medallion                                             |
| `buffs`       | A list of `{ stat, statKey, value, amount, unit }`. The amounts are the totals at the medallion |

A medallion lists all its buffs, not only the new ones. The buffs of a medallion are the total that
you have when you hold it, so the buffs of the medallions before it do not add on top.

The levels are in `data/collection-reward-levels.json`. A level has `level`, `medallionId`, and
`rewards`, a list of `{ itemId, amount }` with an id from `items()`.

| Medallion           | Levels   | Buffs                                                                                      | Rewards of each level                                                             |
| ------------------- | -------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Bronze Medallion I  | 1 to 5   | Troops' Attack +2.0%                                                                       | 100 Skin Token, 1,000 Gems, 2 Mythic General Hero Shard, 10 Lucky Hero Gear Chest |
| Bronze Medallion II | 6 to 10  | Troops' Attack +2.0%, Troops' Defense +2.0%                                                | 200 Skin Token, 2,000 Gems, 2 Mythic General Hero Shard, 10 Lucky Hero Gear Chest |
| Silver Medallion I  | 11 to 15 | Troops' Attack +2.0%, Troops' Defense +2.0%, Troops' Lethality +2.0%                       | 300 Skin Token, 3,000 Gems, 2 Mythic General Hero Shard, 10 Lucky Hero Gear Chest |
| Silver Medallion II | 16 to 20 | Troops' Attack +2.0%, Troops' Defense +2.0%, Troops' Lethality +2.0%, Troops' Health +2.0% | 300 Skin Token, 3,000 Gems, 2 Mythic General Hero Shard, 10 Lucky Hero Gear Chest |
| Gold Medallion I    | 21 to 25 | Troops' Attack +4.0%, Troops' Defense +2.0%, Troops' Lethality +2.0%, Troops' Health +2.0% | 300 Skin Token, 3,000 Gems, 2 Mythic General Hero Shard, 10 Lucky Hero Gear Chest |
| Gold Medallion II   | 26 to 30 | Troops' Attack +4.0%, Troops' Defense +4.0%, Troops' Lethality +2.0%, Troops' Health +2.0% | 300 Skin Token, 3,000 Gems, 2 Mythic General Hero Shard, 10 Lucky Hero Gear Chest |
| Gold Medallion III  | 31 to 35 | Troops' Attack +4.0%, Troops' Defense +4.0%, Troops' Lethality +4.0%, Troops' Health +2.0% | 300 Skin Token, 3,000 Gems, 2 Mythic General Hero Shard, 10 Lucky Hero Gear Chest |
| Light Medallion I   | 36 to 40 | Troops' Attack +4.0%, Troops' Defense +4.0%, Troops' Lethality +4.0%, Troops' Health +4.0% | 300 Skin Token, 3,000 Gems, 2 Mythic General Hero Shard, 10 Lucky Hero Gear Chest |
| Light Medallion II  | 41 to 45 | Troops' Attack +6.0%, Troops' Defense +4.0%, Troops' Lethality +4.0%, Troops' Health +4.0% | 300 Skin Token, 3,000 Gems, 2 Mythic General Hero Shard, 10 Lucky Hero Gear Chest |
| Light Medallion III | 46 to 50 | Troops' Attack +6.0%, Troops' Defense +6.0%, Troops' Lethality +4.0%, Troops' Health +4.0% | 300 Skin Token, 3,000 Gems, 2 Mythic General Hero Shard, 10 Lucky Hero Gear Chest |
| Light Medallion IV  | 51       | Troops' Attack +6.0%, Troops' Defense +6.0%, Troops' Lethality +6.0%, Troops' Health +4.0% | None                                                                              |

## Notes

The rewards of the levels are the log of the package owner, and the buffs and the pictures are read
from the Medallion Details screens of the game. The log gives no reward for level 1 and for the
first level of each other medallion. These levels are in the data with an empty list of rewards.

The Collection is a source of the [buffs calculator](../calculators/docs/buffs.md). You give your
collection level in `collectionLevel`, and the buffs of your medallion count.
