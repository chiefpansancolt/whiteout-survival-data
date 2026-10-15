export type HeroRarity = 'Rare' | 'Epic' | 'Legendary';
export type HeroClass = 'Infantry' | 'Lancer' | 'Marksman';
export type HeroSubClass = 'Growth' | 'Combat';

export type HeroSkillEffectUnit = 'percent' | 'percentOfAttack' | 'seconds' | 'number';

export interface HeroSkillEffect {
  name: string;
  amount: number;
  unit: HeroSkillEffectUnit;
}

export interface HeroSkillLevel {
  level: number;
  manualsRequired: number;
  powerGain: number;
  starRequired: number;
  effects: HeroSkillEffect[];
}

export interface HeroSkill {
  name: string;
  img: string;
  description: string;
  levels: HeroSkillLevel[];
}

export interface HeroSkills {
  exploration: HeroSkill[];
  expedition: HeroSkill[];
  talent?: HeroSkill;
}

export interface HeroStats {
  attack: number;
  defense: number;
  health: number;
}

export interface HeroExpeditionStats {
  attack: number;
  defense: number;
}

export interface HeroStatEstimate {
  level: number;
  star: number;
  tier: number;
  estimated: boolean;
  exploration: HeroStats;
  expedition: HeroExpeditionStats;
}

export interface ExclusiveWeaponStats {
  exploration: HeroStats;
  expedition: {
    lethality: number;
    health: number;
  };
}

export interface ExclusiveWeaponSkill {
  name: string;
  img: string;
  description: string;
  unlockLevel?: number;
}

export interface ExclusiveWeaponLevel {
  level: number;
  power: number;
}

export interface ExclusiveWeapon {
  name: string;
  img: string;
  power: number;
  levels: ExclusiveWeaponLevel[];
  stats: ExclusiveWeaponStats;
  skills: ExclusiveWeaponSkill[];
}

export interface HeroShardTier {
  star: number;
  tierCosts: number[];
  total: number;
  power: number;
  tierPower?: number[];
}

export interface HeroLevel {
  level: number;
  furnaceLevelRequired: number;
  xpRequired: number;
  power: number;
}

export interface Hero {
  id: string;
  name: string;
  img: string;
  shardImg?: string;
  powerAtStarZero?: number;
  rarity: HeroRarity;
  class: HeroClass;
  subClass: HeroSubClass;
  generation: number;
  stats: {
    exploration: HeroStats;
    expedition: HeroExpeditionStats;
  };
  skills: HeroSkills;
  exclusiveWeapon?: ExclusiveWeapon;
  shardCosts: HeroShardTier[];
  shardSources: string[];
  levels: HeroLevel[];
}

export interface HeroWidgetLevel {
  id: string;
  name: string;
  level: number;
  widgets: number;
}
