# Castle Appointments

The positions of the Sunfire Castle and the buffs they give: President, Vice President, and the five
Ministers. Use it to show which buffs are available for each position.

## Usage

```ts
import { CASTLE_APPOINTMENT, castleAppointments } from "whiteout-survival-data";

console.log(castleAppointments().count()); // 8

// Buffs of one position
const health = castleAppointments().find("minister-of-health")!;
console.log(health.bonuses.map((b) => `${b.stat} ${b.value}`));
// ['Healing Speed +100%', 'Infirmary Capacity +5,000']
console.log(health.boostedBonuses?.map((b) => b.value)); // ['+150%', '+7,500']

// Positions of one kind
console.log(castleAppointments().byKind("minister").count()); // 5

// Rules of the appointments
console.log(CASTLE_APPOINTMENT.cooldownSeconds); // 7200
```

## Query methods

| Method         | Returns                                                                 |
| -------------- | ----------------------------------------------------------------------- |
| `byKind(kind)` | The positions of one kind: `president`, `vice-president`, or `minister` |

The shared terminal methods (`get`, `first`, `find`, `findByName`, `search`, `count`) are described
in [How It Works](../../../README.md#how-it-works).

## Data

The data is in `data/chief/castle-appointments.json`. Each position has an `id`, a `name`, a `kind`,
and `bonuses`. A bonus has a `stat`, a `statKey`, a `value` in the wording of the game, an `amount`,
and a `unit`. The `statKey` values are the same as in `research()`, so a position bonus matches a
research bonus of the same stat.

| Position              | Bonuses                                         | Boosted values |
| --------------------- | ----------------------------------------------- | -------------- |
| Supreme President     | Troops Attack, Defense, Lethality, Health +7.5% | none           |
| President             | Troops Attack, Defense, Lethality, Health +5%   | none           |
| Vice President        | Construction, Research, Training Speed +10%     | none           |
| Minister of Defense   | Troops Lethality +10%                           | +15%           |
| Minister of Strategy  | Troops Attack +5%, Deployment Capacity +2,500   | +8%, +3,750    |
| Minister of Health    | Healing Speed +100%, Infirmary Capacity +5,000  | +150%, +7,500  |
| Minister of Education | Training Speed +50%, Training Capacity +200     | +75%, +300     |
| Minister of Interior  | Resource Production Speed +80%                  | +120%          |

`CASTLE_APPOINTMENT` holds the appointment rules: a cooldown of 2 hours between appointments
(`cooldownSeconds`), an application that stays valid for 24 hours (`applicationValiditySeconds`),
and up to 100 applications for each position (`maxApplicationsPerPosition`).

The skills of the President, the global perks, are in
[President Skills](../president-skills/README.md).

## Assumptions

- The positions have no icons. The game shows a player portrait for each position.
- The package does not state what makes a minister buff boosted, so `boostedBonuses` holds the
  values only.
- The President positions and the Vice President have no boosted value.
- The Ministers of Security, Development, and Science are not in the data.
- The package has no appointment duration.
- The Supreme President has one value and the President has another. The package does not say which
  state holds which, because it depends on the State of Power result.
