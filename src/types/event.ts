export type EventCategory = 'solo' | 'alliance' | 'rookie' | 'holiday';

export interface GameEventPhase {
  name: string;
  description?: string;
}

export interface GameEventReward {
  name: string;
  itemId?: string;
  decorationId?: string;
  skinId?: string;
  amount?: number;
  note?: string;
}

export interface GameEventStageLevel {
  level: number;
  tier: number;
  power: number;
  bonus: number;
  troops: { infantry: number; lancer: number; marksman: number };
  totalTroops: number;
  rewards: GameEventReward[];
  note?: string;
}

export interface GameEventRanking {
  groupRanking: string;
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
  points: number;
  levels?: number;
  levelRequirements?: GameEventMissionLevel[];
  rewards?: GameEventReward[];
  note?: string;
}

export interface GameEventScoringAction {
  action: string;
  points: number;
  itemId?: string;
  itemIds?: string[];
}

export interface GameEventVersion {
  name: string;
  note?: string;
  missions?: GameEventMission[];
  tiers?: GameEventTier[];
}

export interface GameEventDay {
  day: string;
  name: string;
  victoryPoints?: number;
  scoring: GameEventScoringAction[];
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
  resultShape?: GameEventResultShape;
  scoreUnit?: string;
  description: string;
  frequency?: string;
  duration?: string;
  schedule?: EventSchedule;
  expertTiers?: GameEventExpertTier[];
  requirements?: string[];
  tiers?: GameEventTier[];
  allianceRankings?: GameEventRanking[];
  allianceRankingUpdates?: GameEventRankingVersion[];
  pointLevels?: GameEventPointLevels;
  personalRankings?: GameEventRankingTable[];
  phases?: GameEventPhase[];
  days?: GameEventDay[];
  waves?: GameEventWave[];
  missions?: GameEventMission[];
  versions?: GameEventVersion[];
  missionPointsLabel?: string;
  shopCurrencyItemId?: string;
  shopCurrencyName?: string;
  refreshes?: GameEventRefresh[];
  shop?: GameEventShopOffer[];
  shops?: GameEventShop[];
  heroByGeneration?: GameEventGenerationHero[];
  zones?: GameEventZone[];
  rewards?: GameEventReward[];
  tips?: string[];
  eventBuffId?: string;
}
