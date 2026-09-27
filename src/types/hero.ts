export type HeroRarity = 'Rare' | 'Epic' | 'Legendary';
export type HeroClass = 'Infantry' | 'Lancer' | 'Marksman';
export type HeroSubClass = 'Growth' | 'Combat';

export interface HeroSkill {
  name: string;
  img: string;
  description: string;
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

export interface ExclusiveWeaponStats {
  exploration: HeroStats;
  expedition: {
    lethality: number;
    health: number;
  };
}

export interface ExclusiveWeapon {
  name: string;
  img: string;
  power: number;
  stats: ExclusiveWeaponStats;
  skills: HeroSkill[];
}

export interface HeroShardTier {
  star: number;
  tierCosts: number[];
  total: number;
}

export interface Hero {
  id: string;
  name: string;
  img: string;
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
}
