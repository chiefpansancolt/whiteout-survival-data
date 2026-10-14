# Daily Missions

The in-game Daily Missions: the task of each mission, the activeness and the resources that it
gives, and the reward levels of the activity bar at the top of the screen. Use it to show what a
mission asks for and what it gives, and to add up the activeness of a day.

Every mission has level 1. Level 2 is in for Recruit Hero(es), Claim Online Reward(s), Dispatch
Pets, Arena Challenge, the three Train missions, and the four Gather missions of one resource. Take
part in Alliance Help, Make Alliance Contribution(s), Carry out Intel Mission(s), Defeat Polar
Terror, and Gather have levels 2 and 3. The other levels of the missions are added later. A level
changes the task and what it gives.

## Usage

```ts
import {
  dailyMissionActiveness,
  dailyMissionActivenessThrough,
  dailyMissionRewardLevels,
  dailyMissions,
  items,
} from "whiteout-survival-data";

const training = dailyMissions().find("train-infantry");
console.log(training?.name); // 'Train 10 Infantry'

// The first level of a mission: the target and the rewards. The activeness is the first reward.
const level = training?.levels[0];
console.log(level?.target, level && dailyMissionActiveness(level)); // 10 10
console.log(level?.rewards.map((r) => `${r.amount} ${items().find(r.itemId)?.name}`));
// [ '10 Activeness', '4000 Meat', '4000 Wood' ]

// The levels add up: Alliance Help done at level 2 gives level 1 and level 2
const help = dailyMissions().find("alliance-help");
console.log(help && dailyMissionActivenessThrough(help, 2)); // 15

// The reward levels of the activity bar
console.log(dailyMissionRewardLevels().map((l) => l.activeness)); // [ 40, 80, 120, 160, 215, 270, 325 ]

console.log(dailyMissions().count()); // 21
```

## Functions

| Function                                        | Returns                     | Description                                                               |
| ----------------------------------------------- | --------------------------- | ------------------------------------------------------------------------- |
| `dailyMissions(source?)`                        | `DailyMissionQuery`         | The missions. `source` defaults to the data of the package                |
| `dailyMissionRewardLevels(source?)`             | `DailyMissionRewardLevel[]` | The reward levels of the activity bar, from the lowest activeness         |
| `dailyMissionActiveness(level)`                 | `number`                    | The activeness that a level of a mission gives                            |
| `dailyMissionActivenessThrough(mission, level)` | `number`                    | The activeness of a mission that is done up to a level. The levels add up |
| `DAILY_MISSION_ACTIVENESS_ITEM_ID`              | `'activeness'`              | The id of the activeness item                                             |

