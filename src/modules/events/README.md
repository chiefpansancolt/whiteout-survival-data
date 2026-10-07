# Events

Game events with frequency, duration, requirements, rewards, and tips. Use it to look up how an
event works and what it gives.

## Usage

```ts
import { events } from "whiteout-survival-data";

// Alliance events
events().byCategory("alliance").count(); // 12

// Frequency and duration of one event
const bear = events().find("bear-hunt");
bear?.duration; // '30 minutes'

// Read a nested list: the 20 waves of Crazy Joe
events().findByName("Crazy Joe")?.waves?.length; // 20

// Events with a related event buff row
events()
  .get()
  .filter((e) => e.eventBuffId !== undefined)
  .map((e) => e.id);
```

## Query methods

| Method          | Returns       | Description                                                                    |
| --------------- | ------------- | ------------------------------------------------------------------------------ |
| `byCategory(c)` | `EventsQuery` | Keeps events of one wiki category: `solo`, `alliance`, `rookie`, or `holiday`. |

The shared terminal methods (`get`, `first`, `find`, `findByName`, `search`, `count`) are described
in [How It Works](../../../README.md#how-it-works).

## Data

The data is in `data/events/`, one JSON file per event. There are 65 events: 12 alliance, 36 solo,
12 rookie, and 5 holiday. Every event has `id`, `name`, `img`, `category`, and `description`. All
other fields are optional and are left out when the wiki does not state them.

`eventBuffId` links an event to its `eventBuff()` row. It equals the event `id` for ten events.
Sunfire Castle links to the row `castle-battle`.

The event fields that hold more than text:

| Field                                                     | Holds                                                                                                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tiers`                                                   | Ranking tiers from lowest to highest. A tier can have `scoreTotal`, tier-wide `rewards`, and per-placement `rankings` (star change and rewards). |
| `allianceRankings`, `allianceRankingUpdates`              | Alliance rewards by placement. The updates are later reward lists, in the order the game replaced them.                                          |
| `personalRankings`                                        | Personal rewards by placement, one table for each thing a placement is based on.                                                                 |
| `pointLevels`                                             | Reward levels that need both personal and alliance points.                                                                                       |
| `days`, `waves`, `zones`                                  | Per-day scoring and milestones, attack waves, and zones with their open days.                                                                    |
| `missions`, `missionPointsLabel`                          | Missions with base points. The label names the points when they are a currency.                                                                  |
| `shop`, `shops`, `shopCurrencyItemId`, `shopCurrencyName` | Shop offers with cost and limit, and the currency.                                                                                               |
| `refreshes`, `heroByGeneration`                           | Refresh costs with quality chances, and the hero shard of each generation.                                                                       |

## Notes

The source is `https://www.whiteoutsurvival.wiki/events/`. Event pages are prose and screenshots
with no tables. Each event text is transcribed from its page. Rewards that exist only as images are
added from user-provided screenshots where they can be read. Rewards the wiki shows only as images
are not loaded, and rewards it does not name are recorded as unidentified items. The categories of
the solo events are set from the event pages and can be corrected.

Alliance events:

- Alliance Championship has all 6 tiers, with rewards for each of its 4 placement groups, from a
  community guide that lists them as text.
- Canyon Clash uses `tiers` for personal merit ranges, with rewards per legion rank, and
  `allianceRankings` for alliance rewards. Both come from wiki images.
- Frostdragon Tyrant has `personalRankings` (one table for each basis, such as capital occupation
  time and personal points) and uses `tiers` for its personal points milestones.
- SVS - State of Power has `days` for its 5 preparation stages and the battle phase (scoring
  actions, personal and alliance point milestones). `tiers` holds the ranking and winner reward
  tables. The source is the outof.games guide text and the wiki reward images.
- Sunfire Castle has `personalRankings` (Gems, Charm Design, and Charm Guide for 22 rank groups) and
  `tiers` for its 7 personal points milestones. Two wiki images show the values of one server.
- Mercenary Prestige has `tiers` for its four difficulty tiers (Easy to Insane as rankings) and
  `allianceRankings` for the Captain rewards, from the wiki text. The rankings of Champion's and
  Epic Initiation also carry `levels`: 50 enemy levels with tier, power, bonus, troops per type,
  total troops, and stage rewards. They are read by OCR and spot-checked against the outof.games
  table images. Those images show the older 50-level event (the Legend's Initiation of the guide,
  now called Epic), so their stage rewards differ from the current 25-level wiki rewards. Two source
  rows look like typos, Champion's Nightmare level 50 and Epic Nightmare level 13. They are kept as
  printed with a `note`.
- Alliance Showdown has `days` (the actions that score points each day, and the personal point
  milestones with rewards for that day) and `tiers` by star rating for the star and ranking rewards,
  from the outof.games guide tables.
- Alliance Mobilization has `missions` (name, group, and base points) read from the wiki mission
  tables. The 120% and 200% exclusive columns and the gem purchase missions are left out.
- Tundra Arms League uses `allianceRankings`, `personalRankings` (legion ranking and legion result),
  and `tiers` by Personal Arsenal Points, with Winner and Defeat rankings for the Elimination and
  Championship phases. The rewards come from in-game screenshots on outof.games.
- Crazy Joe keeps its first alliance reward list in `allianceRankings` and a later list for the same
  10 ranks in `allianceRankingUpdates`, from in-game screenshots taken after a server update. Its
  `personalRankings` has 21 rank groups, from 1 to 501-1000. Its `pointLevels` lists the 30 defense
  point levels. Each level needs both personal points (blue coin) and alliance points (gold coin)
  and has one reward. `waves` holds the target, rule, and details of its 20 waves, from a community
  guide. `tiers` holds its 21 difficulties with the Alliance Defense Points needed to unlock each,
  read from a wiki image.

Solo events:

- Armament Competition and Officer Project each have ranking rewards. `days` holds one entry for
  each version (Chief Gear and Chief Charm, or Troops and Heroes) with the points to score and the
  four target point levels with their rewards. The points needed for each level are loaded only for
  the Officer Project Troops version, so `scoreTotal` is omitted on the other levels.
- Fishing Tournament lists its five daily mission rewards in `tiers`, by Fishing Points. Its
  leaderboard rewards (9 rank bands) have no amounts, and some items are not linked, because they
  are read from a low-resolution wiki image. Refine them when the event returns.
- Frostfire Mine has its six gathering reward levels in `tiers` (by Orichalcum yield; the source
  image cuts off the last items of each row) and its ranking rewards in `personalRankings`.
- Icefire Warhymn League has its 7 season ranking groups and its State rewards in
  `personalRankings`, its 16 League Shop offers in `shop` (cost and limit in Warhymn Testaments),
  and its League Missions in `missions`, with `missionPointsLabel` naming the Testaments. Each
  mission has 7 levels that give the same rewards. In `levelRequirements`, the login mission needs 1
  more day for each level. Each other mission needs its level 1 amount again for each level, so
  level N is N times level 1. `rewards` holds the other items each level gives. The phases carry the
  UTC schedule, and the tips list which buffs apply, from the wiki and a community guide.
- King of Icefield has the scoring list of each of its 7 days in `days` and four ranking tables in
  `personalRankings`. The tables hold only the first rows because the wiki images are cropped.
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
- Hall of Chief has 13 stage scoring lists for its two seasons. Hall of Heroes has the shop of each
  hero generation, 1 to 9, in `shops`. Mia Fortune has orb costs and milestones.
- Crystal Reactivation has chest shops by Fire Crystal age. Chest and bundle offers hold their
  rewards in `contents`.
- Tundra Adventure has tile chances, item tile levels, point targets, and the Odyssey of Adventure
  board. Silver Shell Events, Tundra Album, and Shining City Pack are loaded from the wiki text, and
  their shops and packs are not loaded.
- State Merger has its Pioneering Praises missions with their rewards, the nine "A New Beginning"
  alliance monument missions, and the five chests. State Transfer and Tundra Star are loaded from
  the wiki text.
- Lucky Wheel, Defeat Nearby Beasts, Snowbusters, Flame and Fang, Wild Brawl, Tundra Games, Stand of
  Arms, and Hero Rally are loaded from the wiki text. Journey of Light, Symphony of Change, Return
  to Tundra, Deadshot, and Gina's Revenge are also solo events loaded from the wiki text.

Rookie events: City Development, Plan Your City, Trusted Chief, Power Up, War Preparation, Grow Your
Heroes, Develop New Tech (two wiki copies), Trial Event, and Home Beyond. Each target event has its
four or five target levels and the top 100 ranking. The target point amounts are loaded where a
screenshot shows them. Beast Whisperer has 75 daily missions. Working Overtime is also a rookie
event.

Holiday events: Frosty Fortune, Vision of Dawn, Romance Season, and Dreamscape Memory, from the wiki
text and the images that can be read, and Vault of Enigma.
