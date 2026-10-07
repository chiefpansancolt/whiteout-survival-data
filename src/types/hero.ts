export type HeroRarity = 'Rare' | 'Epic' | 'Legendary';
export type HeroClass = 'Infantry' | 'Lancer' | 'Marksman';
export type HeroSubClass = 'Growth' | 'Combat';

export interface HeroSkillLevel {
  level: number;
  /** Hero Manuals needed to reach this level from the previous one. A Talent skill needs none, so it is 0. */
  manualsRequired: number;
  /** Power gained at this level. 0 for a Talent skill, because no source states it. */
  powerGain: number;
  /** Hero star needed to unlock this skill level. 0 for a Talent skill, because no source states it. */
  starRequired: number;
}

export interface HeroSkill {
  name: string;
  img: string;
  description: string;
  /** The 5 skill levels. They match the 5 slash-separated values in `description`. */
  levels: HeroSkillLevel[];
}

export interface HeroSkills {
  exploration: HeroSkill[];
  expedition: HeroSkill[];
  /** Set only for Jeronimo and Natalia. The Talent tab is empty for every other Legendary hero on the wiki. */
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

/** The stats of a hero at level 80 for a star and tier. */
export interface HeroStatEstimate {
  /** Always 80. */
  level: number;
  star: number;
  tier: number;
  /** False only at 5 stars, where the stats are the ones stored on the hero. */
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
  /** The Special item level at which this skill activates. Not set when the hero page does not state it. */
  unlockLevel?: number;
}

export interface ExclusiveWeapon {
  name: string;
  img: string;
  power: number;
  stats: ExclusiveWeaponStats;
  skills: ExclusiveWeaponSkill[];
}

export interface HeroShardTier {
  star: number;
  tierCosts: number[];
  total: number;
  /** Total Power once this star is reached, not the gain of this star. 0 when not yet sourced. */
  power: number;
  /** Hero Power read in the game at each of the 6 tiers of this star. Set only where it was read. */
  tierPower?: number[];
}

export interface HeroLevel {
  level: number;
  /** Furnace level needed to reach this hero level. */
  furnaceLevelRequired: number;
  /** Hero XP needed to reach this level from the previous one. 0 at level 1. */
  xpRequired: number;
  /**
   * Total Power once this level is reached, not the gain of this level. 0 for Legendary
   * Generations 6 and later, because no start value is known.
   */
  power: number;
}

export interface Hero {
  id: string;
  name: string;
  img: string;
  /** Shard icon of the hero. Set only for the heroes whose shard icon is bundled. */
  shardImg?: string;
  /** Hero Power read in the game at star 0. Set only for the heroes that were read. */
  powerAtStarZero?: number;
  rarity: HeroRarity;
  class: HeroClass;
  subClass: HeroSubClass;
  generation: number;
  /** Level 80 stats at 5 stars. */
  stats: {
    exploration: HeroStats;
    expedition: HeroExpeditionStats;
  };
  skills: HeroSkills;
  exclusiveWeapon?: ExclusiveWeapon;
  shardCosts: HeroShardTier[];
  /** Where the shards of the hero come from, as the wiki lists them. Empty when the wiki lists none. */
  shardSources: string[];
  levels: HeroLevel[];
}

/** The Widgets that one exclusive weapon level costs. The table is the same for every hero. */
export interface HeroWidgetLevel {
  id: string;
  name: string;
  level: number;
  /** Widgets needed to reach this level from the previous one. */
  widgets: number;
}
