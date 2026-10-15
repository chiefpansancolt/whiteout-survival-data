# Heroes

All 65 heroes released so far, with stats, skills, shard costs, and level power. Use it to look up a
hero, list heroes by rarity or class, or estimate a hero's stats at a lower star.

## Usage

```ts
import { estimateHeroStats, HERO_STAT_ESTIMATE, heroes } from "whiteout-survival-data";

const legendaryInfantry = heroes().byRarity("Legendary").byClass("Infantry").get();

const hector = heroes().findByName("Hector")!;
console.log(hector.stats.exploration); // { attack: 3780, defense: 4928, health: 73926 }

const threeStars = estimateHeroStats(hector, 3, 0);
console.log(threeStars.estimated, threeStars.exploration);

console.log(HERO_STAT_ESTIMATE); // { level: 80, maxStar: 5, maxTier: 5 }
```

## Query methods

| Method               | Returns     | Description                                        |
| -------------------- | ----------- | -------------------------------------------------- |
| `byRarity(rarity)`   | `HeroQuery` | Heroes of one rarity: Rare, Epic, or Legendary     |
| `byClass(heroClass)` | `HeroQuery` | Heroes of one class: Infantry, Lancer, or Marksman |

The shared terminal methods (`get`, `first`, `find`, `findByName`, `search`, `count`) are described
in [How It Works](../../../README.md#how-it-works).

## Stat estimate

`estimateHeroStats(hero, star, tier)` estimates the stats of a hero at level 80 for a lower star.
`star` is 0 to 5 and `tier` is 0 to 5 inside the star, as the in-game label `star.tier` (3.2 is star
3, tier 2). It returns `level`, `star`, `tier`, `exploration`, `expedition`, and `estimated`.
Exploration stats are whole numbers. Expedition stats are percents with 2 decimals. At 5 stars
`estimated` is `false` and the result is the stored stats. The tier must be 0 at 5 stars. A star or
tier that is not a whole number in range throws a `RangeError`. `HERO_STAT_ESTIMATE` exports the
accepted ranges.

The formula scales the stats of a hero by the ratio of its own 5-star stats to a reference hero,
grows the stat by a step for each star, and adds 14.7% of the star's step for each tier. The
Exploration star growth is 1.376. The value is fitted to Hector at level 80, whose in-game stats at
3.0 are 2,130 attack, 2,765 defense, and 41,569 health. The estimate is within 0.3% of them. The
promotion previews of 3.0 to 3.1 and 3.2 to 3.3 (+102 attack, +133 defense, +1,998 health, +14.31
Expedition) match the tier step too.

It is still an estimate. It has been checked only against Hector at 3.0 to 3.3. The 3.2 step is
about 10% larger in the game than the formula gives. There is no data for other hero levels, so it
covers level 80 only.

## Data

The data is in `data/chief/heroes.json`. Each hero has these fields.

| Field             | Meaning                                                                    |
| ----------------- | -------------------------------------------------------------------------- |
| `rarity`          | `Rare`, `Epic`, or `Legendary`                                             |
| `class`           | `Infantry`, `Lancer`, or `Marksman`                                        |
| `subClass`        | `Growth` or `Combat`, stored for each hero                                 |
| `generation`      | 0 for the pre-Legendary heroes, 1 to 17 for Legendary heroes               |
| `stats`           | Level 80, 5-star stats: `exploration` and `expedition`                     |
| `skills`          | `exploration[]`, `expedition[]`, and an optional `talent`                  |
| `exclusiveWeapon` | Legendary heroes only: bonus stats, `power`, `levels`, and two skills      |
| `shardCosts`      | 5 stars of 6 tier costs, with `total`, `power`, and `tierPower`            |
| `powerAtStarZero` | Star Power at star 0, set for 29 heroes                                    |
| `shardSources`    | Where the shards come from                                                 |
| `shardImg`        | Shard icon, set for 30 heroes                                              |
| `levels`          | 80 entries of `furnaceLevelRequired`, `xpRequired`, and cumulative `power` |

The data holds 65 heroes. Generation 0 has 13 pre-Legendary heroes (4 Rare, 9 Epic). Legendary
Generations 1 to 17 have 52 heroes. Generation 1 has 4, because Jeronimo and Natalia are both
Infantry. Every later generation has 1 Infantry, 1 Lancer, and 1 Marksman hero. New generations are
added as they are released.

## Notes

`subClass` is stored for each hero and not derived, because it does not follow a rule from rarity or
class. Gina and Jasser are both Epic Marksman. Gina is `Combat` and Jasser is `Growth`.

Stats have two groups. `exploration` has flat `attack`, `defense`, and `health`. `expedition` has
`attack` and `defense` as percents.

### Skills

Skills are grouped like the in-game skill tabs. Legendary heroes have 3 Exploration and 3 Expedition
skills. Rare heroes have 2 and 2. Epic heroes have 3 Exploration and 2 Expedition skills. The Talent
tab is empty for every Legendary hero except Jeronimo and Natalia, the Generation 1 Infantry heroes.
`skills.talent` is `undefined` for every other Legendary hero.

Each skill has 5 `levels` of `{ level, manualsRequired, powerGain, starRequired, effects }`. They
match the 5 slash-separated values in the description, for example "200%/220%/240%/260%/280%".

`effects` holds the numbers of the description for that level, so you read them without parsing the
text. It has one entry for each set of 5 numbers in the description, in the order of the text. Each
entry is `{ name, amount, unit }`.

```ts
const gina = heroes().find("gina")!;
const skill = gina.skills.expedition.find((s) => s.name === "Endurance Training")!;
skill.levels[1].effects; // [{ name: 'Stamina Cost Reduction', amount: 12, unit: 'percent' }]
```

| `unit`            | Meaning                                                               |
| ----------------- | --------------------------------------------------------------------- |
| `percent`         | A percent, such as 12 for 12%.                                        |
| `percentOfAttack` | A multiple of the Attack of the hero, such as 210 for "Attack\*210%". |
| `seconds`         | A time in seconds, such as the 0.5 of a stun of 0.5 seconds.          |
| `number`          | A plain count, such as the 8 strikes before an effect.                |

A skill with two sets, such as Incendiary Arrow of Gina, has two entries at every level, and no two
entries of one skill have the same name. The `name` says what the number sets. A name has no suffix
when the skill grants or raises the stat, such as `Attack`, and ends in `Reduction` when it lowers
one, such as `Damage Taken Reduction` or `Enemy Attack Reduction`. A qualifier in parentheses names
the troop type or the target, such as `Damage Dealt (Lancers)` or `Damage (Nearby Enemies)`. The
names are the same at all 5 levels of a skill. A condition in the text, such as "under 50% Health",
is not part of the name.

`manualsRequired` is 0 / 10 / 30 / 50 / 75 for levels 1 to 5 on every Exploration and Expedition
skill of every hero. The Talent skill of Jeronimo and Natalia needs no Manuals, so it is 0 at every
level.

`starRequired` is the hero star needed to unlock the skill level. It depends on the skill slot and
not on the skill. A 1st Exploration skill unlocks its levels at stars 0/1/2/3/4. A 3rd Exploration
skill or a 2nd Expedition skill needs stars 2/2/2/3/4. The Talent skill of Jeronimo and Natalia
needs the star of the same number as the level: stars 1/2/3/4/5.

`powerGain` is the same for every skill of a rarity, in every slot.

| Rarity    | Level 1 | Level 2 | Level 3 | Level 4 | Level 5 |
| --------- | ------- | ------- | ------- | ------- | ------- |
| Rare      | 540     | 2,030   | 3,780   | 6,426   | 10,152  |
| Epic      | 720     | 2,707   | 5,040   | 8,568   | 13,536  |
| Legendary | 900     | 3,380   | 6,300   | 10,710  | 16,920  |

The Talent skill `powerGain` is a `0` placeholder. The Power per Legendary hero level covers "all 6
skills", which excludes Talent.

### Exclusive weapon

`exclusiveWeapon` is set on Legendary heroes only. It is also called the Special item. Its
Expedition bonus uses `lethality` and `health` percents, a different stat pair than the Expedition
stats of the hero. It also has a `power` rating, which is the Power at weapon level 10, `levels`,
and two skills of `{ name, img, description, unlockLevel? }`. These skills do not scale over 5
levels. Each has one fixed effect that activates at `unlockLevel`. Most heroes state it as a "(Lv.
N)" suffix. Some newer heroes omit it, so `unlockLevel` is not set for them. The Widgets that each
weapon level costs are in [`heroWidgets()`](../hero-widgets/README.md).

