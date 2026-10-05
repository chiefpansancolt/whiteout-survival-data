export type EventCategory = 'solo' | 'alliance' | 'rookie' | 'holiday';

export interface GameEventPhase {
  name: string;
  description?: string;
}

export interface GameEventReward {
  name: string;
  itemId?: string;
  /** Id of the matching Daybreak Island decoration, for rewards that are decorations and not items. */
  decorationId?: string;
  /** Id of the matching skin in `skin()`, for rewards that are skins. */
  skinId?: string;
  amount?: number;
  /** The condition for the reward, such as a rank tier, or a detail the amount cannot express. */
  note?: string;
}

export interface GameEventStageLevel {
  /** The level of the enemy a player scouts and defeats, such as 1 to 50. */
  level: number;
  /** The troop tier of the enemy at this level. */
  tier: number;
  power: number;
  bonus: number;
  troops: { infantry: number; lancer: number; marksman: number };
  totalTroops: number;
  rewards: GameEventReward[];
  /** Set when the source table looks wrong for this level and the values are kept as printed. */
  note?: string;
}

export interface GameEventRanking {
  /** The placement group the rewards apply to, such as `1`, `2-3`, `4-5`, or `6`. */
  groupRanking: string;
  /** Change to the star rating for this placement. Negative when stars are lost. */
  starChange?: number;
  rewards: GameEventReward[];
  /** Per-level enemy details and rewards for this difficulty. */
  levels?: GameEventStageLevel[];
}

export interface GameEventRankingTable {
  /** What the placement is based on, such as capital occupation time. */
  basedOn: string;
  rankings: GameEventRanking[];
}

export interface GameEventTier {
  name: string;
  note?: string;
  scoreTotal?: number;
  rewards?: GameEventReward[];
  rankings?: GameEventRanking[];
}

export type GameEventWaveTarget = 'city' | 'headquarters';

export interface GameEventWave {
  wave: number;
  target: GameEventWaveTarget;
  rule: string;
  details?: string;
}

export interface GameEventMission {
  group: string;
  name: string;
  /** Base points. Exclusive missions give a bonus on top of this. */
  points: number;
}

export interface GameEventScoringAction {
  action: string;
  points: number;
}

export interface GameEventDay {
  /** The day or days the stage runs, such as `1` or `6-7`. */
  day: string;
  name: string;
  /** Event points the day's winner earns, for events decided by daily matches. */
  victoryPoints?: number;
  /** How a player or alliance scores points during this day. */
  scoring: GameEventScoringAction[];
  /** Personal point milestones for this day, as tiers with `scoreTotal` and `rewards`. */
  milestones?: GameEventTier[];
  /** Alliance point milestones for this day, as tiers with `scoreTotal` and `rewards`. */
  allianceMilestones?: GameEventTier[];
  note?: string;
}

export interface GameEventRankingVersion {
  name: string;
  note?: string;
  rankings: GameEventRanking[];
}

export interface GameEventPointLevel {
  level: number;
  personalPoints: number;
  alliancePoints: number;
  rewards: GameEventReward[];
}

/** Levels unlocked by reaching both a personal point total and an alliance point total. */
export interface GameEventPointLevels {
  personalIcon: string;
  allianceIcon: string;
  levels: GameEventPointLevel[];
}

export interface GameEvent {
  id: string;
  name: string;
  img: string;
  category: EventCategory;
  description: string;
  frequency?: string;
  duration?: string;
  requirements?: string[];
  /** Ranking tiers ordered from lowest to highest. */
  tiers?: GameEventTier[];
  /** Alliance rewards by the placement of the alliance's first legion. */
  allianceRankings?: GameEventRanking[];
  /** Later reward lists for `allianceRankings`, in the order the game replaced them. */
  allianceRankingUpdates?: GameEventRankingVersion[];
  /** Reward levels that need both personal and alliance points, such as Crazy Joe defense points. */
  pointLevels?: GameEventPointLevels;
  /** Personal rewards by placement, one table for each thing the placement is based on. */
  personalRankings?: GameEventRankingTable[];
  phases?: GameEventPhase[];
  /** Per-day details, for events that score and reward each day separately. */
  days?: GameEventDay[];
  /** Attack waves in order, for wave-based events. */
  waves?: GameEventWave[];
  /** Missions players can complete to earn points, for mission-based events. */
  missions?: GameEventMission[];
  rewards?: GameEventReward[];
  tips?: string[];
  /** Id of the matching `EventBuff` row. */
  eventBuffId?: string;
}
