import { heroes, HeroQuery } from '@/modules/heroes';
import { existsSync } from 'fs';
import { join } from 'path';
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
    'Hector',
    'Norah',
    'Gwen',
  ];

  it('carries a power placeholder on every Legendary shard tier, except the confirmed Generation 1-5 curves', () => {
    heroes()
      .get()
      .filter((h) => h.rarity === 'Legendary' && !CONFIRMED_LEGENDARY_STAR_POWER.includes(h.name))
      .forEach((h) => {
        h.shardCosts.forEach((tier) => {
          expect(tier.power).toBe(0);
        });
      });
  });

  describe('star power', () => {
    const BASE_POWER_BY_HERO: Record<string, number> = {
      Smith: 6500,
      Eugene: 6500,
      Charlie: 6500,
      Cloris: 6500,
      Sergey: 8000,
      Jessie: 8000,
      Patrick: 8000,
      'Lumak Bokan': 8000,
      'Ling Xue': 8000,
      Gina: 8000,
      Bahiti: 8000,
      Jasser: 8000,
      'Seo-yoon': 8000,
      Molly: 10000,
      Zinman: 10000,
      Natalia: 11000,
      Flint: 12000,
      Philly: 12000,
      Alonso: 12000,
      Jeronimo: 12500,
      Logan: 15000,
      Mia: 15000,
      Greg: 15000,
      Ahmose: 18500,
      Reina: 18500,
      Lynn: 18500,
      Hector: 22200,
      Norah: 22200,
      Gwen: 22200,
    };

    it('stores the Power at star 0 of every hero with a confirmed maximum star Power', () => {
      Object.entries(BASE_POWER_BY_HERO).forEach(([name, base]) => {
        expect(heroes().findByName(name)!.powerAtStarZero).toBe(base);
      });
      expect(
        heroes()
          .get()
          .filter((h) => h.powerAtStarZero !== undefined),
      ).toHaveLength(29);
    });

    it('gives the Power at stars 1 to 5 as the Power at star 0 times 4.18, 9.98, 20.26, 38.22, and 69.18', () => {
      Object.entries(BASE_POWER_BY_HERO).forEach(([name, base]) => {
        const hero = heroes().findByName(name)!;
        expect(hero.shardCosts.map((t) => t.power)).toEqual(
          [4.18, 9.98, 20.26, 38.22, 69.18].map((multiplier) => Math.round(base * multiplier)),
        );
      });
    });

    it('gives the Generation 2 heroes the Power of each star confirmed in the game', () => {
      expect(
        heroes()
          .findByName('Flint')!
          .shardCosts.map((t) => t.power),
      ).toEqual([50160, 119760, 243120, 458640, 830160]);
    });

    it('gives the confirmed maximum star Power of each group of heroes', () => {
      const max = (name: string) => heroes().findByName(name)!.shardCosts[4].power;
      expect([max('Smith'), max('Sergey'), max('Molly'), max('Natalia'), max('Jeronimo')]).toEqual([
        449670, 553440, 691800, 760980, 864750,
      ]);
      expect([max('Flint'), max('Logan'), max('Reina'), max('Gwen')]).toEqual([
        830160, 1037700, 1279830, 1535796,
      ]);
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
    // Level 1 start power is 3250 for Rare and 4000 for Epic.
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

  it('gates each level of the Talent skill behind the star of the same number', () => {
    ['Jeronimo', 'Natalia'].forEach((name) => {
      const talent = heroes().findByName(name)!.skills.talent!;
      expect(talent.levels.map((l) => l.starRequired)).toEqual([1, 2, 3, 4, 5]);
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

  describe('exclusive weapon power by level', () => {
    const weapons = () =>
      heroes()
        .get()
        .filter((h) => h.exclusiveWeapon !== undefined);

    it('has 10 levels on every weapon, and level 10 is the power of the weapon', () => {
      weapons().forEach((h) => {
        const { levels, power } = h.exclusiveWeapon!;
        expect(levels.map((l) => l.level)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        expect(levels[9].power).toBe(power);
        levels.slice(1).forEach((l, i) => expect(l.power).toBeGreaterThan(levels[i].power));
      });
    });

    it('gives the Generation 2 weapons the confirmed power at levels 1, 2, and 3', () => {
      ['Flint', 'Philly', 'Alonso'].forEach((name) => {
        const { levels, power } = heroes().findByName(name)!.exclusiveWeapon!;
        expect(power).toBe(270000);
        expect(levels.slice(0, 3).map((l) => l.power)).toEqual([36000, 61200, 86400]);
      });
    });

    it('gives the Generation 4 weapons the confirmed power at levels 3, 4, and 6', () => {
      ['Ahmose', 'Reina', 'Lynn'].forEach((name) => {
        const { levels, power } = heroes().findByName(name)!.exclusiveWeapon!;
        expect(power).toBe(416250);
        expect([levels[2].power, levels[3].power, levels[5].power]).toEqual([
          133200, 172050, 249750,
        ]);
      });
    });

    it('scales every weapon with the same share of the level 10 power', () => {
      const shares = [20, 34, 48, 62, 76, 90, 105, 120, 135, 150];
      weapons().forEach((h) => {
        const { levels, power } = h.exclusiveWeapon!;
        levels.forEach((l, i) => expect(l.power).toBe(Math.round((power * shares[i]) / 150)));
      });
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
      power: 52250,
      tierPower: [16750, 22500, 28625, 33750, 40625, 52250],
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

  it('fills levels[].power for Generations 1-5 via the shared curve, matching the known checkpoints, and leaves 0 for Generations 6-17', () => {
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
        .filter((h) => h.generation === gen && h.name !== 'Jeronimo' && h.name !== 'Natalia')
        .forEach((h) => {
          expect(h.levels[79].power).toBe(maxPowerByGen[gen]);
          for (let i = 1; i < h.levels.length; i++) {
            expect(h.levels[i].power).toBeGreaterThan(h.levels[i - 1].power);
          }
        });
    }

    // Jeronimo and Natalia are exceptions: Level 80 totals are 233,250 (start 6,250) and 205,260
    // (start 5,500). The shared Generation 1 total is 186,600 (start 5,000).
    const jeronimo = heroes().findByName('Jeronimo')!;
    expect(jeronimo.levels[79].power).toBe(233250);
    for (let i = 1; i < jeronimo.levels.length; i++) {
      expect(jeronimo.levels[i].power).toBeGreaterThan(jeronimo.levels[i - 1].power);
    }
    const natalia = heroes().findByName('Natalia')!;
    expect([1, 2, 10, 40, 80].map((level) => natalia.levels[level - 1].power)).toEqual([
      5500, 6710, 16830, 71390, 205260,
    ]);
    expect(natalia.powerAtStarZero).toBe(natalia.levels[0].power * 2);
    for (let i = 1; i < natalia.levels.length; i++) {
      expect(natalia.levels[i].power).toBeGreaterThan(natalia.levels[i - 1].power);
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

  it('sets an optional shardImg on the heroes whose shard icon has been captured', () => {
    const withShard = heroes()
      .get()
      .filter((h) => h.shardImg !== undefined);
    expect(withShard.map((h) => h.id)).toEqual([
      'smith',
      'eugene',
      'charlie',
      'cloris',
      'sergey',
      'jessie',
      'patrick',
      'lumak-bokan',
      'ling-xue',
      'gina',
      'bahiti',
      'jasser',
      'seo-yoon',
      'natalia',
      'molly',
      'zinman',
      'flint',
      'philly',
      'alonso',
      'logan',
      'mia',
      'greg',
      'reina',
      'lynn',
      'norah',
      'gwen',
      'wu-ming',
      'gordon',
      'hendrik',
      'magnus',
    ]);
    withShard.forEach((h) => expect(existsSync(join(__dirname, '../..', h.shardImg!))).toBe(true));
  });

  describe('star tier power', () => {
    const withStarPower = () =>
      heroes()
        .get()
        .filter((h) => h.powerAtStarZero !== undefined);

    it('has six tier powers on every star of the 29 heroes with a Power at star 0', () => {
      expect(withStarPower()).toHaveLength(29);
      withStarPower().forEach((hero) => {
        hero.shardCosts.forEach((t) => expect(t.tierPower).toHaveLength(6));
      });
    });

    it('has no tier power on heroes without a Power at star 0', () => {
      heroes()
        .get()
        .filter((h) => h.powerAtStarZero === undefined)
        .forEach((hero) => {
          hero.shardCosts.forEach((t) => expect(t.tierPower).toBeUndefined());
        });
    });

    it('gives the Generation 5 heroes the Hero Power read in the game on stars 1 to 3', () => {
      ['Hector', 'Norah', 'Gwen'].forEach((name) => {
        const hero = heroes().findByName(name)!;
        expect(hero.powerAtStarZero).toBe(22200);
        expect(hero.powerAtStarZero).toBe(hero.levels[0].power * 2);
        expect(hero.shardCosts[0].tierPower).toEqual([29748, 39960, 50838, 59940, 72150, 92796]);
        expect(hero.shardCosts[1].tierPower).toEqual([
          109224, 126540, 144744, 164058, 187368, 221556,
        ]);
        expect(hero.shardCosts[2].tierPower).toEqual([
          251082, 282162, 318126, 352314, 388944, 449772,
        ]);
      });
    });

    it('gives the Generation 2 heroes the Star Power on stars 4 and 5, with 3.3, 4.3, 4.4, and 4.5 predicted', () => {
      ['Flint', 'Philly', 'Alonso'].forEach((name) => {
        const hero = heroes().findByName(name)!;
        expect(hero.shardCosts[3].tierPower).toEqual([
          271440, 303480, 335640, 367920, 402600, 458640,
        ]);
        expect(hero.shardCosts[4].tierPower).toEqual([
          507480, 561600, 617280, 674640, 733560, 830160,
        ]);
      });
    });

    it('matches the Star Power read in the game for each hero at its label', () => {
      const starPower = (name: string, label: string) => {
        const [star, tier] = label.split('.').map(Number);
        const hero = heroes().findByName(name)!;
        return tier === 0
          ? hero.shardCosts[star - 1].power
          : hero.shardCosts[star].tierPower![tier - 1];
      };
      const readings: [string, string, number][] = [
        ['Philly', '3.5', 402600],
        ['Flint', '4.2', 561600],
        ['Alonso', '4.1', 507480],
        ['Zinman', '3.2', 252900],
        ['Natalia', '3.2', 278190],
        ['Jeronimo', '3.1', 282750],
        ['Logan', '3.4', 459900],
        ['Norah', '3.0', 449772],
        ['Greg', '4.0', 573300],
        ['Gwen', '3.1', 502164],
        ['Mia', '4.2', 702000],
        ['Ahmose', '4.0', 707070],
        ['Lynn', '4.1', 782365],
        ['Reina', '4.0', 707070],
        ['Hector', '3.2', 561438],
      ];
      readings.forEach(([name, label, power]) => expect(starPower(name, label)).toBe(power));
    });

    it('ends every star on the Power of the whole star', () => {
      withStarPower().forEach((hero) => {
        hero.shardCosts.forEach((t) => expect(t.tierPower![5]).toBe(t.power));
      });
    });

    it('rises with every tier', () => {
      withStarPower().forEach((hero) => {
        const all = [hero.powerAtStarZero!, ...hero.shardCosts.flatMap((t) => t.tierPower!)];
        all.slice(1).forEach((power, i) => expect(power).toBeGreaterThan(all[i]));
      });
    });
  });
});

describe('hero skill effects', () => {
  const allSkills = () =>
    heroes()
      .get()
      .flatMap((hero) => [
        ...hero.skills.exploration,
        ...hero.skills.expedition,
        ...(hero.skills.talent ? [hero.skills.talent] : []),
      ]);

  const NUMBER_SET = /(\d[\d,]*(?:\.\d+)?)%?((?:\s*\/\s*\d[\d,]*(?:\.\d+)?%?){3,4})\s*s?/g;
  const textSets = (description: string): number[][] =>
    [...description.matchAll(NUMBER_SET)].map((m) =>
      `${m[1]}${m[2]}`.split('/').map((v) => Number(v.replace(/[%\s,s]/g, ''))),
    );

  it('gives all 375 skills five levels with an effect for every set of numbers in the text', () => {
    const skills = allSkills();
    expect(skills).toHaveLength(375);
    let sets = 0;
    for (const skill of skills) {
      const fromText = textSets(skill.description);
      expect(fromText.length).toBeGreaterThan(0);
      expect(skill.levels).toHaveLength(5);
      skill.levels.forEach((level, i) => {
        expect(level.effects.map((e) => e.amount)).toEqual(fromText.map((set) => set[i]));
      });
      sets += fromText.length;
    }
    expect(sets).toBe(488);
  });

  it('keeps the same names and units at every level of a skill', () => {
    for (const skill of allSkills()) {
      const first = skill.levels[0].effects.map((e) => [e.name, e.unit]);
      for (const level of skill.levels) {
        expect(level.effects.map((e) => [e.name, e.unit])).toEqual(first);
      }
    }
  });

  it('gives every effect of a skill its own name', () => {
    for (const skill of allSkills()) {
      const names = skill.levels[0].effects.map((e) => e.name);
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it('uses only the four units and no empty name', () => {
    const counts: Record<string, number> = {};
    for (const skill of allSkills()) {
      for (const effect of skill.levels[0].effects) {
        expect(effect.name.trim()).not.toBe('');
        counts[effect.unit] = (counts[effect.unit] ?? 0) + 1;
      }
    }
    expect(counts).toEqual({ percent: 362, percentOfAttack: 115, number: 7, seconds: 4 });
  });

  it('gives the Stamina Cost Reduction of Gina at each level of Endurance Training', () => {
    const skill = heroes()
      .find('gina')!
      .skills.expedition.find((s) => s.name === 'Endurance Training')!;
    expect(skill.levels.map((l) => l.effects)).toEqual(
      [10, 12, 15, 18, 20].map((amount) => [
        { name: 'Stamina Cost Reduction', amount, unit: 'percent' },
      ]),
    );
  });

  it('gives a skill with two sets two effects at each level', () => {
    const skill = heroes()
      .find('gina')!
      .skills.exploration.find((s) => s.name === 'Incendiary Arrow')!;
    expect(skill.levels[0].effects).toEqual([
      { name: 'Damage (Target)', amount: 210, unit: 'percentOfAttack' },
      { name: 'Damage (Nearby Enemies)', amount: 70, unit: 'percentOfAttack' },
    ]);
    expect(skill.levels[4].effects.map((e) => e.amount)).toEqual([290, 98]);
  });

  it('gives a chance in percent and a duration in seconds', () => {
    const skill = heroes()
      .find('charlie')!
      .skills.exploration.find((s) => s.name === 'Grenadier')!;
    expect(skill.levels.map((l) => l.effects[0])).toEqual(
      [10, 15, 15, 20, 20].map((amount) => ({ name: 'Stun Chance', amount, unit: 'percent' })),
    );
    expect(skill.levels.map((l) => l.effects[1])).toEqual(
      [0.5, 0.5, 1, 1, 1.5].map((amount) => ({ name: 'Stun Duration', amount, unit: 'seconds' })),
    );
  });

  it('gives the Talent skill of Jeronimo its effects', () => {
    const talent = heroes().find('jeronimo')!.skills.talent!;
    expect(talent.levels.map((l) => l.effects)).toEqual(
      [3, 6, 9, 12, 15].map((amount) => [
        { name: 'Lethality and Health', amount, unit: 'percent' },
      ]),
    );
  });
});
