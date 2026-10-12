# Dailies

The in-game daily missions. Use it as the default list of daily tasks, and add your own tasks on top
of it.

The list is not complete yet. It holds the missions that a source names, in the wording of the
source. More missions are added when a source states them.

## Usage

```ts
import { dailies } from "whiteout-survival-data";

// Every daily mission
console.log(dailies().count()); // 21
console.log(
  dailies()
    .get()
    .map((task) => task.name),
);
// ['Upgrade 1 Building', 'Research 1 Technology', 'Fight in 1 or 5 Arena Challenges', ...]

// One mission by id or by name
console.log(dailies().find("claim-5-online-rewards")?.name); // 'Claim 5 Online Rewards'
console.log(dailies().findByName("research 1 technology")?.id); // 'research-1-technology'

// Missions that contain a word
console.log(dailies().search("pet").length); // 2
```

## Query methods

`dailies()` has no filters of its own. The shared terminal methods (`get`, `first`, `find`,
`findByName`, `search`, `count`) are described in [How It Works](../../../README.md#how-it-works).

## Data

The data is in `data/daily-tasks.json`. Each entry has an `id`, a `name`, an optional `img`, and an
optional `description`. The `id` is the name in lowercase kebab-case, and a name with a choice such
as "1 or 5" has a shorter `id`. No entry has an `img` or a `description` yet, because no source
states one.

## Notes

The first 6 entries are in-game daily missions. Their names come from the AppGamer page "Daily
Missions - Whiteout Survival" (`https://www.appgamer.com/white-out-survival/daily-missions`). The
page returned an access error when it was fetched, so the names were read from a summary of the
page. They are written as the summary quotes them, including "Complete 1 challenges in The
Labyrinth". A name that holds two amounts, such as "Fight in 1 or 5 Arena Challenges", is one entry
until a source lists the missions separately. The same source says the game also has daily missions
for gathering and for training troops, and that the missions give activity points. It names no such
mission and gives no points, so the list has neither.

The next 15 entries are the steps of the daily routine on the Heaven Guardian page "Whiteout
Survival Daily Routine & Checklist"
(`https://heaven-guardian.com/whiteout-survival-daily-routine/`), in the order of the page. The
names are the headings of the page, read through a tool that turns the page into text. This is the
routine that the author recommends. It is not the in-game Daily Missions list, so for example
"Complete Daily Missions" is a step of the routine and not a mission. "Participate in Alliance
Events When Scheduled" is on the page's list, but the page says that not every important activity is
daily.

The package has no daily reset time. The Whiteout Survival Wiki has no page for the daily missions
and states none. The AppGamer page could not be read in full. The Heaven Guardian page gives the
refresh times of Lighthouse Intel, commonly 00:00, 08:00, and 16:00 server time, which is not a
daily reset time.
