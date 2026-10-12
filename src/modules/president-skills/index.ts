import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/president-skills.json';
import { PresidentSkill, PresidentSkillTarget } from '@/types';

const presidentSkillData: PresidentSkill[] = data as PresidentSkill[];

export class PresidentSkillQuery extends QueryBase<PresidentSkill> {
  constructor(data: PresidentSkill[] = presidentSkillData) {
    super(data);
  }

  byTarget(target: PresidentSkillTarget): PresidentSkillQuery {
    return new PresidentSkillQuery(this.data.filter((s) => s.target === target));
  }
}

export function presidentSkills(
  source: PresidentSkill[] = presidentSkillData,
): PresidentSkillQuery {
  return new PresidentSkillQuery(source);
}
