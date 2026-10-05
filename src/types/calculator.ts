/** How many times each scoring action was done, by event day id and then by action text from `events()`. */
export type SvsUsage = Record<string, Record<string, number>>;

export interface SvsCalculatorOptions {
  /** Level (1 to 10) of Valeria's Well Prepared skill. Leave out when Valeria is not used. */
  valeriaLevel?: number;
}

export interface SvsLineResult {
  action: string;
  points: number;
  count: number;
  /** `points` times `count`, before any Valeria bonus. */
  subtotal: number;
}

export interface SvsScore {
  base: number;
  /** Extra points from Valeria. 0 when Valeria is not used or the day is in the Battle Phase. */
  bonus: number;
  total: number;
}

export interface SvsDayResult extends SvsScore {
  /** Day id from the event, such as `1` or `Battle`. */
  day: string;
  name: string;
  phase: 'preparation' | 'battle';
  lines: SvsLineResult[];
}

export interface SvsCalculation {
  /** Valeria's Preparation Phase bonus in percent, 0 when Valeria is not used. */
  valeriaBonusPercent: number;
  days: SvsDayResult[];
  preparation: SvsScore;
  battle: SvsScore;
  event: SvsScore;
}
