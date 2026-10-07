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

The formula is the one on the WoS Tools Hero Hub compare tab. It scales the stats of a hero by the
ratio of its own 5-star stats to a reference hero, grows the stat by a step for each star, and adds
14.7% of the star's step for each tier. The Exploration star growth is 1.376 and not the 1.4 of WoS
Tools. The value is fitted to Hector at level 80, whose in-game stats at 3.0 are 2,130 attack, 2,765
defense, and 41,569 health. The estimate is within 0.3% of them. The promotion previews of 3.0 to
3.1 and 3.2 to 3.3 (+102 attack, +133 defense, +1,998 health, +14.31 Expedition) match the tier step
too.

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
| `exclusiveWeapon` | Legendary heroes only: bonus stats, `power`, and two skills                |
| `shardCosts`      | 5 stars of 6 tier costs, with `total` and cumulative `power`               |
| `shardSources`    | Where the shards come from, as the wiki lists them                         |
| `shardImg`        | Shard icon, set for 13 heroes                                              |
| `levels`          | 80 entries of `furnaceLevelRequired`, `xpRequired`, and cumulative `power` |

The data holds 65 heroes. Generation 0 has 13 pre-Legendary heroes (4 Rare, 9 Epic). Legendary
Generations 1 to 17 have 52 heroes. Generation 1 has 4, because Jeronimo and Natalia are both
Infantry. Every later generation has 1 Infantry, 1 Lancer, and 1 Marksman hero. New generations are
added once the source wiki publishes them.

## Notes

`subClass` is stored for each hero and not derived, because it does not follow a rule from rarity or
class. Gina and Jasser are both Epic Marksman. Gina is `Combat` and Jasser is `Growth`.

Stats have two groups. `exploration` has flat `attack`, `defense`, and `health`. `expedition` has
`attack` and `defense` as percents.

### Skills

Skills are grouped like the in-game skill tabs. Legendary heroes have 3 Exploration and 3 Expedition
skills. Rare heroes have 2 and 2. Epic heroes have 3 Exploration and 2 Expedition skills. The Talent
tab is empty on the wiki for every Legendary hero except Jeronimo and Natalia, the Generation 1
Infantry heroes. `skills.talent` is `undefined` for every other Legendary hero.

Each skill has 5 `levels` of `{ level, manualsRequired, powerGain, starRequired }`. They match the 5
slash-separated values in the description, for example "200%/220%/240%/260%/280%".

`manualsRequired` is 0 / 10 / 30 / 50 / 75 for levels 1 to 5 on every Exploration and Expedition
skill of every hero. The Talent skill of Jeronimo and Natalia needs no Manuals, so it is 0 at every
level.

`starRequired` is the hero star needed to unlock the skill level. It depends on the skill slot and
not on the skill. A 1st Exploration skill unlocks its levels at stars 0/1/2/3/4. A 3rd Exploration
skill or a 2nd Expedition skill needs stars 2/2/2/3/4. A star does gate the Talent skill, but the
curve is not sourced. `starRequired` is a `0` placeholder for Jeronimo and Natalia.

`powerGain` is the same for every skill of a rarity, in every slot.

| Rarity    | Level 1 | Level 2 | Level 3 | Level 4 | Level 5 |
| --------- | ------- | ------- | ------- | ------- | ------- |
| Rare      | 540     | 2,030   | 3,780   | 6,426   | 10,152  |
| Epic      | 720     | 2,707   | 5,040   | 8,568   | 13,536  |
| Legendary | 900     | 3,380   | 6,300   | 10,710  | 16,920  |

The Talent skill `powerGain` is a `0` placeholder. The source states the Power per Legendary hero
level as "all 6 skills", which excludes Talent.

### Exclusive weapon

`exclusiveWeapon` is set on Legendary heroes only. The wiki calls it the Special item. Its
Expedition bonus uses `lethality` and `health` percents, a different stat pair than the Expedition
stats of the hero. It also has a `power` rating and two skills of
`{ name, img, description, unlockLevel? }`. These skills do not scale over 5 levels. Each has one
fixed effect that activates at `unlockLevel`. Most wiki pages state it as a "(Lv. N)" suffix. The
pages of some newer heroes omit it, so `unlockLevel` is not set for them. The Widgets that each
weapon level costs are in [`heroWidgets()`](../hero-widgets/README.md).

### Shard costs and shard power

