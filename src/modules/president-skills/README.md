# President Skills

The skills of the President of a state. The development skills are global perks: each gives a speed
bonus to every Chief in the state for a time. The other skills give the President gems or act on one
Chief. Use it to show what each skill does, what it costs in Authority, and how often it can be
used.

## Usage

```ts
import { presidentSkills } from "whiteout-survival-data";

console.log(presidentSkills().count()); // 9

const mobilize = presidentSkills().find("mobilize")!;
console.log(mobilize.bonus?.value); // '30%'
console.log(mobilize.bonus?.statKey); // 'training-speed'
console.log(mobilize.bonus!.durationSeconds / 3600); // 24
console.log(mobilize.cooldownSeconds! / 86400); // 7
console.log(mobilize.authorityCost); // 45000

// The global perks: the skills that act on the whole state
console.log(
  presidentSkills()
    .byTarget("state")
    .get()
    .map((skill) => skill.name),
);
// ['Medical Advancement', 'Mercantilism', 'Research Advancement', 'Mobilize', "Supreme President's Will"]
```

## Query methods

| Method             | Returns                                                                                               |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| `byTarget(target)` | The skills with one `target`: `state` (every Chief in the state), `president`, or `chief` (one Chief) |

The shared terminal methods (`get`, `first`, `find`, `findByName`, `search`, `count`) are described
in [How It Works](../../../README.md#how-it-works).

## Data

The data is in `data/chief/president-skills.json`. Each skill has an `id`, a `name`, an `img`, the
`effect` in the wording of the game, a `target`, an `authorityCost`, and `maxUses`, the number of
uses that the game shows (for example "Uses left: 2/2").

| Skill                    | Target    | Authority | Uses | Effect                                   |
| ------------------------ | --------- | --------- | ---- | ---------------------------------------- |
| Receive Tribute          | president | 27,000    | 3    | 27,000 Authority for 300, 400, 500 Gems  |
| Medical Advancement      | state     | 45,000    | n/s  | Healing speed +50%, 24 hours             |
| Mercantilism             | state     | 45,000    | 2    | Construction speed +10%, 24 hours        |
| Research Advancement     | state     | 45,000    | 2    | Research speed +10%, 24 hours            |
| Mobilize                 | state     | 45,000    | 2    | Training speed +30%, 24 hours            |
| Ceasefire                | chief     | 27,000    | 14   | No attacks by the Chief for 1 hour       |
| Forced Exile             | chief     | 27,000    | 14   | Teleports the city, 10 hour Shield       |
| State Search             | chief     | 18,000    | 56   | Locates the city of a Chief of the state |
| Supreme President's Will | state     | n/s       | n/s  | Supreme President only                   |

`n/s` means that the value is not stated.

The four development skills have a `bonus` with the same `stat`, `statKey`, `value`, `amount`, and
`unit` fields as the bonuses of the other modules, and a `durationSeconds`. They also have a
`cooldownSeconds` of 7 days. The `statKey` values are the same as in `research()` and
`castleAppointments()`, so a perk adds to a bonus of the same stat. The skills that act on a Chief
have no `bonus`, because their effect is in the `effect` text. Supreme President's Will has
`supremePresidentOnly` set to `true`.

## Assumptions

The `effect`, `authorityCost`, and `maxUses` come from screenshots of the skill screen of the game.

- The screenshots show a cooldown timer instead of the uses for Medical Advancement, so it has no
  `maxUses`. It has the same Authority cost as the other three development skills.
- The screenshot shows 6 days left for Medical Advancement. The package gives the four development
  skills a cooldown of seven days.
- The screenshots do not say when the uses renew, so the package states `maxUses` only.
- Receive Tribute lists three gem amounts, 300, 400, and 500, and does not say whether they are the
  amounts of the three uses. The effect keeps the wording of the game.
- Authority is earned by the President. The game says: "Whenever Chiefs within the State claim Daily
  Mission Chests or gather resources, the President gains [Authority]. President Skills expend
  [Authority]." The amount a Chief earns is not stated.
- The skills have an `img`, a PNG in `images/president-skills/`, cropped from the screenshots. They
  are small, about 60 by 60 pixels, and the Ceasefire, Forced Exile, and State Search icons are
  about 98 by 98. Supreme President's Will has no `img`.
- Supreme President's Will is a Supreme President-only state enhancement with no values, so it has
  no `authorityCost`, `maxUses`, or `bonus`.
