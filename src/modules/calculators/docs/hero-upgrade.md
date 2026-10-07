# calculateHeroUpgrade

Calculates the shards, skill manuals, Widgets, and event points to upgrade one hero through stars,
skills, and exclusive weapon levels.

## Usage

```ts
import { calculateHeroUpgrade } from "whiteout-survival-data";

const result = calculateHeroUpgrade({
  id: "jeronimo",
  stars: { current: { star: 3, tier: 0 }, goal: { star: 3, tier: 2 } },
  skills: [{ name: "Battle Manifesto", current: 1, goal: 3 }],
  widgets: { current: 0, goal: 3 },
});

result.resources; // mythic-general-hero-shard 80, mythic-expedition-skill-manual 40
result.widgets.widgets; // 30
result.eventPoints.svs; // 483200
```

## Input

`calculateHeroUpgrade(goal)` plans one hero at a time. Only `id` is required.

| Field     | Type                              | Meaning                                                         |
| --------- | --------------------------------- | --------------------------------------------------------------- |
| `id`      | string                            | Hero `id` from `heroes()`.                                      |
| `stars`   | `{ current, goal }`               | Star labels `{ star, tier }`, such as 3.1 for star 3, tier 1.   |
| `skills`  | list of `{ name, current, goal }` | An Exploration or Expedition skill name and levels from 1 to 5. |
| `widgets` | `{ current, goal }`               | Exclusive weapon levels from 0 to 10.                           |

The star is 0 to 5, the tier is 0 to 5, and 5.0 is the last label.

## Result

| Field               | Meaning                                                                              |
| ------------------- | ------------------------------------------------------------------------------------ |
| `stars`             | `steps` and `shards` of the star track.                                              |
| `skills`            | `levels` gained and the `manuals` used.                                              |
| `widgets`           | `levels`, `widgets` used, and `unlockedSkills`, the weapon skills the levels unlock. |
| `resources`         | The general shard item of the rarity and the manuals, as `itemId` amounts.           |
| `eventPoints`       | Points in `svs`, `allianceShowdown`, `kingOfIcefield`, and `hallOfChief`.            |
| `unmetRequirements` | Skill levels that need a higher star than the star goal.                             |

## How it works

Each step from one star label to the next costs the shards of that tier in the `shardCosts` of the
hero. The costs are the same for every hero. The result counts them as the general shard item of the
rarity. The shard of the hero counts the same.

The levels of a skill after `current` up to `goal` cost the Exploration or Expedition Skill Manuals
of the rarity of the hero, which is Mythic for Legendary heroes. A skill level can need a star. When
the goal has `stars`, the levels with a `starRequired` above the star goal are listed in
`unmetRequirements`. Without `stars`, nothing is checked.

Widgets level the exclusive weapon. They cost the Widgets of `heroWidgets()`, from 5 for level 1 up
to 50 for level 10, and 275 in all. Only a hero with an `exclusiveWeapon` has them. The result lists
the weapon skills that the levels unlock when the weapon skill has an `unlockLevel`.

`eventPoints` scores the shards used to ascend the hero (by rarity) and the Widgets, read from the
scoring rows of each event.

## Errors

An unknown hero or skill, a skill named twice, or Widgets for a hero with no exclusive weapon throws
`Error`. A star, tier, or level out of range, or a goal below the current value, throws
`RangeError`.

## Data and assumptions

`HERO_UPGRADE_CALCULATOR` exports the limits (`maxStar`, `maxTier`, and `maxWidgetLevel`). The
Widget table comes from WoS Tools. The repo has no Widget item yet, so the Widgets are a plain
number and not an `itemId` amount. Power is not included.
