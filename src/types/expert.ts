export interface ExpertStatBonus {
  stat: string;
  value: number;
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
  /** Power from the expert level at this affinity level. */
  levelPower?: number;
  /** Power from affinity at this affinity level, before the advancement of this level. */
  affinityPower?: number;
  /** Power from affinity after the advancement at this level. Set only with `advancementCost`. */
  affinityPowerAfterAdvancement?: number;
}

export interface Expert {
  id: string;
  name: string;
  img: string;
  title: string;
  specialty: string;
  generation: number;
  baseBonuses: ExpertStatBonus[];
  skills: ExpertSkill[];
  talent: ExpertTalent;
  affinityLevels: ExpertAffinityLevel[];
}

export interface ExpertRelationship {
  id: string;
  name: string;
  img: string;
  /** Affinity level at which this status starts. The status lasts until the next status starts. */
  level: number;
}
