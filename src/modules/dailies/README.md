# Dailies

The steps of a recommended daily routine. Use it as the default list of daily tasks, and add your
own tasks on top of it. The in-game daily missions are not in this list. They are in
[Daily Missions](../daily-missions/README.md).

## Usage

```ts
import { dailies } from "whiteout-survival-data";

// Every step of the routine, in order
console.log(dailies().count()); // 15
console.log(
  dailies()
    .get()
    .slice(0, 3)
    .map((task) => task.name),
);
// [ 'Start by Checking Events Before Spending Anything', 'Complete Daily Missions', 'Clear Lighthouse Intel Throughout the Day' ]

// One step by id or by name
console.log(dailies().find("claim-your-daily-vip-reward")?.name); // 'Claim Your Daily VIP Reward'
console.log(dailies().findByName("use stamina with a purpose")?.id); // 'use-stamina-with-a-purpose'

// Steps that contain a word
console.log(dailies().search("pet").length); // 1
```

## Query methods

`dailies()` has no filters of its own. The shared terminal methods (`get`, `first`, `find`,
`findByName`, `search`, `count`) are described in [How It Works](../../../README.md#how-it-works).

## Data

The data is in `data/daily-tasks.json`. Each entry has an `id`, a `name`, an optional `img`, and an
optional `description`. The `id` is the name in lowercase kebab-case. No entry has an `img` or a
`description` yet.

## Notes

The 15 entries are the steps of a recommended daily routine, in order. They are not the in-game
daily missions, so for example "Complete Daily Missions" is a step of the routine and not a mission.
"Participate in Alliance Events When Scheduled" is a step of the routine, but not every important
activity is daily. Some steps are about the same part of the game as a mission, such as "Use Your
Free Arena Attempts" and the Arena Challenge mission, but a step is a habit and a mission is a task
with a target and rewards.

The [Daily Missions](../daily-missions/README.md) module has the in-game missions with their
targets, activity points, and rewards. A mission is in that module only, so it is not listed here.

The package has no daily reset time. The Lighthouse Intel refresh times are commonly 00:00, 08:00,
and 16:00 server time, which is not a daily reset time.
