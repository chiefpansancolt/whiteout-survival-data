import { estimateHeroStats, HERO_STAT_ESTIMATE, heroes } from '@/modules/heroes';

const hector = () => heroes().findByName('Hector')!;
const relativeError = (value: number, expected: number) => Math.abs(value - expected) / expected;

describe('estimateHeroStats', () => {
  it('returns the stats stored on the hero at 5 stars', () => {
    const result = estimateHeroStats(hector(), 5);
    expect(result).toEqual({
      level: 80,
      star: 5,
      tier: 0,
      estimated: false,
      exploration: { attack: 3780, defense: 4928, health: 73926 },
      expedition: { attack: 444.35, defense: 444.35 },
    });
    expect(result.exploration).not.toBe(hector().stats.exploration);
  });

  it('estimates the other states for hero level 80', () => {
    const result = estimateHeroStats(hector(), 3, 1);
    expect(result).toMatchObject({ level: 80, star: 3, tier: 1, estimated: true });
  });

  it('lands within 0.5 percent of the in-game numbers of Hector at 3.0', () => {
    const { exploration, expedition } = estimateHeroStats(hector(), 3);
    expect(relativeError(exploration.attack, 2130)).toBeLessThan(0.005);
    expect(relativeError(exploration.defense, 2765)).toBeLessThan(0.005);
    expect(relativeError(exploration.health, 41569)).toBeLessThan(0.005);
    expect(relativeError(expedition.attack, 210.72)).toBeLessThan(0.005);
    expect(expedition.defense).toBe(expedition.attack);
  });

  it('matches the promotion previews of Hector from 3.0 to 3.1 and from 3.2 to 3.3', () => {
    const state = (tier: number) => estimateHeroStats(hector(), 3, tier);
    const step = (from: number, to: number) => ({
      attack: state(to).exploration.attack - state(from).exploration.attack,
      defense: state(to).exploration.defense - state(from).exploration.defense,
      health: state(to).exploration.health - state(from).exploration.health,
      expedition: state(to).expedition.attack - state(from).expedition.attack,
    });
    [step(0, 1), step(2, 3)].forEach((s) => {
      expect(Math.abs(s.attack - 102)).toBeLessThanOrEqual(2);
      expect(Math.abs(s.defense - 133)).toBeLessThanOrEqual(2);
      expect(Math.abs(s.health - 1998)).toBeLessThanOrEqual(25);
      expect(Math.abs(s.expedition - 14.31)).toBeLessThanOrEqual(0.1);
    });
  });

  it('estimates the stats of Hector at 0 stars', () => {
    const { exploration, expedition } = estimateHeroStats(hector(), 0);
    expect(exploration).toEqual({ attack: 984, defense: 1283, health: 19245 });
    expect(expedition).toEqual({ attack: 56.05, defense: 56.05 });
  });

  it('rounds Exploration stats to whole numbers and Expedition stats to 2 decimals', () => {
    const { exploration, expedition } = estimateHeroStats(hector(), 2, 3);
    Object.values(exploration).forEach((v) => expect(Number.isInteger(v)).toBe(true));
    expect(Number(expedition.attack.toFixed(2))).toBe(expedition.attack);
  });

  it('raises every stat with each tier and star and stays below the 5-star stats', () => {
    heroes()
      .get()
      .forEach((hero) => {
        const states: ReturnType<typeof estimateHeroStats>[] = [];
        for (let star = 0; star < HERO_STAT_ESTIMATE.maxStar; star++) {
          for (let tier = 0; tier <= HERO_STAT_ESTIMATE.maxTier; tier++) {
            states.push(estimateHeroStats(hero, star, tier));
          }
        }
        states.push(estimateHeroStats(hero, 5));
        states.slice(1).forEach((state, i) => {
          const before = states[i];
          expect(state.exploration.attack).toBeGreaterThan(before.exploration.attack);
          expect(state.exploration.defense).toBeGreaterThan(before.exploration.defense);
          expect(state.exploration.health).toBeGreaterThan(before.exploration.health);
          expect(state.expedition.attack).toBeGreaterThanOrEqual(before.expedition.attack);
        });
        const max = hero.stats.exploration;
        expect(states[states.length - 2].exploration.attack).toBeLessThan(max.attack);
      });
  });

  it('scales a hero by the ratio of its own 5-star stats', () => {
    const smith = heroes().findByName('Smith')!;
    const at = estimateHeroStats(smith, 0).exploration;
    expect(at.health).toBe(Math.round(((1990 + 10840) * smith.stats.exploration.health) / 49284));
  });

  it('rejects a star or tier out of range, and a tier above 0 at 5 stars', () => {
    [-1, 6, 1.5, Number.NaN].forEach((star) =>
      expect(() => estimateHeroStats(hector(), star)).toThrow(
        'star must be a whole number from 0 to 5',
      ),
    );
    [-1, 6, 2.5].forEach((tier) =>
      expect(() => estimateHeroStats(hector(), 2, tier)).toThrow(
        'tier must be a whole number from 0 to 5',
      ),
    );
    expect(() => estimateHeroStats(hector(), 5, 1)).toThrow('tier must be 0 at 5 stars');
  });

  it('exports the ranges it accepts', () => {
    expect(HERO_STAT_ESTIMATE).toEqual({ level: 80, maxStar: 5, maxTier: 5 });
  });
});