`shardCosts` has 5 stars of 6 tier costs for every hero. The tier costs are the same for every
rarity, and so are the `total` values, which equal the sum of the tier costs of the star. Each star
also has a `power` field. It is the total Power once the star is reached, not the gain of that star
alone.

`power` is confirmed for Rare and Epic heroes and for every Legendary hero through Generation 4. The
source states only the total Power at the maximum star. Each star's `power` is that total spread
cumulatively by its share of the shards needed to reach the maximum star, on the assumption that
every shard adds the same Power. The standard total is 1,065 shards. Cumulative Power for stars 1 to
5:

| Rarity / hero  | Star 1 | Star 2 | Star 3  | Star 4  | Star 5 (max) |
| -------------- | ------ | ------ | ------- | ------- | ------------ |
| Rare           | 4,222  | 21,111 | 69,667  | 196,335 | 449,670      |
| Epic           | 5,197  | 25,983 | 85,744  | 241,643 | 553,440      |
| Molly / Zinman | 6,496  | 32,479 | 107,180 | 302,054 | 691,800      |
| Natalia        | 7,145  | 35,727 | 117,898 | 332,259 | 760,980      |
| Jeronimo       | 8,120  | 40,599 | 133,975 | 377,567 | 864,750      |
| Generation 2   | 7,795  | 38,975 | 128,616 | 362,464 | 830,160      |
| Generation 3   | 9,744  | 48,718 | 160,770 | 453,080 | 1,037,700    |
| Generation 4   | 12,017 | 60,086 | 198,284 | 558,799 | 1,279,830    |

Legendary Generations 5 to 17 have no confirmed maximum star Power. Their shard `power` is a `0`
placeholder.

Hector, Norah, and Gwen (Generation 5) also have Hero Power read in the game, which is not part of
the table above. `powerAtStarZero` is the Power at star 0 (22,200, twice the level 1 Power of
11,100). `tierPower` on stars 1 to 3 lists the Power at each of the six tiers, 1.1 to 3.6, ending at
449,772. Stars 4 and 5 are not read yet. These readings show that Power per tier is not spread
evenly over the shards, so the cumulative `power` values above are a projection. The reading at tier
3.4 was entered as 352,258. It does not fit the other readings, so 352,314 is stored until it is
checked in the game.

`shardSources` is copied from the "Sources" section of each hero's wiki page, for example
`["VIP Packs"]` or `["Hall of Heroes", "Daily Deals"]`. It is empty for Ling Xue, the one Generation
0 hero whose page has no Sources section.

`shardImg` is set for Gina, Molly, Zinman, Flint, Philly, Alonso, Logan, Reina, Gwen, Wu Ming,
Gordon, Hendrik, and Magnus. The file is `<Name>-Shard.png` in the image folder of the hero. The
matching hero shard item in `items()` points to the same file.

### Level power

`levels` is the 80-level Furnace, XP, and Power progression. `furnaceLevelRequired` is the Furnace
level needed to reach the hero level. `xpRequired` is the Hero XP needed from the previous level,
and it is 0 at level 1. Both are identical for every hero, regardless of rarity, class, or
generation.

`power` is the total Power once the level is reached. It is confirmed through one shared 80-entry
curve, documented in `HeroLevelPowerCurve.md` in the repo root. The gain at level L is
`start * base[L] / 250` with integer division, which is exact for every known start value. `power`
is the running total of the gains. Only the level 1 `start` differs between heroes. It is 3,250 for
Rare and 4,000 for Epic. For Legendary Generations 1 to 5 it is 5,000, 6,000, 7,500, 9,250, and
11,100. The start values of Generations 3 to 5 are marked "projected" in the spec and are not
measured in the game. The `base` array sums to 9,330 and is the same for all heroes. It has dips at
levels 3, 19, 52, and 67 and a jump at level 80.

This reproduces the checkpoint table of the spec for every covered rarity and generation. Rare
levels 10, 40, and 80 give 9,945, 42,185, and 121,290. Legendary Generation 1 gives 15,300, 64,900,
and 186,600. Legendary Generations 6 to 17 have no confirmed start value, and the spec warns against
extrapolating one. Their level `power` is a `0` placeholder.

Jeronimo is a confirmed exception to his generation. His start is 6,250 and not the 5,000 of
Generation 1, so his level 80 total is 233,250 and not 186,600. The `base` array and the formula are
the same.
