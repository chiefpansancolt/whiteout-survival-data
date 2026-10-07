import { events } from '@/modules/events';
import { heroWidgets } from '@/modules/hero-widgets';
import { heroes } from '@/modules/heroes';
import {
  Hero,
  HeroRarity,
  HeroSkillGoal,
  HeroStars,
  HeroStarsRange,
  HeroUpgradeCalculation,
  HeroUpgradeEventPoints,
  HeroUpgradeGoal,
  HeroUpgradeSkills,
  HeroUpgradeStars,
  HeroUpgradeWidgets,
  HeroWidgetRange,
  UnmetHeroSkillRequirement,
  UpgradeMaterial,
} from '@/types';

/** The star, tier, and widget level ranges that `calculateHeroUpgrade()` accepts. */
export const HERO_UPGRADE_CALCULATOR = {
  maxStar: 5,
  /** Tiers go from 0 to 5 inside a star, as the in-game star label x.0 to x.5. */
  maxTier: 5,
  maxWidgetLevel: heroWidgets().count(),
} as const;

const TIERS_PER_STAR = HERO_UPGRADE_CALCULATOR.maxTier + 1;

const RARITY_ITEM_PREFIX: Record<HeroRarity, string> = {
  Legendary: 'mythic',
  Epic: 'epic',
  Rare: 'rare',
};

const RARITY_EVENT_NAME: Record<HeroRarity, string> = {
  Legendary: 'Mythic',
  Epic: 'Epic',
  Rare: 'Rare',
};

const EVENT_IDS: Record<keyof HeroUpgradeEventPoints, string> = {
  svs: 'svs-state-of-power',
  allianceShowdown: 'alliance-showdown',
  kingOfIcefield: 'king-of-icefield',
  hallOfChief: 'hall-of-chief',
};

function starIndex(name: string, stars: HeroStars): number {
  const { maxStar, maxTier } = HERO_UPGRADE_CALCULATOR;
  if (!Number.isInteger(stars.star) || stars.star < 0 || stars.star > maxStar) {
    throw new RangeError(`The ${name} star must be a whole number from 0 to ${maxStar}`);
  }
  if (!Number.isInteger(stars.tier) || stars.tier < 0 || stars.tier > maxTier) {
    throw new RangeError(`The ${name} tier must be a whole number from 0 to ${maxTier}`);
  }
  if (stars.star === maxStar && stars.tier > 0) {
    throw new RangeError(`The ${name} tier must be 0 at ${maxStar} stars`);
  }
  return stars.star * TIERS_PER_STAR + stars.tier;
}

function starsResult(hero: Hero, range?: HeroStarsRange): HeroUpgradeStars {
  if (range === undefined) return { steps: 0, shards: 0 };
  const from = starIndex('current', range.current);
  const to = starIndex('goal', range.goal);
  if (to < from) {
    throw new RangeError(`The goal stars of ${hero.id} must not be below the current stars`);
  }
  let shards = 0;
  for (let step = from; step < to; step++) {
    shards += hero.shardCosts[Math.floor(step / TIERS_PER_STAR)].tierCosts[step % TIERS_PER_STAR];
  }
  return { steps: to - from, shards };
}

function checkSkillLevel(owner: string, name: string, level: number, max: number): void {
  if (!Number.isInteger(level) || level < 1 || level > max) {
    throw new RangeError(`The ${name} level of ${owner} must be a whole number from 1 to ${max}`);
  }
}

function skillsResult(
  hero: Hero,
  goals: HeroSkillGoal[],
  starGoal?: HeroStars,
): { skills: HeroUpgradeSkills; unmet: UnmetHeroSkillRequirement[] } {
  const unmet: UnmetHeroSkillRequirement[] = [];
  const manuals = new Map<string, number>();
  let levels = 0;
  goals.forEach((goal, index) => {
    if (goals.findIndex((other) => other.name === goal.name) !== index) {
      throw new Error(`More than one goal for the skill ${goal.name} of ${hero.id}`);
    }
    const kind = hero.skills.exploration.some((s) => s.name === goal.name)
      ? 'exploration'
      : 'expedition';
    const skill = hero.skills[kind].find((s) => s.name === goal.name);
    if (skill === undefined) throw new Error(`Unknown skill of ${hero.id}: ${goal.name}`);
    const owner = `${hero.id} ${skill.name}`;
    checkSkillLevel(owner, 'current', goal.current, skill.levels.length);
    checkSkillLevel(owner, 'goal', goal.goal, skill.levels.length);
    if (goal.goal < goal.current) {
      throw new RangeError(`The goal level of ${owner} must not be below the current level`);
    }
    const steps = skill.levels.slice(goal.current, goal.goal);
    const itemId = `${RARITY_ITEM_PREFIX[hero.rarity]}-${kind}-skill-manual`;
    const amount = steps.reduce((sum, l) => sum + l.manualsRequired, 0);
    if (amount > 0) manuals.set(itemId, (manuals.get(itemId) ?? 0) + amount);
    levels += steps.length;
    if (starGoal !== undefined) {
      steps
        .filter((l) => l.starRequired > starGoal.star)
        .forEach((l) =>
          unmet.push({ skill: skill.name, level: l.level, starRequired: l.starRequired }),
        );
    }
  });
  return {
    skills: { levels, manuals: [...manuals].map(([itemId, amount]) => ({ itemId, amount })) },
    unmet,
  };
}

