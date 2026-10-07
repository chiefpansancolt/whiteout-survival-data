import { calculateHeroUpgrade, HERO_UPGRADE_CALCULATOR } from '@/modules/calculators';
import { heroes } from '@/modules/heroes';

const amount = (resources: { itemId: string; amount: number }[], itemId: string) =>
  resources.find((r) => r.itemId === itemId)?.amount;

describe('calculateHeroUpgrade', () => {
  it('returns zero for a hero with no goal', () => {
    expect(calculateHeroUpgrade({ id: 'hector' })).toEqual({
      stars: { steps: 0, shards: 0 },
      skills: { levels: 0, manuals: [] },
      widgets: { levels: 0, widgets: 0, unlockedSkills: [] },
      resources: [],
      eventPoints: { svs: 0, allianceShowdown: 0, kingOfIcefield: 0, hallOfChief: 0 },
      unmetRequirements: [],
    });
  });

  it('exports the star, tier, and widget level limits', () => {
    expect(HERO_UPGRADE_CALCULATOR).toEqual({ maxStar: 5, maxTier: 5, maxWidgetLevel: 10 });
  });

  describe('stars', () => {
    it('costs the shards of each tier step from the current label to the goal label', () => {
      const result = calculateHeroUpgrade({
        id: 'hector',
        stars: { current: { star: 3, tier: 0 }, goal: { star: 4, tier: 0 } },
      });
      expect(result.stars).toEqual({ steps: 6, shards: 300 });
      expect(result.resources).toEqual([{ itemId: 'mythic-general-hero-shard', amount: 300 }]);
    });

    it('costs the tiers inside a star one by one', () => {
      const result = calculateHeroUpgrade({
        id: 'hector',
        stars: { current: { star: 3, tier: 1 }, goal: { star: 3, tier: 3 } },
      });
      expect(result.stars).toEqual({ steps: 2, shards: 80 });
    });

    it('costs 1065 shards from 0 stars to 5 stars', () => {
      const result = calculateHeroUpgrade({
        id: 'hector',
        stars: { current: { star: 0, tier: 0 }, goal: { star: 5, tier: 0 } },
      });
      expect(result.stars).toEqual({ steps: 30, shards: 1065 });
    });

    it('uses the shard item of the rarity of the hero', () => {
      const epic = calculateHeroUpgrade({
        id: 'sergey',
        stars: { current: { star: 0, tier: 0 }, goal: { star: 1, tier: 0 } },
      });
      expect(epic.resources).toEqual([{ itemId: 'epic-general-hero-shard', amount: 10 }]);
      const rare = calculateHeroUpgrade({
        id: 'smith',
        stars: { current: { star: 0, tier: 0 }, goal: { star: 1, tier: 0 } },
      });
      expect(rare.resources).toEqual([{ itemId: 'rare-general-hero-shard', amount: 10 }]);
    });

    it('costs nothing when the goal is the current label', () => {
      const result = calculateHeroUpgrade({
        id: 'hector',
        stars: { current: { star: 2, tier: 3 }, goal: { star: 2, tier: 3 } },
      });
      expect(result.stars).toEqual({ steps: 0, shards: 0 });
      expect(result.resources).toEqual([]);
    });
  });

  describe('skills', () => {
    it('costs the manuals of the levels after the current level up to the goal', () => {
      const result = calculateHeroUpgrade({
        id: 'hector',
        skills: [
          { name: 'Sword Whirlwind', current: 1, goal: 5 },
          { name: 'Survival Instincts', current: 2, goal: 4 },
        ],
      });
      expect(result.skills.levels).toBe(6);
      expect(amount(result.resources, 'mythic-exploration-skill-manual')).toBe(165);
      expect(amount(result.resources, 'mythic-expedition-skill-manual')).toBe(80);
    });

    it('costs nothing for a skill whose goal is its current level', () => {
      const result = calculateHeroUpgrade({
        id: 'hector',
        skills: [{ name: 'Desperado', current: 3, goal: 3 }],
      });
      expect(result.skills).toEqual({ levels: 0, manuals: [] });
      expect(result.resources).toEqual([]);
    });

    it('adds the manuals of two skills of the same kind', () => {
      const result = calculateHeroUpgrade({
        id: 'hector',
        skills: [
          { name: 'Sword Whirlwind', current: 1, goal: 2 },
          { name: 'Desperado', current: 1, goal: 2 },
        ],
      });
      expect(amount(result.resources, 'mythic-exploration-skill-manual')).toBe(20);
    });

    it('uses the manual items of the rarity of the hero', () => {
      const epic = calculateHeroUpgrade({
        id: 'sergey',
        skills: [{ name: "Defenders' Edge", current: 1, goal: 2 }],
      });
      expect(epic.resources).toEqual([{ itemId: 'epic-expedition-skill-manual', amount: 10 }]);
      const rare = calculateHeroUpgrade({
        id: 'smith',
        skills: [{ name: 'Hammer Burn', current: 1, goal: 2 }],
      });
      expect(rare.resources).toEqual([{ itemId: 'rare-exploration-skill-manual', amount: 10 }]);
    });

    it('lists the levels that need more stars than the star goal', () => {
      const result = calculateHeroUpgrade({
        id: 'hector',
        stars: { current: { star: 1, tier: 0 }, goal: { star: 3, tier: 5 } },
        skills: [{ name: 'Sword Whirlwind', current: 1, goal: 5 }],
      });
      expect(result.unmetRequirements).toEqual([
        { skill: 'Sword Whirlwind', level: 5, starRequired: 4 },
      ]);
    });

    it('does not list a skill level when the star goal is high enough or when there is no star goal', () => {
      const skills = [{ name: 'Sword Whirlwind', current: 1, goal: 5 }];
      expect(
        calculateHeroUpgrade({
          id: 'hector',
          stars: { current: { star: 1, tier: 0 }, goal: { star: 4, tier: 0 } },
          skills,
        }).unmetRequirements,
      ).toEqual([]);
      expect(calculateHeroUpgrade({ id: 'hector', skills }).unmetRequirements).toEqual([]);
    });
  });

  describe('widgets', () => {
    it('costs 275 Widgets from level 0 to level 10', () => {
      const result = calculateHeroUpgrade({ id: 'hector', widgets: { current: 0, goal: 10 } });
      expect(result.widgets).toMatchObject({ levels: 10, widgets: 275 });
    });

    it('costs the Widgets of the levels after the current level and lists the skills it unlocks', () => {
      const result = calculateHeroUpgrade({ id: 'hector', widgets: { current: 4, goal: 6 } });
      expect(result.widgets).toEqual({
        levels: 2,
        widgets: 55,
        unlockedSkills: ["Reaper's Embrace", 'Goliath'],
      });
      const later = calculateHeroUpgrade({ id: 'hector', widgets: { current: 5, goal: 10 } });
      expect(later.widgets.unlockedSkills).toEqual([]);
    });

    it('does not list a skill that has no unlock level', () => {
      const result = calculateHeroUpgrade({ id: 'elif', widgets: { current: 0, goal: 10 } });
      expect(result.widgets.widgets).toBe(275);
      expect(result.widgets.unlockedSkills).toEqual([]);
    });
  });

  describe('event points', () => {
    it('scores the shards that ascend the hero and the Widgets in each event', () => {
      const result = calculateHeroUpgrade({
        id: 'hector',
        stars: { current: { star: 3, tier: 0 }, goal: { star: 4, tier: 0 } },
        widgets: { current: 4, goal: 6 },
      });
      expect(result.eventPoints).toEqual({
        svs: 300 * 3040 + 55 * 8000,
        allianceShowdown: 300 * 1875 + 55 * 3750,
        kingOfIcefield: 300 * 3040 + 55 * 8000,
        hallOfChief: 300 * 35000 + 55 * 100000,
      });
    });

    it('uses the points of the rarity of the hero', () => {
      const result = calculateHeroUpgrade({
        id: 'smith',
        stars: { current: { star: 0, tier: 0 }, goal: { star: 1, tier: 0 } },
      });
      expect(result.eventPoints.svs).toBe(10 * 350);
      expect(
        calculateHeroUpgrade({
          id: 'sergey',
          stars: { current: { star: 0, tier: 0 }, goal: { star: 1, tier: 0 } },
        }).eventPoints.svs,
      ).toBe(10 * 1220);
    });
  });

  it('has the same exclusive weapon in the data for every Legendary hero', () => {
    heroes()
      .byRarity('Legendary')
      .get()
      .forEach((hero) => expect(hero.exclusiveWeapon).toBeDefined());
  });

  it('rejects unknown heroes and skills, bad ranges, repeated skills, and Widgets for a hero with no weapon', () => {
    expect(() => calculateHeroUpgrade({ id: 'nope' })).toThrow('Unknown hero: nope');
    expect(() =>
      calculateHeroUpgrade({ id: 'hector', skills: [{ name: 'Nope', current: 1, goal: 2 }] }),
    ).toThrow('Unknown skill of hector: Nope');
    expect(() =>
      calculateHeroUpgrade({
        id: 'hector',
        skills: [
          { name: 'Desperado', current: 1, goal: 2 },
          { name: 'Desperado', current: 2, goal: 3 },
        ],
      }),
    ).toThrow('More than one goal for the skill Desperado of hector');
    expect(() =>
      calculateHeroUpgrade({ id: 'hector', skills: [{ name: 'Desperado', current: 0, goal: 2 }] }),
    ).toThrow('The current level of hector Desperado must be a whole number from 1 to 5');
    expect(() =>
      calculateHeroUpgrade({ id: 'hector', skills: [{ name: 'Desperado', current: 1, goal: 6 }] }),
    ).toThrow(RangeError);
    expect(() =>
      calculateHeroUpgrade({ id: 'hector', skills: [{ name: 'Desperado', current: 4, goal: 2 }] }),
    ).toThrow('The goal level of hector Desperado must not be below the current level');
    const stars = (current: object, goal: object) =>
      calculateHeroUpgrade({ id: 'hector', stars: { current, goal } as never });
    expect(() => stars({ star: 6, tier: 0 }, { star: 6, tier: 0 })).toThrow(
      'The current star must be a whole number from 0 to 5',
    );
    expect(() => stars({ star: 1, tier: 6 }, { star: 2, tier: 0 })).toThrow(
      'The current tier must be a whole number from 0 to 5',
    );
    expect(() => stars({ star: 1, tier: 0 }, { star: 5, tier: 1 })).toThrow(
      'The goal tier must be 0 at 5 stars',
    );
    expect(() => stars({ star: 2, tier: 0 }, { star: 1, tier: 5 })).toThrow(
      'The goal stars of hector must not be below the current stars',
    );
    expect(() => calculateHeroUpgrade({ id: 'smith', widgets: { current: 0, goal: 1 } })).toThrow(
      'smith has no exclusive weapon to level with Widgets',
    );
    expect(() => calculateHeroUpgrade({ id: 'hector', widgets: { current: 0, goal: 11 } })).toThrow(
      'The goal widget level must be a whole number from 0 to 10',
    );
    expect(() => calculateHeroUpgrade({ id: 'hector', widgets: { current: -1, goal: 3 } })).toThrow(
      RangeError,
    );
    expect(() => calculateHeroUpgrade({ id: 'hector', widgets: { current: 5, goal: 3 } })).toThrow(
      'The goal widget level of hector must not be below the current level',
    );
  });
});
