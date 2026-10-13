# Dailies

The in-game daily missions. Use it as the default list of daily tasks, and add your own tasks on top
of it.

The list is not complete yet. More missions are added later.

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
as "1 or 5" has a shorter `id`. No entry has an `img` or a `description` yet.

## Notes

The first 6 entries are in-game daily missions. They are written as the game words them, including
"Complete 1 challenges in The Labyrinth". A name that holds two amounts, such as "Fight in 1 or 5
Arena Challenges", is one entry. The game also has daily missions for gathering and for training
troops, and the missions give activity points. The list has neither.

The next 15 entries are the steps of a recommended daily routine, in order. It is not the in-game
Daily Missions list, so for example "Complete Daily Missions" is a step of the routine and not a
mission. "Participate in Alliance Events When Scheduled" is a step of the routine, but not every
important activity is daily.

The package has no daily reset time. The Lighthouse Intel refresh times are commonly 00:00, 08:00,
and 16:00 server time, which is not a daily reset time.
