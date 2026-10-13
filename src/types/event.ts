export type EventCategory = 'solo' | 'alliance' | 'rookie' | 'holiday';

export interface GameEventPhase {
  name: string;
  description?: string;
}

export interface GameEventReward {
  name: string;
  itemId?: string;
  /** Set when the reward is a decoration and not an item. */
  decorationId?: string;
  skinId?: string;
  amount?: number;
  note?: string;
}

export interface GameEventStageLevel {
  /** From 1 to 50. */
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
  groupRanking: string;
  /** Negative when the player loses stars. */
  starChange?: number;
  rewards: GameEventReward[];
  levels?: GameEventStageLevel[];
}

export interface GameEventRankingTable {
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
  /** Percent, keyed by quality name. */
  chances: Record<string, number>;
}

export interface GameEventShop {
  name: string;
  offers: GameEventShopOffer[];
}

export interface GameEventShopOffer {
  reward: GameEventReward;
  contents?: GameEventReward[];
  cost: number;
  limit: number;
}

export interface GameEventMissionLevel {
  level: number;
  requirement?: string;
}

export interface GameEventMission {
  group: string;
  name: string;
  /** Exclusive missions give a bonus on top of this. */
  points: number;
  /** Set when more than one level gives the same rewards. */
  levels?: number;
  levelRequirements?: GameEventMissionLevel[];
  /** In addition to `points`, for each level. */
  rewards?: GameEventReward[];
  note?: string;
}

export interface GameEventScoringAction {
  action: string;
  points: number;
  itemId?: string;
  itemIds?: string[];
}

export interface GameEventDay {
  day: string;
  name: string;
  victoryPoints?: number;
  scoring: GameEventScoringAction[];
  /** A tier omits `scoreTotal` until the points needed are known. */
  milestones?: GameEventTier[];
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

export interface GameEventPointLevels {
  personalIcon: string;
  allianceIcon: string;
  levels: GameEventPointLevel[];
}

export interface GameEventGenerationHero {
  generation: number;
  heroId: string;
  shardItemId?: string;
}

export type GameEventResultShape = 'ranking' | 'milestones' | 'tier' | 'waves' | 'participation';

export type GameEventRankingScope = 'personal' | 'alliance';

export interface GameEventRankingTableView {
  id: string;
  scope?: GameEventRankingScope;
  name?: string;
  basedOn?: string;
  rankings: GameEventRanking[];
}

export type EventWeekday =
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type EventRepeatUnit = 'hours' | 'days' | 'weeks' | 'months';

export interface EventRepeat {
  kind: 'none' | 'every' | 'weekly';
  every?: number;
  unit?: EventRepeatUnit;
  weekdays?: EventWeekday[];
}

export type EventRunUnit = 'minutes' | 'hours' | 'days';

export interface EventRun {
  label?: string;
  length: number;
  unit: EventRunUnit;
  startWeekday?: EventWeekday;
  startTimeUtc?: string;
}

export interface EventSchedule {
  repeat?: EventRepeat;
  runs?: EventRun[];
}

export interface GameEventExpertTierThreshold {
  days: string[];
  scoreTotal: number;
}

export interface GameEventExpertTier {
  expertId: string;
  skill: string;
  tier: number;
  unlockSkillLevel: number;
  thresholds?: GameEventExpertTierThreshold[];
  rewards?: GameEventReward[];
}

export interface GameEvent {
  id: string;
  name: string;
  img: string;
  category: EventCategory;
  /** Not set on the four Core events. */
  resultShape?: GameEventResultShape;
  /** What `scoreTotal` counts, for events whose targets are not points. */
  scoreUnit?: string;
  description: string;
  frequency?: string;
  duration?: string;
  schedule?: EventSchedule;
  expertTiers?: GameEventExpertTier[];
  requirements?: string[];
  /** Ordered from lowest to highest. */
  tiers?: GameEventTier[];
  /** Placement is the placement of the first legion of the alliance. */
  allianceRankings?: GameEventRanking[];
  /** Later reward lists that replace `allianceRankings`, in the order the game replaced them. */
  allianceRankingUpdates?: GameEventRankingVersion[];
  pointLevels?: GameEventPointLevels;
  personalRankings?: GameEventRankingTable[];
  phases?: GameEventPhase[];
  /** Also holds the separate versions of an event, such as Armament Competition. */
  days?: GameEventDay[];
  waves?: GameEventWave[];
  missions?: GameEventMission[];
  /** Set only when the points are a currency. */
  missionPointsLabel?: string;
  shopCurrencyItemId?: string;
  /** Set only when the currency is not in `items()`. */
  shopCurrencyName?: string;
  refreshes?: GameEventRefresh[];
  shop?: GameEventShopOffer[];
  /** Set when the event has one shop for each group, such as each hero generation. */
  shops?: GameEventShop[];
  heroByGeneration?: GameEventGenerationHero[];
  zones?: GameEventZone[];
  rewards?: GameEventReward[];
  tips?: string[];
  eventBuffId?: string;
}
