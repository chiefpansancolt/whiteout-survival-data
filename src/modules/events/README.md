# Events

Game events with frequency, duration, requirements, rewards, and tips. Use it to look up how an
event works and what it gives.

## Usage

```ts
import { eventRankingTables, events } from "whiteout-survival-data";

// Alliance events
events().byCategory("alliance").count(); // 12

// Frequency and duration of one event
const bear = events().find("bear-hunt");
bear?.duration; // '30 minutes'

// The same as a rule that an app can use: repeat every 47.5 hours, a run of 30 minutes
bear?.schedule;
// { repeat: { kind: 'every', every: 47.5, unit: 'hours' }, runs: [{ length: 30, unit: 'minutes' }] }

// Read a nested list: the 20 waves of Crazy Joe
events().findByName("Crazy Joe")?.waves?.length; // 20

// Events with a related event buff row
events()
  .get()
  .filter((e) => e.eventBuffId !== undefined)
  .map((e) => e.id);

// Every ranking table of an event in one shape
const tables = eventRankingTables(events().find("king-of-icefield")!);
tables.map((t) => `${t.id} ${t.scope}`);
// ['personal-1 personal', 'personal-2 personal', 'personal-3 personal', 'personal-4 personal']
```

## Query methods

| Method          | Returns       | Description                                                               |
| --------------- | ------------- | ------------------------------------------------------------------------- |
| `byCategory(c)` | `EventsQuery` | Keeps events of one category: `solo`, `alliance`, `rookie`, or `holiday`. |

