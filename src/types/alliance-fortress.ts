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
  rewards: AllianceFortressReward[];
}
