import {
  ExpertQuery,
  ExpertRelationshipQuery,
  expertRelationships,
  experts,
} from '@/modules/experts';
import { existsSync } from 'fs';
import { join } from 'path';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('experts', () => experts());
testQueryBaseContract('expertRelationships', () => expertRelationships());

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
  it('tracks all 10 experts across 3 generations', () => {
    expect(experts().count()).toBe(10);
    expect(experts().byGeneration(1).count()).toBe(4);
    expect(experts().byGeneration(2).count()).toBe(4);
    expect(experts().byGeneration(3).count()).toBe(2);
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
    // Readings taken in the game: [expert, level, levelPower, affinityPower, affinity gain per advancement].
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

  it('has power on every skill and talent of every expert', () => {
    experts()
      .get()
      .flatMap((e) => [...e.skills, e.talent])
      .forEach((skill) => {
        const power = skill.progressions.find((p) => p.label === 'Power');
        expect(power).toBeDefined();
        expect(power!.values).toHaveLength(skill.maxLevel);
      });
  });
});
