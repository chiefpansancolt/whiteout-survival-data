import {
  ExpertQuery,
  ExpertRelationshipQuery,
  expertRelationships,
  experts,
  expertSkillMaxLevel,
  UnreleasedExpertQuery,
  unreleasedExperts,
} from '@/modules/experts';
import { heroGenerationAt } from '@/modules/server-timeline';
import { UnreleasedExpert } from '@/types';
import { existsSync } from 'fs';
import { join } from 'path';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('experts', () => experts());
testQueryBaseContract('expertRelationships', () => expertRelationships());
const announcedExpert: UnreleasedExpert = {
  id: 'new-expert',
  name: 'New Expert',
  img: '/images/experts/New/New.png',
  unreleased: true,
  unlockRequirement: { daysRequired: 400 },
};

const withSkillPower = () =>
  experts()
    .get()
    .filter((e) => e.id !== 'justus');

testQueryBaseContract('unreleasedExperts', () => unreleasedExperts([announcedExpert]));

describe('ExpertQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = experts().get().slice(0, 1);
    expect(new ExpertQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new ExpertQuery().count()).toBeGreaterThan(0);
  });

  it('byGeneration() filters to the given generation', () => {
    const gen1 = experts().byGeneration(1);
    expect(gen1.count()).toBe(4);
    expect(gen1.get().every((e) => e.generation === 1)).toBe(true);
  });
});