`levels` has the 10 weapon levels as `{ level, power }`, and the Power rises with each level. Level
10 is `power`. The package owner gave the Power at levels 1, 2, and 3 of the Generation 2 weapons
(36,000, 61,200, and 86,400 of 270,000) and at levels 3, 4, and 6 of the Generation 4 weapons
(133,200, 172,050, and 249,750 of 416,250). Both sets follow one share of the level 10 Power: 2/15,
17/75, 8/25, 31/75, and 3/5 at levels 1, 2, 3, 4, and 6. Every weapon uses these shares. Levels 5,
7, 8, and 9 are not confirmed. They continue the line between the confirmed levels: 38/75 at level
5, and 7/10, 4/5, and 9/10 at levels 7, 8, and 9.

### Shard costs and shard power

`shardCosts` has 5 stars of 6 tier costs for every hero. The tier costs are the same for every
rarity, and so are the `total` values, which equal the sum of the tier costs of the star. Paying the
6 tier costs of a star moves the hero through the labels `star.1` to `star.5` and then to the next
whole star. Each star also has a `power` field. It is the Star Power once the whole star is reached,
not the gain of that star alone.

`powerAtStarZero` is the Star Power at star 0. It is set for every hero with a confirmed maximum
star Power: Rare and Epic heroes and Legendary heroes through Generation 5. It is 6,500 for Rare and
8,000 for Epic heroes, 10,000 for Molly and Zinman, 11,000 for Natalia, 12,000 for Generation 2,
12,500 for Jeronimo, 15,000 for Generation 3, 18,500 for Generation 4, and 22,200 for Generation 5.
It is twice the level 1 Power of the hero.

