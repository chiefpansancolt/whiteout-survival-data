import { BonusUnit } from './common';

export interface ExpertStatBonus {
  stat: string;
  statKey: string;
  value: number;
  amount: number;
  unit: BonusUnit;
}

export interface ExpertProgression {
  label: string;
  values: number[];
}

export interface ExpertLevelCost {
  level: number;
  exp: number;
  books: number;
}

export interface ExpertLootTableEntry {
  reward: string;
  probabilityPercent: number;
}

export interface ExpertMilestoneReward {
  levelRequired: number;
  rewards: {
    item: string;
    amount: number;
  }[];
}

export interface ExpertSkillLevelCap {
  /** The affinity level from which the cap applies. */
  affinityLevel: number;
  /** The highest skill level that the expert can learn at this affinity level. */
  maxLevel: number;
}

export interface ExpertAffinityRequirement {
  /** The skill level that the requirement gates. Level 1 is the unlock of the skill. */
  level: number;
  /** The affinity level that the expert needs, after the advancement of that level. */
  affinityLevel: number;
}

export interface ExpertTotalSkillRequirement {
  /** The skill level that the requirement gates. */
  level: number;
  /** The sum of the levels of all skills of the expert that is needed before the upgrade. */
  totalSkillLevel: number;
}

export interface ExpertSkill {
  name: string;
  img: string;
  description: string;
  maxLevel: number;
  /** The affinity level at which a skill unlocks. A talent has none, because it levels with the affinity. */
  unlockAffinityLevel?: number;
  /** Known caps below `maxLevel`, from the lowest affinity level up. Only some skills have them. */
  levelCaps?: ExpertSkillLevelCap[];
  /** The affinity levels that unlock the skill and gate its upper levels, as the game files list them. */
  affinityRequirements?: ExpertAffinityRequirement[];
  /** Levels that need a total skill level of the expert before the upgrade. */
  totalSkillRequirements?: ExpertTotalSkillRequirement[];
  progressions: ExpertProgression[];
  costs: ExpertLevelCost[];
  milestoneRewards?: ExpertMilestoneReward[];
  lootTable?: ExpertLootTableEntry[];
}

export type ExpertTalent = ExpertSkill;

export interface ExpertAffinityLevel {
  level: number;
  affinityRequired: number;
  advancementCost?: number;
  /** Absent when the data does not state the stat bonus of the level. */
  statBonus?: number;
  levelPower?: number;
  affinityPower?: number;
  affinityPowerAfterAdvancement?: number;
}

export interface ExpertUnlockRequirement {
  daysRequired: number;
}

export interface UnreleasedExpertUnlockRequirement {
  daysRequired: number;
}

export interface UnreleasedExpert {
  id: string;
  name: string;
  img: string;
  unreleased: true;
  unlockRequirement: UnreleasedExpertUnlockRequirement;
}

export interface Expert {
  id: string;
  name: string;
  img: string;
  title: string;
  specialty: string;
  generation: number;
  unlockRequirement?: ExpertUnlockRequirement;
  baseBonuses: ExpertStatBonus[];
  skills: ExpertSkill[];
  talent: ExpertTalent;
  affinityLevels: ExpertAffinityLevel[];
}

export interface ExpertRelationship {
  id: string;
  name: string;
  img: string;
  level: number;
}
