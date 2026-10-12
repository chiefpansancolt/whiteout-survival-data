# Server Timeline

The server timeline lists what unlocks at each server age. Heroes, experts, pets, events, and Fire
Crystal levels are stored as ids and resolve to the full entries from `heroes()`, `experts()`,
`pets()`, and `events()` when you ask for them. Pass your server start date to find your server age
and what is unlocked.

## Usage

```ts
import {
  heroGenerationAt,
  serverAge,
  serverTimeline,
  serverTimelineStatus,
} from "whiteout-survival-data";

// Server age in whole days. Day 0 is the start date.
console.log(serverAge("2026-07-01", "2026-10-11")); // 102

// Everything unlocked and locked for a server, with heroes and pets resolved
const status = serverTimelineStatus("2026-07-01", "2026-10-11");
console.log(status.age); // 102
console.log(status.unlocked.flatMap((m) => m.heroes.map((h) => h.name)));
// ['Natalia', 'Jeronimo', 'Molly', 'Zinman', 'Flint', 'Philly', 'Alonso']
console.log(status.next?.name, status.next?.date); // 'Day 120' '2026-10-29'

// The highest hero generation unlocked at a server age
console.log(heroGenerationAt(status.age)); // 2

// The day on which a keyed unlock happens
const warAcademy = serverTimeline()
  .get()
  .find((m) => m.unlocks.some((u) => u.key === "war-academy"));
console.log(warAcademy?.day); // 220

// Query the milestones directly
const day54 = serverTimeline().find("day-54")!;
console.log(day54.petIds);
// ['cave-hyena', 'arctic-wolf', 'musk-ox', 'titan-roc', 'giant-tapir']
console.log(serverTimeline().unlockedAt(100).count()); // 7
console.log(serverTimeline().lockedAt(100).first()?.day); // 120
console.log(
  serverTimeline()
    .lockedAt(1000)
    .resolve()[0]
    .heroes.map((h) => h.name),
);
// ['Hank', 'Estrella', 'Viveca']
```

## Query methods

| Method            | Returns        | Description                                                                                                                                                                                                          |
| ----------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `unlockedAt(age)` | Timeline query | Milestones at or before the server age in days                                                                                                                                                                       |
| `lockedAt(age)`   | Timeline query | Milestones after the server age in days                                                                                                                                                                              |
| `resolve()`       | Array          | Milestones with `heroes`, `experts`, `pets`, `events`, and `fireCrystalLevels` as full entries, `heroShardEvents` with the shard events of every hero by hero id, and the `item` of each unlock that has an `itemId` |

