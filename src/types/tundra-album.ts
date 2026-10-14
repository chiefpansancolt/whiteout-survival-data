import { BonusUnit } from './common';

export interface TundraAlbumBuff {
  stat: string;
  statKey: string;
  value: string;
  amount: number;
  unit: BonusUnit;
}

export interface TundraAlbumReward {
  /** The id of the item in `items()`. Left out when the item is not known. */
  itemId?: string;
  amount: number;
}

export type TundraAlbumStars = 1 | 2 | 3 | 4 | 5;

export interface TundraAlbumPiece {
  /** The id of the puzzle and the position of the piece in it, such as `fiery-crystal-1`. */
  id: string;
  /** The image of the piece. */
  img?: string;
  stars: TundraAlbumStars;
  /** The name of the puzzle, a dash, and the position of the piece, such as `Fiery Crystal - 1`. */
  name: string;
}

export interface TundraAlbumPuzzle {
  id: string;
  name: string;
  /** The picture of the puzzle. */
  img?: string;
  /** What the puzzle gives when all its pieces are placed. */
  reward: TundraAlbumReward;
  /** In the order of the album: by stars, from 1 star up. */
  pieces: TundraAlbumPiece[];
}

export interface TundraAlbum {
  id: string;
  name: string;
  /** The buff that the album gives when all its puzzles are done. */
  buff: TundraAlbumBuff;
  /** What the album gives when all its puzzles are done, besides the buff. */
  completionRewards: TundraAlbumReward[];
  puzzles: TundraAlbumPuzzle[];
}
