import { Hero, HeroStatEstimate } from '@/types';

/** The star, tier, and level ranges that `estimateHeroStats()` accepts. */
export const HERO_STAT_ESTIMATE = {
  /** The only hero level the estimate covers. */
  level: 80,
  maxStar: 5,
  /** Tiers go from 0 to 5 inside a star, as the in-game star label x.0 to x.5. */
  maxTier: 5,
} as const;

/*
 * The estimate is the formula of the WoS Tools Hero Hub compare tab with the star growth of the
 * Exploration stats changed from 1.4 to 1.376, fitted to Hector at level 80 and 3.0 to 3.3 stars.
 * A hero's stats are scaled by the ratio of its own 5-star stats to the reference stats below, and
 * the stats at a star are:
 *
 *   ratio * (zeroStar + firstStep * (growth^star - 1) / (growth - 1) + tier * tierShare * firstStep * growth^star + skillBonus)
 *
 * The first star step of the Exploration stats makes the reference 5-star stats exact.
 */
const TIER_SHARE = 0.147;
const REFERENCE = { attack: 4928, defense: 4928, health: 49284, expedition: 444.35 };
const ZERO_STAR = { attack: 199, defense: 199, health: 1990, expedition: 56.05 };
const SKILL_BONUS = { attack: 1084, defense: 1084, health: 10840, expedition: 0 };
const EXPLORATION_GROWTH = 1.376;
const EXPEDITION_GROWTH = 1.4;
const EXPEDITION_FIRST_STEP = 35.44;

type StatName = keyof typeof REFERENCE;

const growthOf = (stat: StatName): number =>
  stat === 'expedition' ? EXPEDITION_GROWTH : EXPLORATION_GROWTH;

const geometricSum = (growth: number, stars: number): number =>
  (growth ** stars - 1) / (growth - 1);

function firstStep(stat: StatName): number {
  if (stat === 'expedition') return EXPEDITION_FIRST_STEP;
  const growth = growthOf(stat);
  return (
    (REFERENCE[stat] - ZERO_STAR[stat] - SKILL_BONUS[stat]) /
    geometricSum(growth, HERO_STAT_ESTIMATE.maxStar)
  );
}

function statAt(stat: StatName, ratio: number, star: number, tier: number): number {
  const growth = growthOf(stat);
  const step = firstStep(stat);
  return (
    ratio *
    (ZERO_STAR[stat] +
      step * geometricSum(growth, star) +
      tier * TIER_SHARE * step * growth ** star +
      SKILL_BONUS[stat])
  );
}

function checkWholeNumber(name: string, value: number, max: number): void {
  if (!Number.isInteger(value) || value < 0 || value > max) {
    throw new RangeError(`${name} must be a whole number from 0 to ${max}`);
  }
}

/**
 * Estimates a hero's stats at hero level 80 for a star and tier below the maximum.
 *
 * The stats stored on a hero are the 5-star stats. Every other state is an estimate that scales those
 * stats down with the formula of the WoS Tools Hero Hub, with the Exploration star growth fitted to
 * Hector at 3.0 to 3.3 stars. It has not been checked at other stars, other heroes, or other levels,
 * and it does not include gear or skill bonuses from outside the formula.
 *
 * @param hero The hero to estimate.
 * @param star Whole stars from 0 to 5.
 * @param tier The tier inside the star, from 0 to 5, as the in-game label `star.tier`. Use 0 at 5 stars.
 * @returns Exploration stats as whole numbers and Expedition stats in percent with 2 decimals. At 5
 * stars, the stats stored on the hero.
 * @throws RangeError when `star` or `tier` is not a whole number in range, or `tier` is above 0 at 5 stars.
 */
export function estimateHeroStats(hero: Hero, star: number, tier = 0): HeroStatEstimate {
  checkWholeNumber('star', star, HERO_STAT_ESTIMATE.maxStar);
  checkWholeNumber('tier', tier, HERO_STAT_ESTIMATE.maxTier);
  if (star === HERO_STAT_ESTIMATE.maxStar && tier > 0) {
    throw new RangeError('tier must be 0 at 5 stars');
  }
  const base = { level: HERO_STAT_ESTIMATE.level, star, tier };
  if (star === HERO_STAT_ESTIMATE.maxStar) {
    return {
      ...base,
      estimated: false,
      exploration: { ...hero.stats.exploration },
      expedition: { ...hero.stats.expedition },
    };
  }
  const ratio = {
    attack: hero.stats.exploration.attack / REFERENCE.attack,
    defense: hero.stats.exploration.defense / REFERENCE.defense,
    health: hero.stats.exploration.health / REFERENCE.health,
    expedition: hero.stats.expedition.defense / REFERENCE.expedition,
  };
  const at = (stat: StatName) => statAt(stat, ratio[stat], star, tier);
  return {
    ...base,
    estimated: true,
    exploration: {
      attack: Math.round(at('attack')),
      defense: Math.round(at('defense')),
      health: Math.round(at('health')),
    },
    expedition: {
      attack: Math.round(at('expedition') * 100) / 100,
      defense: Math.round(at('expedition') * 100) / 100,
    },
  };
}
