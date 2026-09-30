import { heroes, HeroQuery } from '@/modules/heroes';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('heroes', () => heroes());

describe('HeroQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = heroes().get().slice(0, 1);
    expect(new HeroQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new HeroQuery().count()).toBeGreaterThan(0);
  });

  it('byRarity() filters to the given rarity', () => {
    const rares = heroes().byRarity('Rare');
    expect(rares.count()).toBeGreaterThan(0);
    expect(rares.get().every((h) => h.rarity === 'Rare')).toBe(true);
  });

  it('byClass() filters to the given class', () => {
    const infantry = heroes().byClass('Infantry');
    expect(infantry.count()).toBeGreaterThan(0);
    expect(infantry.get().every((h) => h.class === 'Infantry')).toBe(true);
  });
});

describe('Generation 0 heroes', () => {
  it('tracks all 13 Generation 0 heroes', () => {
    expect(
      heroes()
        .get()
        .filter((h) => h.generation === 0),
    ).toHaveLength(13);
  });

  it('has no exclusive weapon on Rare or Epic heroes', () => {
    const nonLegendary = heroes()
      .get()
      .filter((h) => h.rarity !== 'Legendary');
    expect(nonLegendary.every((h) => h.exclusiveWeapon === undefined)).toBe(true);
  });

  it('stores subClass per hero rather than deriving it from rarity or class', () => {
    const jasser = heroes().findByName('Jasser')!;
    const gina = heroes().findByName('Gina')!;
    expect(jasser.class).toBe('Marksman');
    expect(gina.class).toBe('Marksman');
    expect(jasser.subClass).toBe('Growth');
    expect(gina.subClass).toBe('Combat');
  });

  it('has a 5-star shard cost table for every hero', () => {
    const smith = heroes().findByName('Smith')!;
    expect(smith.shardCosts).toHaveLength(5);
    expect(smith.shardCosts[0].total).toBe(10);
    expect(smith.shardCosts[4].total).toBe(600);
  });

  it('every shard tier total matches the sum of its own tierCosts', () => {
    heroes()
      .get()
      .forEach((h) => {
        h.shardCosts.forEach((tier) => {
          const tierCostSum = tier.tierCosts.reduce((sum, cost) => sum + cost, 0);
          expect(tier.total).toBe(tierCostSum);
        });
      });
  });

  const CONFIRMED_LEGENDARY_STAR_POWER = [
    'Molly',
    'Zinman',
    'Jeronimo',
    'Natalia',
    'Flint',
    'Philly',
    'Alonso',
    'Logan',
    'Mia',
    'Greg',
    'Ahmose',
    'Reina',
    'Lynn',
  ];

  it('carries a power placeholder on every Legendary shard tier, except the confirmed Generation 1-4 curves', () => {
    heroes()
      .get()
      .filter((h) => h.rarity === 'Legendary' && !CONFIRMED_LEGENDARY_STAR_POWER.includes(h.name))
      .forEach((h) => {
        h.shardCosts.forEach((tier) => {
          expect(tier.power).toBe(0);
        });
      });
  });

  it('accumulates Molly and Zinman shard tier power, weighted by shard count, up to the confirmed 691,800 at max star', () => {
    const cumulativePowerByStar = { 1: 6496, 2: 32479, 3: 107180, 4: 302054, 5: 691800 };
    ['Molly', 'Zinman'].forEach((name) => {
      const h = heroes().findByName(name)!;
      h.shardCosts.forEach((tier) => {
        expect(tier.power).toBe(
          cumulativePowerByStar[tier.star as keyof typeof cumulativePowerByStar],
        );
      });
      expect(h.shardCosts[h.shardCosts.length - 1].power).toBe(691800);
    });
  });

  it('accumulates Jeronimo shard tier power, weighted by shard count, up to the confirmed 864,750 at max star', () => {
    const cumulativePowerByStar = { 1: 8120, 2: 40599, 3: 133975, 4: 377567, 5: 864750 };
    const jeronimo = heroes().findByName('Jeronimo')!;
    jeronimo.shardCosts.forEach((tier) => {
      expect(tier.power).toBe(
        cumulativePowerByStar[tier.star as keyof typeof cumulativePowerByStar],
      );
    });
    expect(jeronimo.shardCosts[jeronimo.shardCosts.length - 1].power).toBe(864750);
  });

  it('accumulates Natalia shard tier power, weighted by shard count, up to the confirmed 760,980 at max star', () => {
    const cumulativePowerByStar = { 1: 7145, 2: 35727, 3: 117898, 4: 332259, 5: 760980 };
    const natalia = heroes().findByName('Natalia')!;
    natalia.shardCosts.forEach((tier) => {
      expect(tier.power).toBe(
        cumulativePowerByStar[tier.star as keyof typeof cumulativePowerByStar],
      );
    });
    expect(natalia.shardCosts[natalia.shardCosts.length - 1].power).toBe(760980);
  });

  it('accumulates Generation 2-4 shard tier power, weighted by shard count, up to each generation’s confirmed max star', () => {
    const cumulativePowerByGenAndStar: Record<number, Record<number, number>> = {
      2: { 1: 7795, 2: 38975, 3: 128616, 4: 362464, 5: 830160 },
      3: { 1: 9744, 2: 48718, 3: 160770, 4: 453080, 5: 1037700 },
      4: { 1: 12017, 2: 60086, 3: 198284, 4: 558799, 5: 1279830 },
    };
    Object.entries(cumulativePowerByGenAndStar).forEach(([gen, cumulativePowerByStar]) => {
      heroes()
        .get()
        .filter((h) => h.generation === Number(gen))
        .forEach((h) => {
          h.shardCosts.forEach((tier) => {
            expect(tier.power).toBe(cumulativePowerByStar[tier.star]);
          });
          expect(h.shardCosts[h.shardCosts.length - 1].power).toBe(cumulativePowerByStar[5]);
        });
    });
  });

  it('accumulates Rare shard tier power, weighted by shard count, up to the confirmed 449,670 at max star', () => {
    const cumulativePowerByStar = { 1: 4222, 2: 21111, 3: 69667, 4: 196335, 5: 449670 };
    heroes()
      .byRarity('Rare')
      .get()
      .forEach((h) => {
        h.shardCosts.forEach((tier) => {
          expect(tier.power).toBe(
            cumulativePowerByStar[tier.star as keyof typeof cumulativePowerByStar],
          );
        });
        expect(h.shardCosts[h.shardCosts.length - 1].power).toBe(449670);
      });
  });

  it('accumulates Epic shard tier power, weighted by shard count, up to the confirmed 553,440 at max star', () => {
    const cumulativePowerByStar = { 1: 5197, 2: 25983, 3: 85744, 4: 241643, 5: 553440 };
    heroes()
      .byRarity('Epic')
      .get()
      .forEach((h) => {
        h.shardCosts.forEach((tier) => {
          expect(tier.power).toBe(
            cumulativePowerByStar[tier.star as keyof typeof cumulativePowerByStar],
          );
        });
        expect(h.shardCosts[h.shardCosts.length - 1].power).toBe(553440);
      });
  });

  it('covers 80 hero levels with the shared Furnace/XP curve, identical across every hero', () => {
    heroes()
      .get()
      .forEach((h) => {
        expect(h.levels).toHaveLength(80);
        expect(h.levels.map((l) => l.level)).toEqual(Array.from({ length: 80 }, (_, i) => i + 1));
        expect(h.levels[0]).toMatchObject({ furnaceLevelRequired: 4, xpRequired: 0 });
        expect(h.levels[79]).toMatchObject({ furnaceLevelRequired: 26, xpRequired: 2400000 });
      });

    const smithLevels = heroes().findByName('Smith')!.levels;
    const eugeneLevels = heroes().findByName('Eugene')!.levels;
    expect(smithLevels.map((l) => [l.furnaceLevelRequired, l.xpRequired])).toEqual(
      eugeneLevels.map((l) => [l.furnaceLevelRequired, l.xpRequired]),
    );
  });

  it('has a confirmed max-level Power for every Generation 0 hero', () => {
    const maxLevelPower = (name: string) => heroes().findByName(name)!.levels[79].power;

    expect(maxLevelPower('Smith')).toBe(121290);
    expect(maxLevelPower('Cloris')).toBe(121290);
    expect(maxLevelPower('Charlie')).toBe(121290);
    expect(maxLevelPower('Eugene')).toBe(121290);

    const epicMaxPower = 149280;
    [
      'Sergey',
      'Jessie',
      'Patrick',
      'Lumak Bokan',
      'Ling Xue',
      'Gina',
      'Bahiti',
      'Jasser',
      'Seo-yoon',
    ].forEach((name) => {
      expect(maxLevelPower(name)).toBe(epicMaxPower);
    });
  });

  it('follows the confirmed shared 80-level Power curve (base[L] * start / 250, running total) for Rare and Epic', () => {
    // Per HeroLevelPowerCurve.md: base[L] is the same 80-entry curve for every hero; only the
    // Level-1 start value (Rare 3250, Epic 4000) differs. Checkpoints below are copied from that
    // spec's verification table.
    const checkpoints = {
      Rare: { 10: 9945, 20: 18850, 40: 42185, 60: 74815, 80: 121290 },
      Epic: { 10: 12240, 20: 23200, 40: 51920, 60: 92080, 80: 149280 },
    };

    (['Rare', 'Epic'] as const).forEach((rarity) => {
      heroes()
        .byRarity(rarity)
        .get()
        .forEach((h) => {
          Object.entries(checkpoints[rarity]).forEach(([level, power]) => {
            expect(h.levels[Number(level) - 1].power).toBe(power);
          });
          // Power climbs monotonically level over level, never resetting or double-counting.
          for (let i = 1; i < h.levels.length; i++) {
            expect(h.levels[i].power).toBeGreaterThan(h.levels[i - 1].power);
          }
        });
    });

    expect(heroes().findByName('Smith')!.levels[1].power).toBe(3965);
    expect(heroes().findByName('Sergey')!.levels[1].power).toBe(4880);
  });

  it('gives every skill a 5-level manuals table, matching its description’s 5 slash-separated values', () => {
    const smith = heroes().findByName('Smith')!;
    const hammerBurn = smith.skills.exploration.find((s) => s.name === 'Hammer Burn')!;
    expect(hammerBurn.levels).toHaveLength(5);
    expect(hammerBurn.levels.map((l) => l.level)).toEqual([1, 2, 3, 4, 5]);
    expect(hammerBurn.levels.map((l) => l.manualsRequired)).toEqual([0, 10, 30, 50, 75]);
  });

  it('gives every Rare skill the confirmed per-level Power Gain table (540/2,030/3,780/6,426/10,152)', () => {
    const powerByLevel = { 1: 540, 2: 2030, 3: 3780, 4: 6426, 5: 10152 };
    heroes()
      .byRarity('Rare')
      .get()
      .forEach((h) => {
        [...h.skills.exploration, ...h.skills.expedition].forEach((skill) => {
          skill.levels.forEach((l) => {
            expect(l.powerGain).toBe(powerByLevel[l.level as keyof typeof powerByLevel]);
          });
        });
      });
  });

  it('gives every Epic skill the confirmed per-level Power Gain table (720/2,707/5,040/8,568/13,536)', () => {
    const powerByLevel = { 1: 720, 2: 2707, 3: 5040, 4: 8568, 5: 13536 };
    heroes()
      .byRarity('Epic')
      .get()
      .forEach((h) => {
        [...h.skills.exploration, ...h.skills.expedition].forEach((skill) => {
          skill.levels.forEach((l) => {
            expect(l.powerGain).toBe(powerByLevel[l.level as keyof typeof powerByLevel]);
          });
        });
      });
  });

  it('gives every Legendary exploration/expedition skill the confirmed per-level Power Gain table (900/3,380/6,300/10,710/16,920)', () => {
    const powerByLevel = { 1: 900, 2: 3380, 3: 6300, 4: 10710, 5: 16920 };
    heroes()
      .byRarity('Legendary')
      .get()
      .forEach((h) => {
        [...h.skills.exploration, ...h.skills.expedition].forEach((skill) => {
          skill.levels.forEach((l) => {
            expect(l.powerGain).toBe(powerByLevel[l.level as keyof typeof powerByLevel]);
          });
        });
      });
  });

  it('leaves manualsRequired and powerGain at 0 for the Talent skill (no manuals needed, no confirmed power)', () => {
    ['Jeronimo', 'Natalia'].forEach((name) => {
      heroes()
        .findByName(name)!
        .skills.talent!.levels.forEach((l) => {
          expect(l.manualsRequired).toBe(0);
          expect(l.powerGain).toBe(0);
        });
    });
  });

  it('gates each exploration/expedition skill slot behind its own star requirement per level', () => {
    const starByGroupAndSlot = {
      exploration: [
        [0, 1, 2, 3, 4],
        [1, 1, 2, 3, 4],
        [2, 2, 2, 3, 4],
      ],
      expedition: [
        [1, 1, 2, 3, 4],
        [1, 1, 2, 3, 4],
        [2, 2, 2, 3, 4],
      ],
    };
    heroes()
      .get()
      .forEach((h) => {
        (['exploration', 'expedition'] as const).forEach((group) => {
          h.skills[group].forEach((skill, slotIndex) => {
            const expected = starByGroupAndSlot[group][slotIndex];
            expect(skill.levels.map((l) => l.starRequired)).toEqual(expected);
          });
        });
      });
  });

  it('carries the same 5-level table on every skill across exploration, expedition, and talent', () => {
    heroes()
      .get()
      .forEach((h) => {
        const allSkills = [
          ...h.skills.exploration,
          ...h.skills.expedition,
          ...(h.skills.talent ? [h.skills.talent] : []),
        ];
        allSkills.forEach((skill) => {
          expect(skill.levels).toHaveLength(5);
        });
      });
  });
});

