/** How many times each scoring action was done, by event day id and then by action text from `events()`. */
export type EventUsage = Record<string, Record<string, number>>;

export interface EventScoreLine {
  action: string;
  points: number;
  count: number;
  /** `points` times `count`, before any expert bonus. */
  subtotal: number;
}

export interface EventScore {
  base: number;
  /** Extra points from the expert bonus. 0 when no expert is used or the bonus does not apply. */
  bonus: number;
  total: number;
}

export interface EventScoreDay extends EventScore {
  /** Day id from the event, such as `1`, `Battle`, or `s1-3`. */
  day: string;
  name: string;
  lines: EventScoreLine[];
}

export interface EventScoreCalculation {
  days: EventScoreDay[];
  event: EventScore;
}

export type SvsUsage = EventUsage;

export interface SvsCalculatorOptions {
  /** Level (1 to 10) of Valeria's Well Prepared skill. Leave out when Valeria is not used. */
  valeriaLevel?: number;
}

export type SvsLineResult = EventScoreLine;

export type SvsScore = EventScore;

export interface SvsDayResult extends EventScoreDay {
  phase: 'preparation' | 'battle';
}

export interface SvsCalculation {
  /** Valeria's Preparation Phase bonus in percent, 0 when Valeria is not used. */
  valeriaBonusPercent: number;
  days: SvsDayResult[];
  preparation: EventScore;
  battle: EventScore;
  event: EventScore;
}

export interface AllianceShowdownCalculatorOptions {
  /** Level (1 to 10) of Baldur's Dawn Hymn skill. Leave out when Baldur is not used. */
  dawnHymnLevel?: number;
}

export interface AllianceShowdownCalculation extends EventScoreCalculation {
  /** Baldur's point bonus in percent, 0 when Baldur is not used. */
  dawnHymnBonusPercent: number;
}

/** Upgrades one gear piece or one charm from a level to a level, by `id` from `chiefGear()` for gear or `chiefCharm()` for charms. */
export interface UpgradeRange {
  /** The level the piece is at now. Use `null` for a piece that has no level yet. */
  from: string | null;
  /** The level to reach. */
  to: string;
}

export interface UpgradeMaterial {
  itemId: string;
  amount: number;
}

/** Event points that the score of an upgrade earns, from the "Raise Chief Gear/Charm max score" rows of each event. */
export interface UpgradeEventPoints {
  svs: number;
  allianceShowdown: number;
  kingOfIcefield: number;
  hallOfChief: number;
}

export interface UpgradeResult {
  /** Number of upgrade steps, counting the steps inside a level. */
  steps: number;
  materials: UpgradeMaterial[];
  score: number;
  /** Power gained, from the `powerTotal` of the first level to the `powerTotal` of the last level of each range. */
  power: number;
  eventPoints: UpgradeEventPoints;
}

export type TroopType = 'infantry' | 'lancer' | 'marksman';

/** What a camp does in one batch. Tiers are 1 to 11. */
export type TroopCampAction =
  { mode: 'training'; tier: number } | { mode: 'promotion'; fromTier: number; toTier: number };

/** One run of a camp: troops in each batch, repeated for a number of batches. */
export interface TroopRun {
  action: TroopCampAction;
  /** Troops in each batch, or `max` for the capacity. */
  count: number | 'max';
  /** Number of batches, 1 or more. Defaults to 1. */
  batches?: number;
}

export interface TroopCampConfig {
  /** The camp level, as the `label` of a level of the camp in `buildings()`, such as `30` or `FC 3-2`. */
  level: string;
  /** What the camp does. A camp can train and promote, so it can have several runs. Leave out when the camp only adds its level to the shared capacity. */
  runs?: TroopRun[];
}

