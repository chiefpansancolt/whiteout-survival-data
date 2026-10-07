export type EventCategory = 'solo' | 'alliance' | 'rookie' | 'holiday';

export interface GameEventPhase {
  name: string;
  description?: string;
}

export interface GameEventReward {
  name: string;
  itemId?: string;
  /** Id of the matching Daybreak Island decoration. Set when the reward is a decoration and not an item. */
  decorationId?: string;
  /** Id of the matching skin in `skins()`. Set when the reward is a skin. */
  skinId?: string;
  amount?: number;
  /** The condition for the reward, such as a rank tier, or a detail that `amount` cannot express. */
  note?: string;
}

export interface GameEventStageLevel {
  /** Level of the enemy, from 1 to 50. */
  level: number;
  tier: number;
  power: number;
  bonus: number;
  troops: { infantry: number; lancer: number; marksman: number };
  totalTroops: number;
  rewards: GameEventReward[];
  /** Set when the source table looks wrong for this level. The values are kept as printed. */
  note?: string;
}

export interface GameEventRanking {
  /** Placement group the rewards apply to, such as `1`, `2-3`, or `4-5`. */
  groupRanking: string;
  /** Change to the star rating for this placement. Negative when the player loses stars. */
  starChange?: number;
  rewards: GameEventReward[];
  /** Enemy details and rewards for each level of this difficulty. */
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

export interface GameEventZone {
  name: string;
  days: string[];
  statSources: string;
  unlock?: string;
  stages?: number;
  note?: string;
}

export interface GameEventRefresh {
  refresh: number;
  gemCost?: number;
  /** Chance in percent for each quality, keyed by quality name such as `Uncommon` or `Mythic`. */
  chances: Record<string, number>;
}

export interface GameEventShop {
  name: string;
  offers: GameEventShopOffer[];
}

export interface GameEventShopOffer {
  reward: GameEventReward;
  /** The rewards inside the offer. Set when the offer is a chest or bundle. */
  contents?: GameEventReward[];
  cost: number;
  limit: number;
}

export interface GameEventMissionLevel {
  level: number;
  /** Not set until the requirement is known. */
  requirement?: string;
}

export interface GameEventMission {
  group: string;
  name: string;
  /** Base points. Exclusive missions give a bonus on top of this. */
  points: number;
  /** Number of levels. Set when the mission has more than one level that gives the same rewards. */
  levels?: number;
  levelRequirements?: GameEventMissionLevel[];
  /** Rewards for each level, in addition to `points`. */
  rewards?: GameEventReward[];
  note?: string;
}

export interface GameEventScoringAction {
  action: string;
  points: number;
}

export interface GameEventDay {
  /** Day or days the stage runs, such as `1` or `6-7`. */
  day: string;
  name: string;
  /** Event points the winner of the day earns. Set for events decided by daily matches. */
  victoryPoints?: number;
  scoring: GameEventScoringAction[];
  /** Personal point milestones for this day. A tier omits `scoreTotal` until the points needed are known. */
  milestones?: GameEventTier[];
  /** Alliance point milestones for this day. */
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

export interface GameEventGenerationHero {
  generation: number;
  heroId: string;
  /** Id of the shard in `items()`. Not set when the shard has no item. */
  shardItemId?: string;
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
  /** Ranking tiers from lowest to highest. */
  tiers?: GameEventTier[];
  /** Alliance rewards by the placement of the first legion of the alliance. */
  allianceRankings?: GameEventRanking[];
  /** Later reward lists that replace `allianceRankings`, in the order the game replaced them. */
  allianceRankingUpdates?: GameEventRankingVersion[];
  /** Reward levels that need both personal and alliance points. */
  pointLevels?: GameEventPointLevels;
  /** Personal rewards by placement. One table for each basis of placement. */
  personalRankings?: GameEventRankingTable[];
  phases?: GameEventPhase[];
  /** Details for each day, for events that score and reward each day separately. Also holds the separate versions of an event, such as Armament Competition. */
  days?: GameEventDay[];
  waves?: GameEventWave[];
  missions?: GameEventMission[];
  /** What `points` of each mission counts. Set when the points are a currency. */
  missionPointsLabel?: string;
  /** Id in `items()` of the currency that `cost` of a shop offer uses. */
  shopCurrencyItemId?: string;
  /** Name of the shop currency. Set when the currency is not in `items()`. */
  shopCurrencyName?: string;
  refreshes?: GameEventRefresh[];
  shop?: GameEventShopOffer[];
  /** More than one shop. Set when the event has one shop for each group, such as each hero generation. */
  shops?: GameEventShop[];
  heroByGeneration?: GameEventGenerationHero[];
  zones?: GameEventZone[];
  rewards?: GameEventReward[];
  tips?: string[];
  /** Id of the matching row in `eventBuff()`. */
  eventBuffId?: string;
}
