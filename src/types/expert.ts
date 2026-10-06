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
  /** Power the expert's level gives at this affinity level. */
  levelPower?: number;
  /** Power the affinity gives at this affinity level, before any advancement of this level. */
  affinityPower?: number;
  /** Power the affinity gives after the advancement at this level. Only on levels with an `advancementCost`. */
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

/** A relationship status that every expert goes through as the affinity level rises. */
export interface ExpertRelationship {
  id: string;
  name: string;
  img: string;
  /** The affinity level at which the expert reaches this status. The status lasts until the next one starts. */
  level: number;
}