export interface TroopCalculatorInput {
  camps: Record<TroopType, TroopCampConfig>;
  /** Training capacity from research. Defaults to 0. */
  researchCapacity?: number;
  /** The Minister of Education buff adds 200 capacity, or 300 for the supreme buff. */
  ministerOfEducation?: 'regular' | 'supreme';
  /** The training capacity boost that multiplies the total capacity by 3. */
  capacityBoost?: boolean;
  /** Your training speed bonus in percent, as the game shows it, not counting the buffs below. Defaults to 0. */
  trainingSpeedPercent?: number;
  /** The Vice President buff adds 10% training speed, or 15% for the supreme buff. */
  vicePresident?: 'regular' | 'supreme';
  /** The Mobilize buff of the President adds 30% training speed. */
  mobilize?: boolean;
  /** The Advanced Training buff adds 20% training speed. */
  advancedTraining?: boolean;
  /** Percent off the resource cost for each troop type, from 0 to 75. Defaults to 0. */
  costReductionPercent?: Partial<Record<TroopType, number>>;
}

export interface TroopCampResult {
  /** The troops in each batch, the batches, and the seconds for all the batches of each run of the camp, in order. */
  runs: { troopsPerBatch: number; batches: number; seconds: number }[];
  /** The seconds for all runs of the camp, before any speedups. */
  seconds: number;
}

export interface TroopTierRow {
  tier: number;
  infantry: number;
  lancer: number;
  marksman: number;
  total: number;
}

export interface TroopCalculation {
  /** The most troops a camp can queue in one batch. All three camps share this capacity. */
  capacity: number;
  camps: Record<TroopType, TroopCampResult>;
  /** The change in troops for each tier from 1 to 11. Training adds troops, and promotion takes troops from the first tier and adds them to the second. */
  tiers: TroopTierRow[];
  /** The change in troops for each type, summed over all tiers. */
  totals: Omit<TroopTierRow, 'tier'>;
  /** The training speed bonus in percent that the times use, with the buffs added. */
  trainingSpeedPercent: number;
  /** Meat, wood, coal, and iron for all runs, with the cost reduction applied. Promotion costs the difference between the two tiers. */
  resources: UpgradeMaterial[];
  /** The seconds for all camps added together, which is the speedup time to finish all of them. */
  totalSeconds: number;
  /** The seconds for the camp that takes the longest, since the camps train at the same time. */
  longestCampSeconds: number;
}

/** One research line to upgrade. Levels are 0 for not researched up to the number of levels of the line. */
export interface ResearchGoal {
  /** The `id` of the research line in `research()`. */
  id: string;
  /** The level you have now. 0 when you have not started the line. */
  current: number;
  /** The level you want. */
  goal: number;
}

export interface ResearchCalculatorOptions {
  /** Your research speed bonus in percent, as the game shows it, not counting the buffs below. Defaults to 0. */
  researchSpeedPercent?: number;
  /** The state buff adds 10% research speed. */
  stateBuff?: boolean;
  /** The Vice President buff adds 10% research speed, or 15% for the supreme buff. */
  vicePresident?: 'regular' | 'supreme';
}

export interface ResearchItemResult {
  id: string;
  name: string;
  category: string;
  steps: number;
  resources: UpgradeMaterial[];
  power: number;
  /** The research time of the steps before the speed bonus. */
  baseSeconds: number;
}

/** A research level whose prerequisite is not met by the current or goal level of the other line. */
export interface UnmetResearchPrerequisite {
  /** The research line and the level that needs it. */
  id: string;
  level: number;
  /** The research line and the level that it needs. */
  requires: { id: string; level: number };
  /** The highest of the current and goal levels given for the required line, 0 when it is not given. */
  planned: number;
}

export interface ResearchCalculation {
  items: ResearchItemResult[];
  steps: number;
  resources: UpgradeMaterial[];
  power: number;
  /** The research time of all steps added together, before the speed bonus. */
  baseSeconds: number;
  /** The research speed in percent that the time uses, with the buffs added. */
  researchSpeedPercent: number;
  /** The research time after the speed bonus, rounded down. */
  seconds: number;
  /** The steps that have no research time in the data. Their time counts as 0. */
  stepsWithoutTime: number;
  unmetPrerequisites: UnmetResearchPrerequisite[];
  /** The highest level of each building that the steps need, as a level `label` of `buildings()`. */
  buildingRequirements: { id: string; level: string }[];
}