The shared terminal methods (`get`, `first`, `find`, `findByName`, `search`, `count`) are described
in [How It Works](../../../README.md#how-it-works).

`eventRankingTables(event)` returns every ranking table of one event in one shape, so a page does
not read three fields. Each table has an `id`, the `rankings`, and a `scope` that is `personal` or
`alliance` when the event states it. The order is the `personalRankings` tables (`personal-1` and
on, with `basedOn`), the `allianceRankings` table (`alliance`), the `allianceRankingUpdates` lists
(`alliance-update-1` and on, with the `name` of the update), and the tiers that hold rankings
(`tier-1` and on, with the `name` of the tier). A tier table has a `scope` only when its name says
`personal` or `alliance`. The star rating tiers of Alliance Showdown and the winner tier of SvS have
none. The array is empty for an event with no ranking.

## Data

The data is in `data/events/`, one JSON file per event. There are 65 events: 12 alliance, 36 solo,
12 rookie, and 5 holiday. Every event has `id`, `name`, `img`, `category`, and `description`. All
other fields are optional.

`eventBuffId` links an event to its `eventBuff()` row. It equals the event `id` for ten events.
Sunfire Castle links to the row `castle-battle`.

The event fields that hold more than text:

| Field                                                     | Holds                                                                                                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tiers`                                                   | Ranking tiers from lowest to highest. A tier can have `scoreTotal`, tier-wide `rewards`, and per-placement `rankings` (star change and rewards). |
| `damageRewards`                                           | Personal damage ranges that a player gains on every run, each with `minDamage`, an optional `maxDamage`, and `rewards`. Bear Hunt only.          |
| `allianceRankings`, `allianceRankingUpdates`              | Alliance rewards by placement. The updates are later reward lists, in the order the game replaced them.                                          |
| `personalRankings`                                        | Personal rewards by placement, one table for each thing a placement is based on.                                                                 |
| `pointLevels`                                             | Reward levels that need both personal and alliance points.                                                                                       |
| `days`, `waves`, `zones`                                  | Per-day scoring and milestones, attack waves, and zones with their open days.                                                                    |
| `missions`, `missionPointsLabel`                          | Missions with base points. The label names the points when they are a currency.                                                                  |
| `versions`                                                | The missions and tiers of an event that differ by the age of the state, each with a `name` and an optional `note`.                               |
| `shop`, `shops`, `shopCurrencyItemId`, `shopCurrencyName` | Shop offers with cost and limit, and the currency.                                                                                               |
| `refreshes`, `heroByGeneration`                           | Refresh costs with quality chances, and the hero shard of each generation.                                                                       |
| `resultShape`                                             | The form of result the event takes, set on the 61 events that are not Core events. See below.                                                    |
| `scoreUnit`                                               | What `scoreTotal` counts, on the six events whose targets are not points.                                                                        |

A scoring action can have an `itemId` when its text names one item that is in `items()`: Fire
Crystal, Refined Fire Crystal, Fire Crystal Shard, Mithril, Gems, Book of Knowledge, the two Wild
Marks, and the Hero Gear Essence Stone (`essence-stones`). Some actions name a kind of item and not
one item. They are linked as follows, and the choices come from the package owner, who knows the
game:

- **Hero Shards (45 rows).** "Use 1 Rare Hero Shard", "Epic", and "Mythic", also "to ascend Heroes",
  have the `itemId` of the general shard of that rarity: `rare-general-hero-shard`,
  `epic-general-hero-shard`, or `mythic-general-hero-shard`. The shards of single heroes are not
  linked.
- **Recruitments (4 rows).** "Use Epic Recruitment 1 time" has the `itemId` `platinum-key`, and "Use
  Advanced Recruitment 1 time" has `gold-key`.
- **Expert Sigils (4 rows).** "Use any 1 Expert Sigil (excluding Common Sigils)" has `itemIds`, a
  list of the 10 named sigils. The Common Expert Sigil is not in it.
- **Speedup minutes (65 rows).** "Use 1m of Speedups for Construction", for Research, for Training
  or Promotion, and to Learn Expert Skills have `itemIds`, a list of the speedups of that type from
  `items()`: construction, research, troop, or learning. The general speedups are not in the lists,
  because the wording names the type. The "Gems Speedups excluded" note is about speedups bought
  with Gems, which are not items.

An action has an `itemId` or `itemIds`, never both. The 13 "Use 1 Widget of any Hero Exclusive Gear"
rows have no link, because `items()` has no widget items.

`scoreUnit` is `flights` for Journey of Light, `spins` for Lucky Wheel, `reapers` for Hero's
Mission, `Labyrinth Cores` for The Labyrinth, `recycle tokens` for Tundra Album, and
`Fortune Tokens` for Mia Fortune. The other events count points, and have no `scoreUnit`.

`resultShape` has five values, derived from the data of each event in this order:

| Value           | Rule                                                                   | Events |
| --------------- | ---------------------------------------------------------------------- | ------ |
| `waves`         | The event has `waves`.                                                 | 1      |
| `tier`          | A tier holds `rankings`.                                               | 5      |
| `ranking`       | The event has `personalRankings` or `allianceRankings`.                | 21     |
| `milestones`    | A tier has `scoreTotal`, or the event has `pointLevels` or `missions`. | 16     |
| `participation` | None of the above. The data has no score or rank.                      | 18     |

The four Core events have no `resultShape`. Six events are `milestones` only because they list
missions: Alliance Mobilization, Beast Whisperer, Flame and Fang, Symphony of Change, Vision of
Dawn, and Wild Brawl. Check these six if a different form fits better. A `resultShape` is data, and
an edit in the event file changes it.

## Schedule

`frequency` and `duration` are free text. `schedule` is the same information as a rule, for a
calendar. It is set on 50 of the 65 events. It has two optional parts.

| Field    | Meaning                                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `repeat` | `kind` is `none`, `every`, or `weekly`. `every` has `every` (a number) and `unit` (`hours`, `days`, `weeks`, or `months`). `weekly` has `weekdays`.    |
| `runs`   | The runs of one cycle. A run has `length`, `unit` (`minutes`, `hours`, or `days`), and optional `label`, `startWeekday`, and `startTimeUtc` (`HH:MM`). |

The shape is the one that a tracker app needs to suggest a repeat rule and a run length next to the
text of the game. An event with two runs in a cycle has two entries in `runs`: Hall of Chief has
`Season 1` for 6 days and `Season 2` for 7 days. Crazy Joe has a run on Tuesday and one on Thursday.
Frostfire Mine has a run of 30 minutes for each of its seven time slots. Times are in UTC. The
schedule has no dates, because the game does not publish them.

The text of `frequency` and `duration` is not changed. The `schedule` is read from that text, and
only where it is clear:

- A repeat rule is set when the text gives an interval: "Weekly", "Every two weeks", "Once a month",
  and "Yearly" (12 months). Bear Hunt is every 47.5 hours, the time that an alliance waits to summon
  the bear again. "Once only" is `kind: 'none'`.
- A run is set when the text gives a length, such as "2 days" or "30 minutes". A weekday or a time
  is added when the text gives one, such as "Monday 00:00 UTC".
- The time slots of Frostfire Mine are hours of the day in UTC, so the repeat is every day. The text
  does not say "daily".
- Alliance Mobilization is set to once a month, as the text says, although it runs twice a month
  until about 13 weeks of state age.

Seven events have a repeat rule or a run that the text of `frequency` and `duration` does not give.
Foundry Battle is every two weeks for 60 minutes. SvS is every four weeks. Canyon Clash is every
month. Armament Competition and Officer Project are every two weeks, and Officer Project is "usually
two days". Mercenary Prestige is every month. Hero Rally is 14 days.

Fifteen events have no schedule, because their text gives no usable one: Deadshot, Develop New Tech
and its second version, Dreamscape Memory, Frostdragon Tyrant, Frosty Fortune, Home Beyond, Return
to Tundra, Silver Shell Events, Stand of Arms, The Labyrinth, Trial Event, Tundra Album, Tundra
Games, and Tundra Star. Some events have a repeat rule and no run, or the other way around, when the
text has only one of the two.

The package owner states that SvS takes one week, with preparation from Monday to Friday and the
battle on Saturday. The runs follow the owner: Preparation for 5 days from Monday, and a Battle of
12 hours from Saturday 10:00 UTC. The 2 days of matchmaking and the 2 days of recovery are not runs,
because the owner does not count them in the week. The repeat stays every four weeks.

The package owner states the Canyon Clash schedule: voting on Monday and Tuesday, registration on
Wednesday and Thursday, matchmaking on Friday, and the battle on Saturday. The runs follow it. No
time in UTC is given.

Tundra Arms League has 18 days and no phases.

## Expert extra tiers

Three expert skills add reward tiers to the milestone list of an event: Baldur's Blazing Sunrise to
Alliance Mobilization, Baldur's Dawn Hymn to Alliance Showdown, and Valeria's Well Prepared to the
preparation phase of State of Power. Each skill adds up to three extra tiers. The `expertTiers` list
of these three events has one entry for each extra tier.

| Field              | Meaning                                                                              |
| ------------------ | ------------------------------------------------------------------------------------ |
| `expertId`         | The id of the expert, as in `experts()`                                              |
| `skill`            | The name of the skill of the expert                                                  |
| `tier`             | The extra tier, 1 to 3                                                               |
| `unlockSkillLevel` | The skill level at which the tier appears: 1 for tier 1, 6 for tier 2, 10 for tier 3 |
| `thresholds`       | Optional. The points the tier needs, with the `days` that the value is for           |
| `rewards`          | The rewards of the tier: the bundle of the skill at the level that unlocks the tier  |

The skill levels come from the `Extra Tier` progression of the skill in `experts()`, which adds 1
tier at level 1, 2 at level 6, and 3 at level 10. The extra tiers come after the normal milestone
tiers of the event.

The rewards of a tier are the bundle that the skill lists at the level that unlocks the tier. They
come from the `milestoneRewards` of the skill in `experts()`: the bundle at level 1 is tier 1, the
bundle at level 6 is tier 2, and the bundle at level 10 is tier 3. The skill text of Valeria says
"+3 bonus tier(s)". For Baldur, the link rests on the levels and on the skill text. The item names
are linked to `items()`. The packs of secured resources and the 5m Training Speedup are named as the
other events name them: Dawn Hymn tier 1 gives 20 `100K Meat (Secured)`, with the `itemId` `meat`
and the pack count as the `amount`.

The points that an extra tier needs are not published. The only value is the threshold of Dawn Hymn
tier 1, 200,000 points on days 1 to 4 of Alliance Showdown, from the package owner, who read it in
the game. It is above the highest normal milestone of those days, 125,000. Every other threshold is
left out until it is known.

## Notes

Rewards that exist only as images are added from user-provided screenshots where they can be read.
Other image-only rewards are not loaded, and rewards with no name are recorded as unidentified
items. The categories of the solo events can be corrected.

Alliance events:

- Alliance Championship has all 6 tiers, with rewards for each of its 4 placement groups.
- Bear Hunt has 69 achievement tiers in `tiers`, which a player gains one time. `damageRewards` has
  the 27 personal damage ranges, which a player gains on every run. A range has `minDamage`, a
  `maxDamage` that the last range does not have, and `rewards`. Each range starts where the range
  before it ends. The source does not say whether the boundary value belongs to the lower or the
  higher range.
- Canyon Clash uses `tiers` for personal merit ranges, with rewards per legion rank, and
  `allianceRankings` for alliance rewards.
- Frostdragon Tyrant has `personalRankings` (one table for each basis, such as capital occupation
  time and personal points) and uses `tiers` for its personal points milestones.
- SVS - State of Power has `days` for its 5 preparation stages and the battle phase (scoring
  actions, personal and alliance point milestones). `tiers` holds the ranking and winner reward .
- Sunfire Castle has `personalRankings` (Gems, Charm Design, and Charm Guide for 22 rank groups) and
  `tiers` for its 7 personal points milestones. The values are those of one server.
- Mercenary Prestige has `tiers` for its four difficulty tiers (Easy to Insane as rankings) and
  `allianceRankings` for the Captain rewards. The rankings of Champion's and Epic Initiation also
  carry `levels`: 50 enemy levels with tier, power, bonus, troops per type, total troops, and stage
  rewards. They are read by OCR. Two rows look like typos, Champion's Nightmare level 50 and Epic
  Nightmare level 13. They are kept as printed with a `note`.
- Alliance Showdown has `days` (the actions that score points each day, and the personal point
  milestones with rewards for that day) and `tiers` by star rating for the star and ranking rewards.
- Alliance Mobilization has `missions` (name, group, and base points) The 120% and 200% exclusive
  columns and the gem purchase missions are left out. The five `tiers` are the tiers of the event,
  and only the Elite tier has rewards in the data. It has 25 `milestones` with the personal reward
  and 25 `allianceMilestones` with the alliance reward, both by the alliance points of the tier, and
  `personalRankings` and `allianceRankings` with the rewards of rank 1 to 5 and rank 6 to 10. The
  amounts come from the package owner. A tier has the milestone and ranking lists in the same shape
  as a day of Alliance Showdown and as the rankings of the event. `eventRankingTables()` returns the
  two ranking lists of the tier as `tier-4-personal` and `tier-4-alliance`.
- Tundra Arms League uses `allianceRankings`, `personalRankings` (legion ranking and legion result),
  and `tiers` by Personal Arsenal Points, with Winner and Defeat rankings for the Elimination and
  Championship phases. The rewards come from in-game screenshots.
- Crazy Joe keeps its first alliance reward list in `allianceRankings` and a later list for the same
  10 ranks in `allianceRankingUpdates`, from in-game screenshots taken after a server update. Its
  `personalRankings` has 21 rank groups, from 1 to 501-1000. Its `pointLevels` lists the 30 defense
  point levels. Each level needs both personal points (blue coin) and alliance points (gold coin)
  and has one reward. `waves` holds the target, rule, and details of its 20 waves. `tiers` holds its
  21 difficulties with the Alliance Defense Points needed to unlock each.

Solo events:

- Armament Competition and Officer Project each have ranking rewards. `days` holds one entry for
  each version (Chief Gear and Chief Charm, or Troops and Heroes) with the points to score and the
  four target point levels with their rewards. The points needed for each level are loaded only for
  the Officer Project Troops version, so `scoreTotal` is omitted on the other levels.
- Fishing Tournament lists its five daily mission rewards in `tiers`, by Fishing Points. Its
  leaderboard rewards (9 rank bands) have no amounts, and some items are not linked, because they
  are read from a low-resolution image. Refine them when the event returns.
- Frostfire Mine has its six gathering reward levels in `tiers` (by Orichalcum yield; the last items
  of each row are cut off in the image) and its ranking rewards in `personalRankings`.
- Icefire Warhymn League has its 7 season ranking groups and its State rewards in
  `personalRankings`, its 16 League Shop offers in `shop` (cost and limit in Warhymn Testaments),
  and its League Missions in `missions`, with `missionPointsLabel` naming the Testaments. Each
  mission has 7 levels that give the same rewards. In `levelRequirements`, the login mission needs 1
  more day for each level. Each other mission needs its level 1 amount again for each level, so
  level N is N times level 1. `rewards` holds the other items each level gives. The phases carry the
  UTC schedule, and the tips list which buffs apply.
- King of Icefield has the scoring list of each of its 7 days in `days` and four ranking tables in
  `personalRankings`. The tables hold only the first rows because the images are cropped.
- The Labyrinth has its 6 zones with their open days in `zones`, its 14 Labyrinth Core milestone
  rewards in `tiers`, and its Glowstone shop in `shop`, with `shopCurrencyItemId` naming the shop
  currency.
- Treasure Hunter has its 4 daily pickaxe missions in `missions`, its 21 total search milestones in
  `tiers`, its common and supreme Ultimate Treasure options in `personalRankings`, and the Treasure
  Preview rewards in `rewards`.
- Tundra Trade Route has its 6 truck refreshes with their gem cost and quality chances in
  `refreshes`. The truck rewards are random and are not listed.
- Tundra Trading Station has its 19 shop offers in `shop` (priced in Trade Vouchers) and the Trade
  Voucher value of each exchange in `tiers`.
- Brothers in Arms has its troop-level point table, four target levels, and top 100 ranking rewards.
- Hero's Mission lists the hero whose shards it gives for generations 4 to 15 in `heroByGeneration`.
- Hall of Chief has 13 stage scoring lists for its two seasons. Its ranking lists show only the
  first ranks, and the season hero shard rewards of the total ranking have no amount. Hall of Heroes
  has the shop of each hero generation, 1 to 9, in `shops`. Mia Fortune has orb costs and
  milestones.
- Crystal Reactivation has chest shops by Fire Crystal age. Chest and bundle offers hold their
  rewards in `contents`.
- Tundra Adventure has tile chances, item tile levels, point targets, and the Odyssey of Adventure
  board. Silver Shell Events, Tundra Album, and Shining City Pack do not load their shops and packs.
- State Merger has its Pioneering Praises missions with their rewards, the nine "A New Beginning"
  alliance monument missions, and the five chests.

Rookie events: City Development, Plan Your City, Trusted Chief, Power Up, War Preparation, Grow Your
Heroes, Develop New Tech (two versions), Trial Event, and Home Beyond. Each target event has its
four or five target levels and the top 100 ranking. The target point amounts are loaded where a
screenshot shows them. Beast Whisperer has 75 daily missions. Working Overtime is also a rookie
event.

Holiday events: Frosty Fortune, Vision of Dawn, Romance Season, Dreamscape Memory, and Vault of
Enigma.

Vision of Dawn has two `versions`, Before Fire Crystal age and Fire Crystal age. Each one holds the
missions with their Hope points and rewards, and the five Hope chests in `tiers`. The Fire Crystal
age version has the Hope points of each chest in `scoreTotal` (10, 30, 50, 80, and 110). The Before
Fire Crystal age version does not have them yet. The missions of the Fire Crystal age version give
54 Hope points a day. The Lv.2 Custom Resource Chest of the Epic Recruitment 30 mission is read from
the icon of the screen.
