export type HeroRarity = 'Rare' | 'Epic' | 'Legendary';
export type HeroClass = 'Infantry' | 'Lancer' | 'Marksman';
export type HeroSubClass = 'Growth' | 'Combat';

export interface HeroSkillLevel {
  level: number;
  /** Hero Manuals required to reach this level from the previous one. 0 at every level for a Talent skill, which needs no Manuals at all. */
  manualsRequired: number;
  /** Power gained at this level. Not yet sourced for a Talent skill -- 0 until confirmed. */
  powerGain: number;
  /** Hero star tier required before this skill level can be unlocked. Applicable but not yet sourced for a Talent skill -- 0 until confirmed. */
  starRequired: number;
}

export interface HeroSkill {
  name: string;
  img: string;
  description: string;
  /** The 5 levels behind this skill's slash-separated description values. */
  levels: HeroSkillLevel[];
}

export interface HeroSkills {
  exploration: HeroSkill[];
  expedition: HeroSkill[];
  /** Only Jeronimo and Natalia have a Talent skill -- the tab is empty on every other Legendary hero's wiki page. */
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

/** A hero's stats at a star and tier, estimated for hero level 80. */
export interface HeroStatEstimate {
  /** The hero level the estimate is for. Always 80. */
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
  /** The Special item level required for this skill to activate. Omitted on the handful of hero pages that don't state one. */
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
  /** Total Power accumulated once this star tier is reached (not the increment). Not yet sourced -- 0 until the real value is confirmed. */
  power: number;
  /**
   * Hero Power shown in the game at each of the six tiers of this star (x.1 to x.6), measured from
   * star 0. Set only for the heroes and stars that were read in the game.
   */
  tierPower?: number[];
}

export interface HeroLevel {
  level: number;
  /** Furnace level required before this hero level can be reached. Identical across every hero. */
  furnaceLevelRequired: number;
  /** Hero XP required to reach this level from the previous one. 0 at Level 1 (starting level, no XP needed). Identical across every hero. */
  xpRequired: number;
  /**
   * Total Power accumulated once this level is reached (not the increment). Confirmed via the
   * shared 80-level curve (gain(L) = start * base[L] / 250, running total) for Rare, Epic, and
   * Legendary Generations 1-5 (Gens 3-5's start values are themselves projected, per
   * HeroLevelPowerCurve.md) -- only the Level-1 start value differs by rarity/generation. Legendary
   * Generations 6+ have no known start value yet -- 0 until confirmed.
   */
  power: number;
}

export interface Hero {
  id: string;
  name: string;
  img: string;
  /** Icon of this hero's shard. Set only for the heroes whose shard icon has been captured. */
  shardImg?: string;
  /** Hero Power shown in the game at star 0, before any shard tier. Set only for the heroes that were read in the game. */
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
  /** Where this hero's shards can be obtained (e.g. "VIP Packs", "Hall of Heroes"). Empty for heroes not yet scraped for this. */
  shardSources: string[];
  /** The 80-level Furnace/XP/Power progression. furnaceLevelRequired and xpRequired are identical across every hero. */
  levels: HeroLevel[];
}
