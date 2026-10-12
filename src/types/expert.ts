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

export interface ExpertSkill {
  name: string;
  img: string;
  description: string;
  maxLevel: number;
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
  statBonus: number;
  levelPower?: number;
  /** Before the advancement of this level. */
  affinityPower?: number;
  /** Set only with `advancementCost`. */
  affinityPowerAfterAdvancement?: number;
}

export interface ExpertUnlockRequirement {
  daysRequired: number;
}

export interface UnreleasedExpertUnlockRequirement {
  heroGeneration: number;
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
  /** The status lasts until the next status starts. */
  level: number;
}
