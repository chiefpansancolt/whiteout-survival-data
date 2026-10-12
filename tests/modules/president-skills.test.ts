import { PresidentSkillQuery, presidentSkills } from '@/modules/president-skills';
import { existsSync } from 'fs';
import { join } from 'path';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('presidentSkills', () => presidentSkills());

describe('PresidentSkillQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = presidentSkills().get().slice(0, 2);
    expect(new PresidentSkillQuery(subset).count()).toBe(2);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new PresidentSkillQuery().count()).toBe(9);
  });

  it('filters by target', () => {
    const ids = (target: 'state' | 'president' | 'chief') =>
      presidentSkills()
        .byTarget(target)
        .get()
        .map((s) => s.id);
    expect(ids('state')).toEqual([
      'medical-advancement',
      'mercantilism',
      'research-advancement',
      'mobilize',
      'supreme-presidents-will',
    ]);
    expect(ids('president')).toEqual(['receive-tribute']);
    expect(ids('chief')).toEqual(['ceasefire', 'forced-exile', 'state-search']);
  });
});

describe('president skills', () => {
  it('gives the four development skills a speed bonus for 24 hours and a 7 day cooldown', () => {
    const skills = presidentSkills()
      .get()
      .filter((s) => s.bonus);
    expect(skills.map((s) => [s.name, s.bonus!.statKey, s.bonus!.amount])).toEqual([
      ['Medical Advancement', 'healing-speed', 50],
      ['Mercantilism', 'construction-speed', 10],
      ['Research Advancement', 'research-speed', 10],
      ['Mobilize', 'training-speed', 30],
    ]);
    for (const skill of skills) {
      expect(skill.bonus).toMatchObject({ unit: 'percent', durationSeconds: 24 * 3600 });
      expect(skill.cooldownSeconds).toBe(7 * 24 * 3600);
      expect(skill.target).toBe('state');
    }
  });

  it('keeps the in-game wording of the effects', () => {
    expect(presidentSkills().find('mobilize')!.effect).toBe(
      "+30.00% all State Chiefs' training speeds for 24 hours",
    );
    expect(presidentSkills().find('ceasefire')!.effect).toBe(
      'Prevent a Chief from attacking other Chiefs for 1 hour.',
    );
  });

  it('keeps the source value as written', () => {
    expect(presidentSkills().find('mobilize')!.bonus!.value).toBe('30%');
  });

  it('gives each skill the Authority cost and the uses that the game shows', () => {
    expect(
      presidentSkills()
        .get()
        .map((s) => [s.id, s.authorityCost, s.maxUses]),
    ).toEqual([
      ['receive-tribute', 27000, 3],
      ['medical-advancement', 45000, undefined],
      ['mercantilism', 45000, 2],
      ['research-advancement', 45000, 2],
      ['mobilize', 45000, 2],
      ['ceasefire', 27000, 14],
      ['forced-exile', 27000, 14],
      ['state-search', 18000, 56],
      ['supreme-presidents-will', undefined, undefined],
    ]);
  });

  it('gives the control skills no bonus and no cooldown', () => {
    for (const skill of presidentSkills().byTarget('chief').get()) {
      expect(skill.bonus).toBeUndefined();
      expect(skill.cooldownSeconds).toBeUndefined();
    }
  });

  it('marks Supreme President’s Will as Supreme President only, with no values', () => {
    const will = presidentSkills().find('supreme-presidents-will')!;
    expect(will.supremePresidentOnly).toBe(true);
    expect(will.bonus).toBeUndefined();
    expect(will.cooldownSeconds).toBeUndefined();
  });

  it('gives every skill but Supreme President’s Will an icon file', () => {
    const withoutImg = presidentSkills()
      .get()
      .filter((s) => !s.img);
    expect(withoutImg.map((s) => s.id)).toEqual(['supreme-presidents-will']);
    for (const skill of presidentSkills()
      .get()
      .filter((s) => s.img)) {
      expect(skill.img).toBe(`/images/president-skills/${skill.id}.png`);
      expect(existsSync(join(__dirname, '../..', skill.img!))).toBe(true);
    }
  });

  it('uses the stat keys of the other modules', () => {
    const keys = presidentSkills()
      .get()
      .flatMap((s) => (s.bonus ? [s.bonus.statKey] : []));
    expect(keys).toEqual([
      'healing-speed',
      'construction-speed',
      'research-speed',
      'training-speed',
    ]);
  });
});
