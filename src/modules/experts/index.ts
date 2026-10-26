import { QueryBase } from '@/common/query-base';
import relationshipData from '@/data/chief/expert-relationships.json';
import data from '@/data/chief/experts.json';
import { Expert, ExpertRelationship, ExpertSkill, UnreleasedExpert } from '@/types';

const allExpertData = data as (Expert | UnreleasedExpert)[];
const expertData = allExpertData.filter((e): e is Expert => !('unreleased' in e));
const unreleasedExpertData = allExpertData.filter((e): e is UnreleasedExpert => 'unreleased' in e);
const expertRelationshipData: ExpertRelationship[] = relationshipData as ExpertRelationship[];

const AFFINITY_STEP = 10;

/**
 * Returns the highest level that an expert can learn of a skill at an affinity level. The skill is
 * locked, so the result is 0, below its `unlockAffinityLevel`. The caps count affinity levels in
 * steps of 10, so level 19 counts as 10. A cap of `levelCaps` applies from its affinity level up to the last
 * one that the data lists. Below the first cap, above the last cap, and for a skill without caps,
 * the data states no cap and the result is the `maxLevel` of the skill. A talent levels with the
 * affinity and always returns its `maxLevel`.
 */
export function expertSkillMaxLevel(skill: ExpertSkill, affinityLevel: number): number {
  if (skill.unlockAffinityLevel === undefined) return skill.maxLevel;
  if (affinityLevel < skill.unlockAffinityLevel) return 0;
  const step = AFFINITY_STEP * Math.floor(affinityLevel / AFFINITY_STEP);
  const caps = skill.levelCaps ?? [];
  const reached = caps.filter((cap) => cap.affinityLevel <= step);
  const isInsideCaps = reached.length > 0 && step <= caps[caps.length - 1].affinityLevel;
  return isInsideCaps ? reached[reached.length - 1].maxLevel : skill.maxLevel;
}

export class ExpertQuery extends QueryBase<Expert> {
  constructor(data: Expert[] = expertData) {
    super(data);
  }

  byGeneration(generation: number): ExpertQuery {
    return new ExpertQuery(this.data.filter((e) => e.generation === generation));
  }
}

export function experts(source: Expert[] = expertData): ExpertQuery {
  return new ExpertQuery(source);
}

export class UnreleasedExpertQuery extends QueryBase<UnreleasedExpert> {
  constructor(data: UnreleasedExpert[] = unreleasedExpertData) {
    super(data);
  }
}

export function unreleasedExperts(
  source: UnreleasedExpert[] = unreleasedExpertData,
): UnreleasedExpertQuery {
  return new UnreleasedExpertQuery(source);
}

export class ExpertRelationshipQuery extends QueryBase<ExpertRelationship> {
  constructor(data: ExpertRelationship[] = expertRelationshipData) {
    super(data);
  }

  /** Returns `undefined` below affinity level 1. */
  atAffinityLevel(level: number): ExpertRelationship | undefined {
    return this.data.filter((r) => r.level <= level).pop();
  }
}

export function expertRelationships(
  source: ExpertRelationship[] = expertRelationshipData,
): ExpertRelationshipQuery {
  return new ExpertRelationshipQuery(source);
}