The Star Power at a label is `powerAtStarZero` times a multiplier of the label. The multipliers are
the same for every hero and are listed under [Star multipliers](#star-multipliers). The `power` of a
star is the Star Power at the whole-star label: the multipliers 4.18, 9.98, 20.26, 38.22, and 69.18
at stars 1 to 5. The Star Power at the maximum star is the confirmed value of the hero. For
Generation 2 it is 12,000 times 69.18, which is 830,160. Stars 1 to 5 of a Generation 2 hero are
50,160, 119,760, 243,120, 458,640, and 830,160.

Legendary Generations 6 to 17 have no confirmed maximum star Power and no `powerAtStarZero`. Their
shard `power` is a `0` placeholder.

`tierPower` lists the Star Power after each of the six tier costs of a star: the labels `star.1` to
`star.5`, and then the next whole star. The last entry is the `power` of the star. Every hero that
has a `powerAtStarZero` has the stored values. They are the Power at star 0 times the multiplier of
the label, rounded. Read the Star Power of a label from `tierPower`. The multipliers below explain
where the values come from.

#### Star multipliers

A label is `star.tier`, such as 3.2 for star 3, tier 2. The tier is 0 to 5, and it is 0 at 5 stars.
The multipliers are the same for every Legendary hero of Generations 1 to 5. Rare and Epic heroes
use them too, but this is confirmed at 5.0 only.

| Label | Multiplier | Label | Multiplier | Label | Multiplier | Label | Multiplier |
| ----- | ---------- | ----- | ---------- | ----- | ---------- | ----- | ---------- |
| 0.0   | 1          | 0.1   | 1.34       | 0.2   | 1.8        | 0.3   | 2.29       |
| 0.4   | 2.7        | 0.5   | 3.25       | 1.0   | 4.18       | 1.1   | 4.92       |
| 1.2   | 5.7        | 1.3   | 6.52       | 1.4   | 7.39       | 1.5   | 8.44       |
| 2.0   | 9.98       | 2.1   | 11.31      | 2.2   | 12.71      | 2.3   | 14.33      |
| 2.4   | 15.87      | 2.5   | 17.52      | 3.0   | 20.26      | 3.1   | 22.62      |
| 3.2   | 25.29      | 3.3*  | 27.97      | 3.4   | 30.66      | 3.5   | 33.55      |
| 4.0   | 38.22      | 4.1   | 42.29      | 4.2   | 46.8       | 4.3*  | 51.44      |
| 4.4*  | 56.22      | 4.5*  | 61.13      | 5.0   | 69.18      |       |            |

Labels marked with `*` are predicted, not read in the game.

The labels 0.1 to 3.0 come from the Hero Power that the package owner read in the game for Hector,
Norah, and Gwen (Generation 5), ending at 449,772 at 3.0. The reading at 2.4 was entered as 352,258.
It is not a multiple of 22,200 by hundredths like the other readings, so 352,314 is stored. The
owner read the Star Power of 15 more heroes of Generations 1 to 5 at 3.0, 3.1, 3.2, 3.4, 3.5, 4.0,
4.1, and 4.2. Heroes that share a label gave the same multiplier, for example 25.29 at 3.2 for
Zinman, Natalia, and Hector. The multiplier at 5.0 is 69.18 for every group of heroes.

The labels 3.3, 4.3, 4.4, and 4.5 are predicted. The prediction uses the step between two labels,
which is the gain of the multiplier for one tier. Inside a star the steps grow by a constant ratio,
and the ratio is solved so that the steps add up to the next label that was read.

- 3.3: the step from 3.2 grows by 1.0037, so the step to 3.3 is 2.68 and the multiplier is 27.97.
  The labels 3.2 and 3.4 were read.
- 4.3 to 4.5: the last step of a star is larger than the step before it, by 1.66 from 2.5 to 3.0 and
  by 1.62 from 3.5 to 4.0. The step from 4.5 to 5.0 is 1.64 times the step to 4.5. With the steps of
  4.1 and 4.2 and the multiplier 69.18 at 5.0, the steps grow by 1.029. The multipliers are 51.44,
  56.22, and 61.13, and the step from 4.5 to 5.0 is 8.05.

A predicted label can differ from the game by a small amount. Replace its values in `tierPower` when
you have a reading.

`shardSources` lists where the shards of each hero come from, for example `["VIP Packs"]` or
`["Hall of Heroes", "Daily Deals"]`. It is empty for Ling Xue, the one Generation 0 hero with no
listed sources.

`shardImg` is set for Smith, Eugene, Charlie, Cloris, Sergey, Jessie, Patrick, Lumak Bokan, Ling
Xue, Gina, Bahiti, Jasser, Seo-yoon, Natalia, Molly, Zinman, Flint, Philly, Alonso, Logan, Mia,
Greg, Reina, Lynn, Norah, Gwen, Wu Ming, Gordon, Hendrik, and Magnus. The file is `<Name>-Shard.png`
in the image folder of the hero. The matching hero shard item in `items()` points to the same file.

### Level power

`levels` is the 80-level Furnace, XP, and Power progression. `furnaceLevelRequired` is the Furnace
level needed to reach the hero level. `xpRequired` is the Hero XP needed from the previous level,
and it is 0 at level 1. Both are identical for every hero, regardless of rarity, class, or
generation.

`power` is the total Power once the level is reached. It follows one shared 80-entry curve. The gain
at level L is `start * base[L] / 250` with integer division, and `power` is the running total of the
gains. The `base` curve is the same for all heroes, and only the level 1 `start` differs. It is
3,250 for Rare and 4,000 for Epic. For Legendary Generations 1 to 5 it is 5,000, 6,000, 7,500,
9,250, and 11,100. The start values of Generations 3 to 5 are projected and are not measured in the
game.

The values reproduce the known checkpoints for every covered rarity and generation. Rare levels 10,
40, and 80 give 9,945, 42,185, and 121,290. Legendary Generation 1 gives 15,300, 64,900, and
186,600. Legendary Generations 6 to 17 have no confirmed start value, so extrapolating one would be
a guess. Their level `power` is a `0` placeholder.

Jeronimo and Natalia are confirmed exceptions to their generation. The start of Jeronimo is 6,250
and not the 5,000 of Generation 1, so his level 80 total is 233,250 and not 186,600. The start of
Natalia is 5,500, so her level 80 total is 205,260. The curve and the formula are the same.
