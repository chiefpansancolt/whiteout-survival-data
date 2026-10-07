# Hero Widgets

The Widgets that each level of a hero's exclusive weapon costs. Use it to total the Widgets for a
weapon range. The same table applies to every hero that has an exclusive weapon.

## Usage

```ts
import { heroWidgets } from "whiteout-survival-data";

const levelTen = heroWidgets().byLevel(10).first();
console.log(levelTen?.widgets); // 50

const totalWidgets = heroWidgets()
  .get()
  .reduce((sum, row) => sum + row.widgets, 0);
console.log(totalWidgets); // 275
```

## Query methods

| Method       | Returns           | Description                            |
| ------------ | ----------------- | -------------------------------------- |
| `byLevel(n)` | `HeroWidgetQuery` | The row for exclusive weapon level `n` |

The shared terminal methods (`get`, `first`, `find`, `findByName`, `search`, `count`) are described
in [How It Works](../../../README.md#how-it-works).

## Data

The data is in `data/chief/hero-widget-levels.json`. It has 10 rows, one for each exclusive weapon
level from 1 to 10. Each row has an `id` such as `level-1`, a `name`, the `level`, and `widgets`,
the Widgets needed to reach that level from the previous one. The cost is 5 Widgets for level 1 and
rises by 5 for each level to 50 for level 10, 275 in all.

## Notes

The table comes from WoS Tools. The repo has no Widget item in `items()` yet, so `widgets` is a
plain number and not an item cost. `calculateHeroUpgrade()` reads this table to plan the weapon
levels of one hero. Only a hero with an `exclusiveWeapon` has weapon levels, and the weapon skills
unlock at the `unlockLevel` values on that weapon. See [`heroes()`](../heroes/README.md).