describe('Generation 1-17 heroes (Legendary)', () => {
  it('tracks all 65 heroes total, 52 of them Legendary across Generations 1-17', () => {
    expect(heroes().count()).toBe(65);
    expect(heroes().byRarity('Legendary').count()).toBe(52);
    for (let gen = 1; gen <= 17; gen++) {
      const inGen = heroes()
        .get()
        .filter((h) => h.generation === gen);
      expect(inGen).toHaveLength(gen === 1 ? 4 : 3);
    }
  });

  it('Generation 1 has 4 heroes, 2 of them Infantry (Jeronimo and Natalia)', () => {
    const gen1 = heroes()
      .get()
      .filter((h) => h.generation === 1);
    const infantry = gen1.filter((h) => h.class === 'Infantry');
    expect(infantry.map((h) => h.name).sort()).toEqual(['Jeronimo', 'Natalia']);
    expect(gen1.filter((h) => h.class === 'Lancer')).toHaveLength(1);
    expect(gen1.filter((h) => h.class === 'Marksman')).toHaveLength(1);
  });

  it('every Legendary hero has an exclusiveWeapon and non-empty shardSources', () => {
    heroes()
      .byRarity('Legendary')
      .get()
      .forEach((h) => {
        expect(h.exclusiveWeapon).toBeDefined();
        expect(h.shardSources.length).toBeGreaterThan(0);
      });
  });

  it('every Legendary hero has 3 exploration + 3 expedition skills, but only Jeronimo and Natalia have a Talent skill', () => {
    heroes()
      .byRarity('Legendary')
      .get()
      .forEach((h) => {
        expect(h.skills.exploration).toHaveLength(3);
        expect(h.skills.expedition).toHaveLength(3);
        const expectsTalent = h.name === 'Jeronimo' || h.name === 'Natalia';
        expect(h.skills.talent !== undefined).toBe(expectsTalent);
      });
  });

  it('confirms Jeronimo against the exact scraped wiki values', () => {
    const jeronimo = heroes().findByName('Jeronimo')!;
    expect(jeronimo).toMatchObject({
      rarity: 'Legendary',
      class: 'Infantry',
      subClass: 'Combat',
      generation: 1,
      shardSources: ['VIP Packs'],
    });
    expect(jeronimo.stats.exploration).toEqual({ attack: 2128, defense: 2220, health: 41624 });
    expect(jeronimo.stats.expedition).toEqual({ attack: 260.2, defense: 260.2 });

    const comboSlash = jeronimo.skills.exploration.find((s) => s.name === 'Combo Slash')!;
    expect(comboSlash.description).toContain('160%/176%/192%/208%/224%');
    expect(comboSlash.levels.map((l) => l.starRequired)).toEqual([0, 1, 2, 3, 4]);

    expect(jeronimo.exclusiveWeapon).toMatchObject({ name: 'Dawnbreak', power: 281250 });
    expect(jeronimo.exclusiveWeapon!.stats).toEqual({
      exploration: { attack: 431, defense: 562, health: 8437 },
      expedition: { lethality: 62.5, health: 62.5 },
    });
    expect(jeronimo.exclusiveWeapon!.skills).toEqual([
      {
        name: 'Shield of Swords',
        img: '/images/heroes/Jeronimo/weapons/Jeronimo-ShieldOfSwords.png',
        description:
          "When attacking, Jeronimo's sword energy forms a shield, reducing his damage received by 30%.",
        unlockLevel: 5,
      },
      {
        name: 'Discernment',
        img: '/images/heroes/Jeronimo/weapons/Jeronimo-Discernment.png',
        description:
          "Jeronimo attacks with a sword formation, increasing Rally Troops' attack by 15%.",
        unlockLevel: 5,
      },
    ]);

    expect(jeronimo.shardCosts[0]).toEqual({
      star: 1,
      tierCosts: [1, 1, 2, 2, 2, 2],
      total: 10,
      power: 8120,
    });
    expect(jeronimo.shardCosts[4].total).toBe(600);
    expect(jeronimo.shardCosts[4].power).toBe(864750);
  });

  it('omits unlockLevel on the handful of exclusive weapon skills whose wiki page states no "(Lv. N)" requirement', () => {
    const dominic = heroes().findByName('Dominic')!;
    dominic.exclusiveWeapon!.skills.forEach((skill) => {
      expect(skill.unlockLevel).toBeUndefined();
      expect(skill.name).not.toMatch(/\(Lv\./);
    });
  });

  it('fills levels[].power for Generations 1-5 via the shared curve, matching HeroLevelPowerCurve.md checkpoints, and leaves 0 for Generations 6-17', () => {
    const maxPowerByGen: Record<number, number> = {
      1: 186600,
      2: 223920,
      3: 279900,
      4: 345210,
      5: 414252,
    };
    for (let gen = 1; gen <= 5; gen++) {
      heroes()
        .get()
        .filter((h) => h.generation === gen && h.name !== 'Jeronimo')
        .forEach((h) => {
          expect(h.levels[79].power).toBe(maxPowerByGen[gen]);
          for (let i = 1; i < h.levels.length; i++) {
            expect(h.levels[i].power).toBeGreaterThan(h.levels[i - 1].power);
          }
        });
    }

    // Jeronimo is a confirmed exception to Generation 1's shared start value: his own Level 80
    // total is 233,250 (start 6,250), not the shared Gen 1 total of 186,600 (start 5,000).
    const jeronimo = heroes().findByName('Jeronimo')!;
    expect(jeronimo.levels[79].power).toBe(233250);
    for (let i = 1; i < jeronimo.levels.length; i++) {
      expect(jeronimo.levels[i].power).toBeGreaterThan(jeronimo.levels[i - 1].power);
    }
    for (let gen = 6; gen <= 17; gen++) {
      heroes()
        .get()
        .filter((h) => h.generation === gen)
        .forEach((h) => {
          h.levels.forEach((l) => {
            expect(l.power).toBe(0);
          });
        });
    }
  });
});
