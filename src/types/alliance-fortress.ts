export type AllianceFortressKind = 'castle' | 'stronghold' | 'fortress';

export interface AllianceFortressReward {
  phase: number;
  reward: string;
}

export interface AllianceFortress {
  id: string;
  name: string;
  kind: AllianceFortressKind;
  x: number;
  y: number;
  /** One reward for each phase, 1 to 8. Empty for the castle, because its rewards are not documented. */
  rewards: AllianceFortressReward[];
}
