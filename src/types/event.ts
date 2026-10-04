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

export interface GameEventRanking {
  /** The placement group the rewards apply to, such as `1`, `2-3`, `4-5`, or `6`. */
  groupRanking: string;
  /** Change to the star rating for this placement. Negative when stars are lost. */
  starChange?: number;
  rewards: GameEventReward[];
}

export interface GameEventRankingTable {
  /** What the placement is based on, such as capital occupation time. */
  basedOn: string;
  rankings: GameEventRanking[];
}

export interface GameEventTier {
  name: string;
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
  /** Personal rewards by placement, one table for each thing the placement is based on. */
  personalRankings?: GameEventRankingTable[];
  phases?: GameEventPhase[];
  /** Attack waves in order, for wave-based events. */
  waves?: GameEventWave[];
  rewards?: GameEventReward[];
  tips?: string[];
  /** Id of the matching `EventBuff` row. */
  eventBuffId?: string;
}