function widgetsResult(hero: Hero, range?: HeroWidgetRange): HeroUpgradeWidgets {
  if (range === undefined) return { levels: 0, widgets: 0, unlockedSkills: [] };
  if (hero.exclusiveWeapon === undefined) {
    throw new Error(`${hero.id} has no exclusive weapon to level with Widgets`);
  }
  const max = HERO_UPGRADE_CALCULATOR.maxWidgetLevel;
  [
    ['current', range.current],
    ['goal', range.goal],
  ].forEach(([name, level]) => {
    if (!Number.isInteger(level) || (level as number) < 0 || (level as number) > max) {
      throw new RangeError(`The ${name} widget level must be a whole number from 0 to ${max}`);
    }
  });
  if (range.goal < range.current) {
    throw new RangeError(`The goal widget level of ${hero.id} must not be below the current level`);
  }
  const steps = heroWidgets()
    .get()
    .filter((l) => l.level > range.current && l.level <= range.goal);
  return {
    levels: steps.length,
    widgets: steps.reduce((sum, l) => sum + l.widgets, 0),
    unlockedSkills: hero.exclusiveWeapon.skills
      .filter(
        (s) =>
          s.unlockLevel !== undefined &&
          s.unlockLevel > range.current &&
          s.unlockLevel <= range.goal,
      )
      .map((s) => s.name),
  };
}

function eventPoints(hero: Hero, shards: number, widgets: number): HeroUpgradeEventPoints {
  const shardPattern = new RegExp(
    `^Use 1 ${RARITY_EVENT_NAME[hero.rarity]} Hero Shard to ascend Heroes`,
  );
  const pointsFor = (eventId: string, pattern: RegExp) =>
    events()
      .find(eventId)!
      .days!.flatMap((day) => day.scoring)
      .find((row) => pattern.test(row.action))!.points;
  const result = {} as HeroUpgradeEventPoints;
  (Object.keys(EVENT_IDS) as (keyof HeroUpgradeEventPoints)[]).forEach((key) => {
    result[key] =
      shards * pointsFor(EVENT_IDS[key], shardPattern) +
      widgets * pointsFor(EVENT_IDS[key], /^Use 1 Widget of any Hero Exclusive Gear/);
  });
  return result;
}

/**
 * Calculates the shards, skill manuals, Widgets, and event points to upgrade one hero.
 *
 * A star label `x.y` is the star `x` and the tier `y`, and 5.0 is the last label. Each step to the next
 * label costs the shards of that tier, counted as the general shard item of the rarity. A skill level
 * costs the manuals of the rarity of the hero. When the goal has `stars`, skill levels that need a higher
 * star are listed in `unmetRequirements`. Widgets level the exclusive weapon. Power is not included.
 *
 * @param goal The hero and the star, skill, and Widget ranges to upgrade.
 * @throws Error when the hero or a skill does not exist, when two skill goals name the same skill, or
 * when Widgets are planned for a hero with no exclusive weapon.
 * @throws RangeError when a star, tier, skill level, or widget level is out of range, or a goal is below
 * its current value.
 * @see docs/hero-upgrade.md
 */
export function calculateHeroUpgrade(goal: HeroUpgradeGoal): HeroUpgradeCalculation {
  const hero = heroes().find(goal.id);
  if (hero === undefined) throw new Error(`Unknown hero: ${goal.id}`);
  const stars = starsResult(hero, goal.stars);
  const { skills, unmet } = skillsResult(hero, goal.skills ?? [], goal.stars?.goal);
  const widgets = widgetsResult(hero, goal.widgets);
  const resources: UpgradeMaterial[] = [
    ...(stars.shards > 0
      ? [{ itemId: `${RARITY_ITEM_PREFIX[hero.rarity]}-general-hero-shard`, amount: stars.shards }]
      : []),
    ...skills.manuals,
  ];
  return {
    stars,
    skills,
    widgets,
    resources,
    eventPoints: eventPoints(hero, stars.shards, widgets.widgets),
    unmetRequirements: unmet,
  };
}
