import { BonusUnit } from './common';

export interface TundraAlbumBuff {
  stat: string;
  statKey: string;
  value: string;
  amount: number;
  unit: BonusUnit;
}

export interface TundraAlbumReward {
  itemId?: string;
  amount: number;
  size?: 10 | 100;
}

export type TundraAlbumStars = 1 | 2 | 3 | 4 | 5;

export interface TundraAlbumPiece {
  id: string;
  img?: string;
  stars: TundraAlbumStars;
  name: string;
}

export interface TundraAlbumPuzzle {
  id: string;
  name: string;
  img?: string;
  reward: TundraAlbumReward;
  pieces: TundraAlbumPiece[];
}

export interface TundraAlbum {
  id: string;
  name: string;
  buff: TundraAlbumBuff;
  completionRewards: TundraAlbumReward[];
  puzzles: TundraAlbumPuzzle[];
}

export interface TundraAlbumPieceRewardTier {
  tier: number;
  pieces: number;
  rewards: TundraAlbumReward[];
}