describe('Expert roster', () => {
  it('tracks all 11 experts across 3 generations', () => {
    expect(experts().count()).toBe(11);
    expect(experts().byGeneration(1).count()).toBe(4);
    expect(experts().byGeneration(2).count()).toBe(4);
    expect(experts().byGeneration(3).count()).toBe(3);
  });

  it('has a 100-level affinity table for every expert', () => {
    expect(
      experts()
        .get()
        .every((e) => e.affinityLevels.length === 100),
    ).toBe(true);
  });

  it("has affinity advancementCost summing to the expert's known total sigil cost", () => {
    const agnes = experts().findByName('Agnes')!;
    const total = agnes.affinityLevels.reduce((sum, l) => sum + (l.advancementCost ?? 0), 0);
    expect(total).toBe(275);
  });

  it('has a talent with a loot table on Agnes but not on Romulus', () => {
    const agnes = experts().findByName('Agnes')!;
    const romulus = experts().findByName('Romulus')!;
    expect(agnes.talent.lootTable).toBeDefined();
    expect(romulus.talent.lootTable).toBeUndefined();
  });

  it('has a skill with two independent progression tracks (Talent-style)', () => {
    const agnes = experts().findByName('Agnes')!;
    expect(agnes.talent.progressions).toHaveLength(3);
    expect(agnes.talent.progressions.map((p) => p.label)).toEqual([
      'Chest Gain',
      'Daily Cap',
      'Power',
    ]);
  });

  it('has milestone item-tier rewards on some Generation 2 skills instead of a numeric progression', () => {
    const baldur = experts().findByName('Baldur')!;
    const blazingSunrise = baldur.skills.find((s) => s.name === 'Blazing Sunrise')!;
    expect(blazingSunrise.progressions).toHaveLength(3);
    expect(blazingSunrise.milestoneRewards).toHaveLength(3);
    expect(blazingSunrise.milestoneRewards![0].levelRequired).toBe(1);
  });

  it('has a loot table on a skill (not just a talent) for Bounty Hunter', () => {
    const baldur = experts().findByName('Baldur')!;
    const bountyHunter = baldur.skills.find((s) => s.name === 'Bounty Hunter')!;
    expect(bountyHunter.lootTable).toBeDefined();
    expect(bountyHunter.lootTable!.length).toBeGreaterThan(0);
  });

  it('has no leaked tooltip JS/CSS in any skill or talent description', () => {
    experts()
      .get()
      .flatMap((e) => [...e.skills, e.talent])
      .forEach((s) => {
        expect(s.description).not.toMatch(/var talentTimer|function show|scrollbar/);
      });
  });

  it("cleaned Romulus's and Fabian's descriptions down to just the real sentence", () => {
    const romulus = experts().findByName('Romulus')!;
    expect(romulus.skills.find((s) => s.name === 'Last Line')!.description).toBe(
      "Solaris' tactics didn't save the empire, but Romulus can rework them to protect you. Troops' Attack and Defense +0.5% → 10%.",
    );

    const fabian = experts().findByName('Fabian')!;
    expect(fabian.skills.find((s) => s.name === 'Battle Bulwark')!.description).toBe(
      "Weapons production is subset of Fabian's expertise, giving squads greater focus in Foundry Battle and Tundra Hellfire with +7,500 → 150,000 Rally Capacity.",
    );
  });

  it("has Valeria's skill values at every level", () => {
    const skill = (name: string) =>
      experts()
        .findByName('Valeria')!
        .skills.find((s) => s.name === name)!;
    const values = (name: string, label: string) =>
      skill(name).progressions.find((p) => p.label === label)!.values;
    expect(values('Well Prepared', 'Extra Tier')).toEqual([1, 1, 1, 1, 1, 2, 2, 2, 2, 3]);
    expect(values('Radiant Honor', 'Sunfire Tokens')).toEqual([
      5, 10, 15, 20, 25, 30, 35, 40, 45, 50,
    ]);
    expect(values('Radiant Honor', 'Shop Items')).toEqual([1, 1, 1, 1, 1, 2, 2, 2, 2, 3]);
    expect(values('Battle Concerto', 'Troop Lethality')).toHaveLength(20);
    expect(values('Battle Concerto', 'Troop Health')[19]).toBe(30);
    expect(values('Battle Concerto', 'Troop Lethality')[0]).toBe(1.5);
    expect(values('Crushing Force', 'Rally Capacity')[0]).toBe(7500);
    expect(values('Crushing Force', 'Rally Capacity')[19]).toBe(150000);
  });

  it("has Valeria's Well Prepared percent from 2 to 20", () => {
    const valeria = experts().findByName('Valeria')!;
    const wellPrepared = valeria.skills.find((s) => s.name === 'Well Prepared')!;
    expect(wellPrepared.progressions[0].values).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
  });

  it('has per-level values at every level of every progression', () => {
    experts()
      .get()
      .flatMap((e) => [...e.skills, e.talent])
      .forEach((skill) =>
        skill.progressions.forEach((p) => expect(p.values).toHaveLength(skill.maxLevel)),
      );
  });

  it("has Agnes's Project Management research speed by level", () => {
    const projectManagement = experts()
      .findByName('Agnes')!
      .skills.find((s) => s.name === 'Project Management')!;
    expect(projectManagement.progressions.map((p) => p.label)).toEqual([
      'Speed Boost (Hours)',
      'Increases Research Speed',
      'Power',
    ]);
    expect(projectManagement.progressions[1].values).toEqual([1, 2, 3, 4, 5]);
  });

  it("has Agnes's power by level on every skill and her talent", () => {
    const agnes = experts().findByName('Agnes')!;
    const power = (skill: { progressions: { label: string; values: number[] }[] }) =>
      skill.progressions.find((p) => p.label === 'Power')!.values;
    expect(power(agnes.talent)).toEqual([
      36000, 72000, 108000, 144000, 180000, 216000, 252000, 288000, 324000, 360000, 396000,
    ]);
    expect(power(agnes.skills[0])).toEqual([20000, 40000, 60000, 80000, 100000]);
    expect(power(agnes.skills[1])).toEqual([16000, 32000, 48000, 64000, 80000]);
    expect(power(agnes.skills[2])).toEqual([7000, 14000, 21000, 28000, 35000]);
    expect(power(agnes.skills[3])).toEqual([
      7000, 14000, 21000, 28000, 35000, 42000, 49000, 56000, 63000, 70000,
    ]);
  });

  describe('level and affinity power', () => {
    // Values read in game. Tuple: [expert, level, levelPower, affinityPower, affinityGainPerAdvancement].
    const readings: [string, number, number, number, number][] = [
      ['Gareth', 10, 594000, 216000, 216000],
      ['Cyrille', 80, 496800, 345600, 43200],
      ['Agnes', 70, 442800, 302400, 43200],
      ['Holger', 60, 777600, 518400, 86400],
      ['Romulus', 40, 936000, 576000, 144000],
      ['Valeria', 40, 936000, 576000, 144000],
      ['Baldur', 70, 590400, 403200, 57600],
      ['Fabian', 50, 837000, 540000, 108000],
      ['Ronne', 50, 669600, 432000, 86400],
      ['Kathy', 50, 837000, 540000, 108000],
    ];

    it.each(readings)(
      'matches the in-game reading of %s at level %i',
      (name, level, levelPower, affinityPower) => {
        const row = experts().findByName(name)!.affinityLevels[level - 1];
        expect(row.level).toBe(level);
        expect(row.levelPower).toBe(levelPower);
        expect(row.affinityPower).toBe(affinityPower);
      },
    );

    it.each(readings)(
      'gives %s a power on all 100 levels from his or her affinity gain',
      (name, _level, _lp, _ap, gain) => {
        const levels = experts().findByName(name)!.affinityLevels;
        expect(levels).toHaveLength(100);
        levels.forEach((a) => {
          const stage = Math.floor((a.level - 1) / 10) + 1;
          expect(a.affinityPower).toBe(gain * stage);
          expect(a.levelPower).toBe((gain / 8) * (a.level + 12));
          expect(a.affinityPowerAfterAdvancement).toBe(
            a.advancementCost === undefined ? undefined : gain * (stage + 1),
          );
        });
      },
    );

    it('keeps the level power of Gareth at the level 10 advancement', () => {
      const level10 = experts().findByName('Gareth')!.affinityLevels[9];
      expect(level10).toMatchObject({
        levelPower: 594000,
        affinityPower: 216000,
        affinityPowerAfterAdvancement: 432000,
      });
    });
  });

  it("has Cyrille's power by level on every skill and his talent", () => {
    const cyrille = experts().findByName('Cyrille')!;
    const power = (skill: { progressions: { label: string; values: number[] }[] }) =>
      skill.progressions.find((p) => p.label === 'Power')!.values;
    expect(cyrille.skills.map((s) => s.name)).toEqual([
      'Entrapment',
      'Scavenging',
      'Weapon Master',
      "Ursa's Bane",
    ]);
    expect(power(cyrille.talent)).toEqual([
      36000, 72000, 108000, 144000, 180000, 216000, 252000, 288000, 324000, 360000, 396000,
    ]);
    expect(power(cyrille.skills[0])).toEqual([
      3000, 6000, 9000, 12000, 15000, 18000, 21000, 24000, 27000, 30000,
    ]);
    expect(power(cyrille.skills[1])).toEqual([13000, 26000, 39000, 52000, 65000]);
    expect(power(cyrille.skills[2])).toEqual([20000, 40000, 60000, 80000, 100000]);
    expect(power(cyrille.skills[3])).toEqual([
      7000, 14000, 21000, 28000, 35000, 42000, 49000, 56000, 63000, 70000,
    ]);
  });
});