`resolve()` ends the chain. It throws `Error` when an id matches no entry. The terminal methods
`get`, `first`, `find`, `findByName`, `search`, and `count` are described in
[How It Works](../../../README.md#how-it-works).

## Functions

| Function                                 | Returns | Description                                                      |
| ---------------------------------------- | ------- | ---------------------------------------------------------------- |
| `serverAge(startDate, asOf?)`            | number  | Whole days from the start date to `asOf`. `asOf` defaults to now |
| `serverTimelineStatus(startDate, asOf?)` | object  | The age, the unlocked and locked milestones, and the next one    |
| `heroGenerationAt(serverAge)`            | number  | The highest hero generation unlocked at a server age in days     |

Dates are a `Date` or a string such as `2026-01-15`. Both count in UTC and ignore the time of day.
`serverAge` and `serverTimelineStatus` throw `RangeError` when a date is invalid or `asOf` is before
the start date. `heroGenerationAt` is 1 on day 0 and 16 from day 1160, and throws `RangeError` for a
negative or non-numeric age.

`serverTimelineStatus` returns `age`, `startDate`, `unlocked`, `locked`, and `next`. `unlocked` and
`locked` list the oldest milestone first. Each milestone has a `date`, the calendar date on which it
unlocks for that server. `startDate` and `date` use the `YYYY-MM-DD` format in UTC. `next` is not
set when every milestone is unlocked.

`resolve()` returns `heroShardEvents` with a key for every hero of the milestone. The array is empty
when no event is listed. `unlockedAt(age)` and `lockedAt(age)` split at the age, so a milestone on
the age itself is unlocked.

## Data

The module holds 32 milestones from `data/server-timeline.json`, from day 0 to day 1160. Each
milestone has these fields.

| Field                 | Meaning                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `day`                 | Server age in days at which the content unlocks. Day 0 is the server start date                                   |
| `heroIds`             | Ids of the heroes that unlock. Resolve with `heroes()`                                                            |
| `heroShardEventIds`   | Ids of the events that give shards of each hero, by hero id. A hero with no listed event has no key               |
| `expertIds`           | Ids of the experts that unlock. Resolve with `experts()`                                                          |
| `petIds`              | Ids of the pets that unlock. Resolve with `pets()`                                                                |
| `eventIds`            | Ids of the events that unlock. Resolve with `events()`                                                            |
| `fireCrystalLevelIds` | Ids of the Fire Crystal levels that unlock, such as `fc-5`. Resolve with `resolve()`                              |
| `unlocks`             | Everything else that unlocks, as `name` in the wording of the source, an optional `key`, and an optional `itemId` |

## Notes

The data comes from `https://www.whiteoutsurvival.wiki/server-timeline-server-age/`.

The experts unlock on four days, from the Experts section of the timeline page: day 120 (Holger,
Agnes, Cyrille), day 160 (Romulus), day 200 (Valeria, Baldur, Fabian), and day 230 (Kathy, Ronne).
Days 160 and 230 have no other content on the page, so their milestones hold only experts. The page
does not list Gareth, so he is on no milestone. The wiki days are the ones in the data, so Ronne and
Kathy unlock on day 230 together. The day of each expert is also `unlockRequirement.daysRequired` in
`experts()`.

Justus, an expert that the game has not released, is on day 360, the day of the generation 6 heroes.
The guide says he unlocks "after Gen 6 Heroes unlock in your state" and gives no day, so day 360 is
the earliest day he can unlock. The wiki timeline page does not list him. `resolve()` returns him in
`experts`, with `unreleased` set to `true`.

The source does not list the Generation 17 heroes in `heroes()`. They are not on the timeline until
a source states their day.

The pet days on the timeline and `unlockRequirement.daysRequired` in `pets()` are the same. Titan
Roc and Giant Tapir are on day 54, Snow Leopard and Giant Elk on day 90, Cave Lion and Snow Ape on
day 140, Iron Rhino and Saber-tooth Tiger on day 200, Mammoth and Frost Gorilla on day 280, and
Frostscale Chameleon on day 370. These days were set by hand. The wiki timeline page lists different
days and no pets after day 280.

The source names events that unlock: Sunfire Castle (day 53), State vs. State and King of the Ice
(day 80), and Hero's Mission (day 195). They link to `sunfire-castle`, `svs-state-of-power`,
`king-of-icefield`, and `heros-mission` in `events()`, which carry the names of the event pages. The
source writes "Gina's Revenge → Hero's Mission" on day 195. The timeline keeps only Hero's Mission,
because it replaces Gina's Revenge. The other `unlocks` text is not an event page, so it has no
link.

The shard events of each hero cover five events: Lucky Wheel, Hall of Heroes, Hall of Chief, King of
Icefield, and State of Power (SVS). Generations 2 to 9 come from the Reddit image "Server Timeline"
(last update 2024/8/19), where an icon below each hero shows the first way to get shards of a new
generation. Each generation has one hero for Lucky Wheel, one for Hall of Heroes, and one for the
other three events. Generation 1 and Generations 10 to 16 have no image, so they use `shardSources`
from `heroes()`, limited to the same events. Jeronimo and Natalia have no listed event.

Hall of Chief is listed only for Philly (Generation 2). The image and the wiki show it for later
Generations too, but it is left out for Generation 3 and later by choice. The image and the wiki
differ for two heroes: the wiki adds Hall of Heroes for Hector, and the wiki has no Hall of Chief
for Philly. The timeline follows the image.

The Fire Crystal level badges come from `data/fire-crystal-levels.json`. Each has a `level` from 1
to 10 and an `img` in `images/fire-crystal/`. The images are 52 by 52 pixel crops from the community
table "Fire Crystal Upgrades" by Lobster (WOA, State 843) on Reddit, so they are small and keep the
red table background. They are not the original game files. The timeline links FC 1 to FC 3 to day
60, FC 4 and FC 5 to day 150, FC 6 to FC 8 to day 315, and FC 9 and FC 10 to day 500. The wiki page
names only FC 5, FC 8, and FC 10. It writes day 150 as "Fire Crystal 5 + Laboratory Unlocks", day
315 as "Fire Crystal 8 Unlocks", and day 500 as "Fire Crystal 10 Unlocks". The other levels were set
by hand. The badges replace the "Fire Crystal 8 Unlocks" line on day 315 and the "Fire Crystal 10
Unlocks" line on day 500.

The laboratory entries use reworded text. Day 150 reads "Crystal Laboratory Unlocks (4x)", day 220
reads "Crystal Laboratory Updated (5x)", and day 315 reads "Crystal Laboratory Updated (6x)". The
wiki writes "Fire Crystal 5 + Laboratory Unlocks", "Fire Crystal Lab 5 Unlocks", and "Fire Crystal
Lab 6 Unlocks". Day 315 reads "Daily Missions Update (20x Fire Crystal rewards)", where the wiki
writes "(10x to 20x Fire Crystal rewards)".

The "Fire Crystal Age Unlocks" entry on day 60 has the `itemId` `fire-crystal`, so it shows the Fire
Crystal icon from `items()`.

The source writes the hero Norah as "Nora". The timeline uses the id `norah` from `heroes()`.

The `key` of an unlock names an unlock that the site reads, so the site does not match its text. It
is set for `war-academy` on day 220 and `t12-research` on day 680, and for no other unlock. A key is
unique in the timeline.
