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