describe('expertRelationships', () => {
  it('lists the 11 statuses from Stranger at level 1 to Intimate at level 100', () => {
    const all = expertRelationships().get();
    expect(all.map((r) => r.name)).toEqual([
      'Stranger',
      'Acquaintance 1',
      'Acquaintance 2',
      'Acquaintance 3',
      'Casual 1',
      'Casual 2',
      'Casual 3',
      'Close 1',
      'Close 2',
      'Close 3',
      'Intimate',
    ]);
    expect(all.map((r) => r.level)).toEqual([1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
  });

  it('has an icon file for every status', () => {
    expertRelationships()
      .get()
      .forEach((r) => expect(existsSync(join(__dirname, '../..', r.img))).toBe(true));
  });

  it('finds the status for an affinity level', () => {
    const at = (level: number) => expertRelationships().atAffinityLevel(level)?.name;
    expect(at(1)).toBe('Stranger');
    expect(at(9)).toBe('Stranger');
    expect(at(10)).toBe('Acquaintance 1');
    expect(at(80)).toBe('Close 2');
    expect(at(99)).toBe('Close 3');
    expect(at(100)).toBe('Intimate');
    expect(at(0)).toBeUndefined();
  });

  it('accepts an explicit source array and default construction', () => {
    expect(new ExpertRelationshipQuery(expertRelationships().get().slice(0, 2)).count()).toBe(2);
    expect(new ExpertRelationshipQuery().count()).toBe(11);
  });

  it("has Holger's power by level on every skill and his talent", () => {
    const holger = experts().findByName('Holger')!;
    const power = (skill: { progressions: { label: string; values: number[] }[] }) =>
      skill.progressions.find((p) => p.label === 'Power')!.values;
    expect(holger.skills.map((s) => s.name)).toEqual([
      'Arena Elite',
      'Crowd Pleaser',
      'Arena Star',
      'Legacy',
    ]);
    expect(power(holger.talent)).toEqual([
      58000, 116000, 174000, 232000, 290000, 348000, 406000, 464000, 522000, 580000, 638000,
    ]);
    expect(power(holger.skills[0])).toEqual([
      42000, 84000, 126000, 168000, 210000, 252000, 294000, 336000, 378000, 420000,
    ]);
    expect(power(holger.skills[1])).toEqual([
      18000, 36000, 54000, 72000, 90000, 108000, 126000, 144000, 162000, 180000,
    ]);
    expect(power(holger.skills[2])).toEqual(power(holger.skills[1]));
    expect(power(holger.skills[3])).toEqual(power(holger.skills[0]));
  });

  it("has Romulus's power by level on every skill and his talent", () => {
    const romulus = experts().findByName('Romulus')!;
    const power = (skill: { progressions: { label: string; values: number[] }[] }) =>
      skill.progressions.find((p) => p.label === 'Power')!.values;
    const steps = (skill: { maxLevel: number }, step: number) =>
      Array.from({ length: skill.maxLevel }, (_, i) => step * (i + 1));
    expect(romulus.skills.map((s) => s.name)).toEqual([
      'Call of War',
      'Last Line',
      'Spirit of Aeetis',
      'One Heart',
    ]);
    expect(power(romulus.talent)).toEqual(steps(romulus.talent, 236000));
    expect(power(romulus.skills[0])).toEqual(steps(romulus.skills[0], 18000));
    expect(power(romulus.skills[1])).toEqual(steps(romulus.skills[1], 108000));
    expect(power(romulus.skills[2])).toEqual(steps(romulus.skills[2], 135000));
    expect(power(romulus.skills[3])).toEqual(steps(romulus.skills[3], 150000));
    expect(power(romulus.talent)[10]).toBe(2596000);
    expect(power(romulus.skills[3])[19]).toBe(3000000);
  });

  it("has Valeria's talent with 11 levels and power by level on her talent and skills", () => {
    const valeria = experts().findByName('Valeria')!;
    const values = (
      skill: { progressions: { label: string; values: number[] }[] },
      label: string,
    ) => skill.progressions.find((p) => p.label === label)!.values;
    expect(valeria.talent.maxLevel).toBe(11);
    expect(values(valeria.talent, 'Troop Attack')).toEqual([
      2, 4, 6, 9, 12, 15, 18, 21, 24, 27, 30,
    ]);
    expect(values(valeria.talent, 'Troop Defense')).toEqual(values(valeria.talent, 'Troop Attack'));
    expect(values(valeria.talent, 'Power')[10]).toBe(1573000);
    const skillStep = (name: string, step: number) => {
      const skill = valeria.skills.find((s) => s.name === name)!;
      expect(values(skill, 'Power')).toEqual(
        Array.from({ length: skill.maxLevel }, (_, i) => step * (i + 1)),
      );
    };
    skillStep('Well Prepared', 30000);
    skillStep('Radiant Honor', 30000);
    skillStep('Battle Concerto', 156000);
    skillStep('Crushing Force', 156000);
  });

  it("has Baldur's talent with 11 levels and per-level values and power on his talent and skills", () => {
    const baldur = experts().findByName('Baldur')!;
    const values = (
      skill: { progressions: { label: string; values: number[] }[] },
      label: string,
    ) => skill.progressions.find((p) => p.label === label)!.values;
    const skill = (name: string) => baldur.skills.find((s) => s.name === name)!;
    expect(baldur.talent.name).toBe('Master Negotiator');
    expect(baldur.talent.maxLevel).toBe(11);
    expect(values(baldur.talent, 'Price Drop (%)')).toEqual([
      5, 5, 5, 5, 5, 10, 10, 10, 10, 10, 11,
    ]);
    expect(values(baldur.talent, 'Reward Boost (%)')).toEqual([
      20, 28, 36, 44, 52, 60, 68, 76, 84, 92, 100,
    ]);
    expect(values(baldur.talent, 'Power')[10]).toBe(473000);
    expect(values(skill('Blazing Sunrise'), 'Point Boost')).toEqual([
      2, 4, 6, 8, 10, 12, 14, 16, 18, 20,
    ]);
    expect(values(skill('Blazing Sunrise'), 'Extra Tier')).toEqual([1, 1, 1, 1, 1, 2, 2, 2, 2, 3]);
    expect(values(skill('Honored Conquest'), 'Shop Items')).toEqual([1, 1, 1, 1, 1, 2, 2, 2, 2, 3]);
    expect(values(skill('Bounty Hunter'), 'Chest Gain')).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(values(skill('Dawn Hymn'), 'Point Boost (%)')[9]).toBe(50);
    ['Blazing Sunrise', 'Honored Conquest', 'Bounty Hunter'].forEach((name) =>
      expect(values(skill(name), 'Power')[9]).toBe(180000),
    );
    expect(values(skill('Dawn Hymn'), 'Power')[9]).toBe(350000);
  });

  it("has Fabian's power by level on every skill and his talent", () => {
    const fabian = experts().findByName('Fabian')!;
    const power = (skill: { progressions: { label: string; values: number[] }[] }) =>
      skill.progressions.find((p) => p.label === 'Power')!.values;
    const steps = (skill: { maxLevel: number }, step: number) =>
      Array.from({ length: skill.maxLevel }, (_, i) => step * (i + 1));
    expect(fabian.skills.map((s) => s.name)).toEqual([
      'Salvager',
      'Crisis Rescue',
      'Heightened Firepower',
      'Battle Bulwark',
    ]);
    expect(power(fabian.talent)).toEqual(steps(fabian.talent, 86000));
    expect(power(fabian.skills[0])).toEqual(steps(fabian.skills[0], 18000));
    expect(power(fabian.skills[1])).toEqual(steps(fabian.skills[1], 37000));
    expect(power(fabian.skills[2])).toEqual(steps(fabian.skills[2], 52000));
    expect(power(fabian.skills[3])).toEqual(steps(fabian.skills[3], 83000));
    expect(power(fabian.talent)[10]).toBe(946000);
    expect(power(fabian.skills[3])[19]).toBe(1660000);
  });

  it("has Ronne's talent defense and power, and power on her skills", () => {
    const ronne = experts().findByName('Ronne')!;
    const values = (
      skill: { progressions: { label: string; values: number[] }[] },
      label: string,
    ) => skill.progressions.find((p) => p.label === label)!.values;
    const steps = (count: number, step: number) =>
      Array.from({ length: count }, (_, i) => step * (i + 1));
    expect(ronne.talent.progressions.map((p) => p.label)).toEqual([
      'Troop Attack',
      'Troop Defense',
      'Power',
    ]);
    expect(values(ronne.talent, 'Troop Defense')).toEqual(values(ronne.talent, 'Troop Attack'));
    expect(values(ronne.talent, 'Power')).toEqual(steps(11, 58000));
    const [memory, scent, givingBack, goldClass] = ronne.skills;
    expect(goldClass.name).toBe('Gold Class');
    expect(values(memory, 'Power')).toEqual(steps(10, 18000));
    expect(values(scent, 'Power')).toEqual(steps(10, 18000));
    expect(values(givingBack, 'Power')).toEqual(steps(10, 42000));
    expect(values(goldClass, 'Power')).toEqual(steps(10, 98000));
    expect(values(goldClass, 'Extra Attempts')).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
  });

  it("has Kathy's talent health and power, and power on her skills", () => {
    const kathy = experts().findByName('Kathy')!;
    const values = (
      skill: { progressions: { label: string; values: number[] }[] },
      label: string,
    ) => skill.progressions.find((p) => p.label === label)!.values;
    const steps = (count: number, step: number) =>
      Array.from({ length: count }, (_, i) => step * (i + 1));
    expect(kathy.talent.progressions.map((p) => p.label)).toEqual([
      'Troop Lethality',
      'Troop Health',
      'Power',
    ]);
    expect(values(kathy.talent, 'Troop Health')).toEqual(values(kathy.talent, 'Troop Lethality'));
    expect(values(kathy.talent, 'Power')).toEqual(steps(11, 72000));
    expect(kathy.skills.map((s) => s.name)).toEqual([
      'Icefire Hunter',
      'Valorous Cold',
      'Winter Treasures',
      'Efficient Mining',
    ]);
    expect(values(kathy.skills[0], 'Power')).toEqual(steps(10, 18000));
    expect(values(kathy.skills[1], 'Power')).toEqual(steps(10, 18000));
    expect(values(kathy.skills[2], 'Power')).toEqual(steps(10, 70000));
    expect(values(kathy.skills[3], 'Power')).toEqual(steps(10, 98000));
  });

  it("has Gareth's power by level on every skill and his talent", () => {
    const gareth = experts().findByName('Gareth')!;
    const power = (skill: { progressions: { label: string; values: number[] }[] }) =>
      skill.progressions.find((p) => p.label === 'Power')!.values;
    const steps = (skill: { maxLevel: number }, step: number) =>
      Array.from({ length: skill.maxLevel }, (_, i) => step * (i + 1));
    expect(gareth.skills.map((s) => s.name)).toEqual([
      'Gifts of Iron',
      'Porcupine',
      'Undefeated Will',
      'Fearsome Reputation',
    ]);
    expect(power(gareth.talent)).toEqual(steps(gareth.talent, 354000));
    expect(power(gareth.skills[0])).toEqual(steps(gareth.skills[0], 18000));
    expect(power(gareth.skills[1])).toEqual(steps(gareth.skills[1], 324000));
    expect(power(gareth.skills[2])).toEqual(steps(gareth.skills[2], 389000));
    expect(power(gareth.skills[3])).toEqual(steps(gareth.skills[3], 1452000));
    expect(power(gareth.skills[3])[19]).toBe(29040000);
  });

  it('has power on every skill and talent of every expert except Justus', () => {
    withSkillPower()
      .flatMap((e) => [...e.skills, e.talent])
      .forEach((skill) => {
        const power = skill.progressions.find((p) => p.label === 'Power');
        expect(power).toBeDefined();
        expect(power!.values).toHaveLength(skill.maxLevel);
      });
  });

  it("has Gareth's Gifts of Iron books and EXP in the right columns", () => {
    const giftsOfIron = experts()
      .findByName('Gareth')!
      .skills.find((skill) => skill.name === 'Gifts of Iron')!;
    expect(giftsOfIron.costs.map((c) => c.books)).toEqual([
      0, 300, 600, 900, 1200, 1500, 1800, 2100, 2400, 2700,
    ]);
    expect(giftsOfIron.costs[1].exp).toBe(25800);
    expect(giftsOfIron.costs[9].exp).toBe(232800);
    expect(giftsOfIron.costs.reduce((sum, c) => sum + c.books, 0)).toBe(13500);
  });

  it('has more EXP than books at every skill level, since EXP is the learning time in seconds', () => {
    experts()
      .get()
      .flatMap((e) => e.skills)
      .forEach((skill) =>
        skill.costs
          .filter((c) => c.books > 0)
          .forEach((c) => expect(c.exp / c.books).toBeGreaterThan(20)),
      );
  });
});

describe('expert unlock days', () => {
  it('gives each expert on the server timeline the days of its milestone', () => {
    expect(
      experts()
        .get()
        .map((e) => [e.id, e.unlockRequirement?.daysRequired]),
    ).toEqual([
      ['cyrille', 120],
      ['agnes', 120],
      ['holger', 120],
      ['romulus', 160],
      ['baldur', 200],
      ['fabian', 200],
      ['valeria', 200],
      ['ronne', 230],
      ['kathy', 230],
      ['gareth', 270],
      ['justus', 360],
    ]);
  });
});

describe('unreleased experts', () => {
  it('accepts an explicit source array', () => {
    expect(new UnreleasedExpertQuery([announcedExpert]).count()).toBe(1);
  });

  it('is empty while the file has no expert with the unreleased flag', () => {
    expect(new UnreleasedExpertQuery().count()).toBe(0);
    expect(unreleasedExperts().get()).toEqual([]);
  });

  it('keeps unreleased experts out of experts()', () => {
    expect(experts().find(announcedExpert.id)).toBeUndefined();
    expect(unreleasedExperts([announcedExpert]).find(announcedExpert.id)).toEqual(announcedExpert);
  });
});

describe('Justus', () => {
  const justus = () => experts().find('justus')!;

  it('has the title, specialty, generation, and unlock day of the data', () => {
    expect(justus()).toMatchObject({
      name: 'Justus',
      title: 'Royal Counselor',
      specialty: 'Expert Growth',
      generation: 3,
      unlockRequirement: { daysRequired: 360 },
    });
    expect(existsSync(join(__dirname, '../..', justus().img))).toBe(true);
  });

  it('unlocks on the day of the generation 6 heroes', () => {
    const { daysRequired } = justus().unlockRequirement!;
    expect(heroGenerationAt(daysRequired - 1)).toBe(5);
    expect(heroGenerationAt(daysRequired)).toBe(6);
  });

  it('has a base bonus of 15 percent Troops Attack and Defense', () => {
    expect(justus().baseBonuses!.map((b) => [b.statKey, b.amount, b.unit])).toEqual([
      ['troops-attack', 15, 'percent'],
      ['troops-defense', 15, 'percent'],
    ]);
  });

  it('has four skills with their unlock levels and maximum levels', () => {
    expect(justus().skills.map((s) => [s.name, s.unlockAffinityLevel, s.maxLevel])).toEqual([
      ['Glorious Gains', 10, 5],
      ['Treasure Seeker', 20, 5],
      ['Master Diplomat', 30, 5],
      ['Fortune Wayfarer', 40, 10],
    ]);
  });

  it('costs 73,500 Books of Knowledge to max all four skills', () => {
    const books = justus().skills.map((s) => s.costs.reduce((sum, c) => sum + c.books, 0));
    expect(books).toEqual([12000, 15000, 15000, 31500]);
    expect(books.reduce((sum, b) => sum + b, 0)).toBe(73500);
  });

  it('gives the first level of every skill for free and the other levels the EXP of the learning time', () => {
    const exp = justus().skills.map((s) => s.costs.map((c) => c.exp));
    expect(exp).toEqual([
      [0, 103200, 207000, 310800, 414600],
      [0, 181200, 362400, 544200, 725400],
      [0, 207000, 414600, 621600, 829200],
      [0, 108600, 217200, 326400, 435000, 544200, 652800, 762000, 870600, 979800],
    ]);
    expect(exp.flat().reduce((sum, e) => sum + e, 0)).toBe(9817800);
    for (const skill of justus().skills) {
      expect(skill.costs[0]).toEqual({ level: 1, exp: 0, books: 0 });
      expect(skill.costs.map((c) => c.level)).toEqual(
        Array.from({ length: skill.maxLevel }, (_, i) => i + 1),
      );
    }
  });

  it('caps Glorious Gains and Treasure Seeker by affinity level', () => {
    const skill = (name: string) => justus().skills.find((s) => s.name === name)!;
    const gains = skill('Glorious Gains');
    expect([9, 10, 29, 30, 49, 50, 100].map((l) => expertSkillMaxLevel(gains, l))).toEqual([
      0, 2, 2, 4, 4, 5, 5,
    ]);
    const seeker = skill('Treasure Seeker');
    expect([19, 20, 39, 40, 59, 60].map((l) => expertSkillMaxLevel(seeker, l))).toEqual([
      0, 2, 2, 4, 4, 5,
    ]);
  });

  it('needs a total skill level for the upper levels of Master Diplomat and Fortune Wayfarer', () => {
    const requirements = (name: string) =>
      justus()
        .skills.find((s) => s.name === name)!
        .totalSkillRequirements!.map((r) => [r.level, r.totalSkillLevel]);
    expect(requirements('Master Diplomat')).toEqual([
      [3, 8],
      [5, 12],
    ]);
    expect(requirements('Fortune Wayfarer')).toEqual([
      [5, 15],
      [8, 20],
      [10, 24],
    ]);
  });

  it('has the progressions that the data states and no others', () => {
    const labels = justus().skills.map((s) => s.progressions.map((p) => p.label));
    expect(labels).toEqual([['Glowstones from Labyrinth Raids'], ['Double Reward Chance'], [], []]);
    expect(justus().skills[0].progressions[0].values).toEqual([4, 8, 12, 16, 20]);
    expect(justus().skills[1].progressions[0].values).toEqual([15, 20, 25, 30, 35]);
  });

  it('has the Former Glory talent with the drop table of the Dynasty Honor Chest', () => {
    const { talent } = justus();
    expect(talent).toMatchObject({ name: 'Former Glory', maxLevel: 11, costs: [] });
    expect(talent.lootTable!.reduce((sum, e) => sum + e.probabilityPercent, 0)).toBeCloseTo(100, 5);
    expect(talent.lootTable![0]).toEqual({ reward: 'CompassX6', probabilityPercent: 48 });
  });

  it('has the affinity table of Holger and Ronne, with 440 sigils and 513,070 affinity in all', () => {
    const rows = justus().affinityLevels;
    const table = (id: string) =>
      experts()
        .find(id)!
        .affinityLevels.map((l) => l.affinityRequired);
    expect(rows.map((l) => l.affinityRequired)).toEqual(table('holger'));
    expect(rows.map((l) => l.affinityRequired)).toEqual(table('ronne'));
    expect(rows.reduce((sum, l) => sum + l.affinityRequired, 0)).toBe(513070);
    expect(
      rows.filter((l) => l.advancementCost !== undefined).map((l) => [l.level, l.advancementCost]),
    ).toEqual([
      [10, 8],
      [20, 16],
      [30, 24],
      [40, 32],
      [50, 40],
      [60, 48],
      [70, 56],
      [80, 64],
      [90, 72],
      [100, 80],
    ]);
    expect(rows.reduce((sum, l) => sum + (l.advancementCost ?? 0), 0)).toBe(440);
  });

  it('has no stat bonus and no power on its affinity levels, which the data does not hold yet', () => {
    for (const row of justus().affinityLevels) {
      expect(row.statBonus).toBeUndefined();
      expect(row.levelPower).toBeUndefined();
      expect(row.affinityPower).toBeUndefined();
    }
  });
});

describe('expert progressions', () => {
  const progressions = () =>
    experts()
      .get()
      .flatMap((e) =>
        [...e.skills, e.talent].flatMap((s) =>
          s.progressions
            .filter((p) => p.label !== 'Power')
            .map((p) => ({ expert: e.id, skill: s.name, label: p.label, values: p.values })),
        ),
      );

  it('never goes down from one level to the next, except the missions of Gold Class', () => {
    for (const p of progressions()) {
      if (p.skill === 'Gold Class' && p.label === 'Completions') continue;
      p.values.slice(1).forEach((v, i) => {
        expect([p.expert, p.skill, p.label, i + 2, v >= p.values[i]]).toEqual([
          p.expert,
          p.skill,
          p.label,
          i + 2,
          true,
        ]);
      });
    }
  });

  it.each([
    ['romulus', 'Last Line', 'Troop Attack', 0.5],
    ['romulus', 'Spirit of Aeetis', 'Troop Lethality', 0.5],
    ['fabian', 'Heightened Firepower', 'Troop Lethality', 1.5],
    ['fabian', 'Heightened Firepower', 'Troop Health', 1.5],
    ['gareth', 'Fearsome Reputation', 'Lethality Down', 0.25],
  ])('steps %s %s %s by %d at every level', (expert, skill, label, step) => {
    const values = progressions().find(
      (p) => p.expert === expert && p.skill === skill && p.label === label,
    )!.values;
    expect(values).toHaveLength(20);
    values.forEach((v, i) => expect(v).toBeCloseTo(step * (i + 1), 6));
  });

  it('ends the five fixed progressions at the maximum that their text states', () => {
    const last = (expert: string, skill: string, label: string) =>
      progressions().find((p) => p.expert === expert && p.skill === skill && p.label === label)!
        .values[19];
    expect(last('romulus', 'Last Line', 'Troop Attack')).toBe(10);
    expect(last('romulus', 'Spirit of Aeetis', 'Troop Lethality')).toBe(10);
    expect(last('fabian', 'Heightened Firepower', 'Troop Lethality')).toBe(30);
    expect(last('fabian', 'Heightened Firepower', 'Troop Health')).toBe(30);
    expect(last('gareth', 'Fearsome Reputation', 'Lethality Down')).toBe(5);
  });
});

describe('skill unlocks and caps', () => {
  const skillOf = (expertId: string, name: string) =>
    experts()
      .find(expertId)!
      .skills.find((skill) => skill.name === name)!;

  it('unlocks the four skills of every expert at affinity levels 10, 20, 30, and 40 in order', () => {
    for (const expert of experts().get()) {
      expect(expert.skills.map((skill) => skill.unlockAffinityLevel)).toEqual([10, 20, 30, 40]);
    }
  });

  it('gives a talent no unlock level and no caps', () => {
    for (const expert of experts().get()) {
      expect(expert.talent.unlockAffinityLevel).toBeUndefined();
      expect(expert.talent.levelCaps).toBeUndefined();
    }
  });

  it('lists caps in ascending affinity order, in steps of 10, never above the max level', () => {
    for (const expert of experts().get()) {
      for (const skill of expert.skills) {
        const caps = skill.levelCaps ?? [];
        caps.forEach((cap, index) => {
          expect(cap.affinityLevel % 10).toBe(0);
          expect(cap.maxLevel).toBeGreaterThan(0);
          expect(cap.maxLevel).toBeLessThanOrEqual(skill.maxLevel);
          if (index > 0) expect(cap.affinityLevel).toBeGreaterThan(caps[index - 1].affinityLevel);
        });
      }
    }
  });

  it('has caps on fourteen skills of nine experts', () => {
    const capped = experts()
      .get()
      .flatMap((expert) =>
        expert.skills
          .filter((skill) => skill.levelCaps)
          .map((skill) => `${expert.id}:${skill.name}`),
      );
    expect(capped).toEqual([
      'cyrille:Entrapment',
      'cyrille:Scavenging',
      'holger:Crowd Pleaser',
      'holger:Arena Star',
      'romulus:Call of War',
      'baldur:Blazing Sunrise',
      'fabian:Salvager',
      'valeria:Radiant Honor',
      'ronne:Cartographic Memory',
      'ronne:Treasure Scent',
      'gareth:Gifts of Iron',
      'gareth:Undefeated Will',
      'justus:Glorious Gains',
      'justus:Treasure Seeker',
    ]);
  });

  describe('expertSkillMaxLevel()', () => {
    const entrapment = skillOf('cyrille', 'Entrapment');
    const scavenging = skillOf('cyrille', 'Scavenging');
    const weaponMaster = skillOf('cyrille', 'Weapon Master');

    it('returns 0 while the skill is locked', () => {
      expect(expertSkillMaxLevel(entrapment, 9)).toBe(0);
      expect(expertSkillMaxLevel(scavenging, 19)).toBe(0);
      expect(expertSkillMaxLevel(weaponMaster, 29)).toBe(0);
    });

    it('returns the max level of a skill without caps once it is unlocked', () => {
      expect(expertSkillMaxLevel(weaponMaster, 30)).toBe(weaponMaster.maxLevel);
      expect(expertSkillMaxLevel(weaponMaster, 100)).toBe(weaponMaster.maxLevel);
    });

    it('returns the max level below the first cap, where the data states no cap', () => {
      expect(expertSkillMaxLevel(entrapment, 10)).toBe(entrapment.maxLevel);
      expect(expertSkillMaxLevel(entrapment, 19)).toBe(entrapment.maxLevel);
    });

    it('applies a cap from its affinity level up to the next one', () => {
      expect(expertSkillMaxLevel(entrapment, 20)).toBe(4);
      expect(expertSkillMaxLevel(entrapment, 29)).toBe(4);
      expect(expertSkillMaxLevel(entrapment, 30)).toBe(7);
      expect(expertSkillMaxLevel(entrapment, 40)).toBe(7);
    });

    it('returns the max level above the last cap, where the data states no cap', () => {
      expect(expertSkillMaxLevel(entrapment, 50)).toBe(entrapment.maxLevel);
      expect(expertSkillMaxLevel(entrapment, 100)).toBe(entrapment.maxLevel);
    });

    it("steps through the caps of Gareth's Undefeated Will after it unlocks at 30", () => {
      const will = skillOf('gareth', 'Undefeated Will');
      expect(expertSkillMaxLevel(will, 20)).toBe(0);
      expect(expertSkillMaxLevel(will, 30)).toBe(14);
      expect(expertSkillMaxLevel(will, 40)).toBe(19);
      expect(expertSkillMaxLevel(will, 50)).toBe(20);
    });

    it('returns the max level of a talent at any affinity level', () => {
      const talent = experts().find('cyrille')!.talent;
      expect(expertSkillMaxLevel(talent, 1)).toBe(talent.maxLevel);
    });
  });
});