The shared terminal methods (`get`, `first`, `find`, `findByName`, `search`, `count`) are described
in [How It Works](../../../README.md#how-it-works).

## Data

The missions are in `data/daily-missions.json`. A mission has `id`, `name`, and `levels`. The `name`
is the task of level 1 as the game words it, such as `Take part in Alliance Help 1 time(s)`. A level
has these fields.

| Field     | Meaning                                                                                         |
| --------- | ----------------------------------------------------------------------------------------------- |
| `level`   | The level of the mission, from 1                                                                |
| `task`    | The task as the game words it, without the progress                                             |
| `target`  | The amount to reach, such as 10 for `Train 10 Infantry`                                         |
| `rewards` | A list of `{ itemId, amount }`, where `itemId` is an id from `items()`. The activeness is first |

The activeness is a reward: the item `activeness`, which is in `items()`. The total activeness of a
day decides which reward levels of the activity bar you get. The reward levels are in
`data/daily-mission-reward-levels.json`. A reward level has `activeness`, the activeness that it
needs, and its `rewards`.

| Mission                                                     | Target | Activeness | Other rewards                  |
| ----------------------------------------------------------- | ------ | ---------- | ------------------------------ |
| Take part in Alliance Help 1 time(s)                        | 1      | 5          | 4,000 Meat                     |
| Make 5 Alliance Contribution(s)                             | 5      | 5          | 4,000 Wood                     |
| Recruit 1 Hero(es)                                          | 1      | 10         | 800 Coal, 200 Iron             |
| Train 10 Infantry                                           | 10     | 10         | 4,000 Meat, 4,000 Wood         |
| Train 10 Lancers                                            | 10     | 10         | 4,000 Meat, 4,000 Wood         |
| Train 10 Marksmen                                           | 10     | 10         | 4,000 Meat, 4,000 Wood         |
| Carry out 1 Intel Mission(s)                                | 1      | 10         | 800 Coal, 200 Iron             |
| Claim 1 Online Reward(s)                                    | 1      | 5          | 800 Coal, 200 Iron             |
| Heal 10 injured soldiers                                    | 10     | 10         | 4,000 Meat, 200 Iron           |
| Gather 50,000 Meat                                          | 50,000 | 5          | 4,000 Meat                     |
| Gather 50,000 Wood                                          | 50,000 | 5          | 4,000 Wood                     |
| Gather 10,000 Coal                                          | 10,000 | 5          | 800 Coal                       |
| Gather 3,000 Iron                                           | 3,000  | 5          | 200 Iron                       |
| Upgrade 1 building(s)                                       | 1      | 30         | 800 Coal, 200 Iron             |
| Research 1 technology(ies)                                  | 1      | 30         | 800 Coal, 200 Iron             |
| Gather 1 time(s)                                            | 1      | 5          | 4,000 Meat, 4,000 Wood         |
| Defeat Polar Terror 1 time(s)                               | 1      | 10         | 800 Coal                       |
| Fight in 1 Arena Challenge(s)                               | 1      | 10         | 4,000 Wood, 200 Iron           |
| Complete 1 challenges in The Labyrinth                      | 1      | 15         | 800 Coal, 200 Iron             |
| Dispatch Pets to hunt for treasure 1 times in Pet Adventure | 1      | 5          | 4,000 Meat, 4,000 Wood         |
| Log in                                                      | 1      | 10         | 4,000 Meat, 800 Coal, 200 Iron |

Level 2 of the other missions:

| Mission                                                     | Level 2 task                                                | Target | Activeness | Other rewards          |
| ----------------------------------------------------------- | ----------------------------------------------------------- | ------ | ---------- | ---------------------- |
| Make 5 Alliance Contribution(s)                             | Make 20 Alliance Contribution(s)                            | 20     | 10         | 4,000 Wood             |
| Recruit 1 Hero(es)                                          | Recruit 3 Hero(es)                                          | 3      | 15         | 800 Coal, 200 Iron     |
| Claim 1 Online Reward(s)                                    | Claim 5 Online Reward(s)                                    | 5      | 10         | 800 Coal, 200 Iron     |
| Dispatch Pets to hunt for treasure 1 times in Pet Adventure | Dispatch Pets to hunt for treasure 4 times in Pet Adventure | 4      | 10         | 4,000 Meat, 4,000 Wood |
| Train 10 Infantry                                           | Train 30 Infantry                                           | 30     | 10         | 4,000 Meat, 4,000 Wood |
| Train 10 Lancers                                            | Train 30 Lancers                                            | 30     | 10         | 4,000 Meat, 4,000 Wood |
| Train 10 Marksmen                                           | Train 30 Marksmen                                           | 30     | 10         | 4,000 Meat, 4,000 Wood |
| Gather 50,000 Meat                                          | Gather 250,000 Meat                                         | 250000 | 5          | 4,000 Meat             |
| Gather 50,000 Wood                                          | Gather 250,000 Wood                                         | 250000 | 5          | 4,000 Wood             |
| Gather 10,000 Coal                                          | Gather 50,000 Coal                                          | 50000  | 5          | 800 Coal               |
| Gather 3,000 Iron                                           | Gather 15,000 Iron                                          | 15000  | 5          | 200 Iron               |
| Fight in 1 Arena Challenge(s)                               | Fight in 4 Arena Challenge(s)                               | 4      | 25         | 4,000 Wood, 200 Iron   |

Levels 2 and 3 of Gather are `Gather 2 time(s)` and `Gather 4 time(s)`, with targets of 2 and 4.
They give 5 and 15 Activeness, and both give 4,000 Meat and 4,000 Wood.

Level 3 of Make Alliance Contribution(s) is `Make 40 Alliance Contribution(s)`: a target of 40, and
15 Activeness and 4,000 Wood as rewards.

Levels 2 and 3 of Carry out Intel Mission(s) are `Carry out 5 Intel Mission(s)` and
`Carry out 10 Intel Mission(s)`, with targets of 5 and 10. They give 15 and 30 Activeness, and both
give 800 Coal and 200 Iron.

Levels 2 and 3 of Defeat Polar Terror are `Defeat Polar Terror 2 time(s)` and
`Defeat Polar Terror 3 time(s)`, with targets of 2 and 3. All 3 levels give the same rewards: 10
Activeness and 800 Coal.

The levels of a mission add up. A mission that is done at level 2 gives the activeness of level 1
and of level 2, so Take part in Alliance Help gives 5 + 10 = 15 Activeness at level 2.

Levels 2 and 3 of Take part in Alliance Help are `Take part in Alliance Help 10 time(s)` and
`Take part in Alliance Help 20 time(s)`, with targets of 10 and 20. They give 10 and 15 Activeness,
and both give 4,000 Meat. Done at level 3, the mission gives 5 + 10 + 15 = 30 Activeness.

The missions of level 1 give 210 activeness in all. The reward levels of the activity bar need 40,
80, 120, 160, 215, 270, and 325 activeness.

### Reward levels

| Activeness | Rewards                                                                                                                                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 40         | 175 Gems, 2 5m Troop Healing Speedup, 10 Alliance XP, 10 Authority                                                                                                                                          |
| 80         | 13 5m Construction Speedup, 13 5m Research Speedup, 2 5m Troop Healing Speedup, 20 Alliance XP, 10 Authority                                                                                                |
| 120        | 660 10k Meat, 13 5m Troop Training Speedup, 2 5m Troop Healing Speedup, 30 Alliance XP, 10 Authority                                                                                                        |
| 160        | 15,000 Hero XP, 660 10k Wood, 3 5m Troop Healing Speedup, 40 Alliance XP, 10 Authority                                                                                                                      |
| 215        | 1 Platinum Key, 1,320 1k Coal, 3 5m Troop Healing Speedup, 60 Alliance XP, 10 Authority                                                                                                                     |
| 270        | 5 Fire Crystal, 3 Mythic Exploration Skill Manual, 330 1k Iron, 5 5m Troop Healing Speedup, 80 Alliance XP, 10 Authority, 100 Activity Triumph Points                                                       |
| 325        | 1 Mythic General Scene Fragment Pack, 30 Skin Token, 5 Fire Crystal, 80 Mystery Badge, 3 Mythic Expedition Skill Manual, 8 5m Troop Healing Speedup, 115 Authority, 500 Activity Triumph Points, 1 Gold key |

The names are the item names of `items()`. The resource packs, such as 10k Meat, are items with an
amount of packs, as the game shows them.

## Notes

The missions, the targets, the activeness, and the rewards are read from the Daily Missions screens
of the game. The rewards of the reward levels are the statements of the package owner. The icon of a
resource reward is matched to the item: the dark rock is Coal and the light rock is Iron. The icon
of the activeness item is the gold star coin of the activity bar.

The wording of the tasks is the wording of the game, including "time(s)" and "Hero(es)". The
`Log in` mission is done when you log in.

The [Dailies](../dailies/README.md) module has a routine of daily steps. They are habits and not
missions, so the missions are in this module only.

These parts are not in the data yet:

- The other levels of the missions. Level 2 is known for 16 of the 21 missions, and level 3 for 5.
- The daily reset time of the missions.
