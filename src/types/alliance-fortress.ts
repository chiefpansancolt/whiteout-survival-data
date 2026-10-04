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
  /** One reward per phase (1-8). Empty for the castle, whose rewards are not documented. */
  rewards: AllianceFortressReward[];
}
