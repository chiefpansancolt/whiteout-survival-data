import { QueryBase } from '@/common/query-base';
import pieceRewardData from '@/data/tundra-album-piece-rewards.json';
import albumData from '@/data/tundra-album.json';
import {
  TundraAlbum,
  TundraAlbumPieceRewardTier,
  TundraAlbumPuzzle,
  TundraAlbumStars,
} from '@/types';

const tundraAlbumData: TundraAlbum[] = albumData as TundraAlbum[];
const tundraAlbumPieceRewardData: TundraAlbumPieceRewardTier[] =
  pieceRewardData as TundraAlbumPieceRewardTier[];

export const TUNDRA_ALBUM_PUZZLES_PER_ALBUM = 9;

export class TundraAlbumQuery extends QueryBase<TundraAlbum> {
  constructor(data: TundraAlbum[] = tundraAlbumData) {
    super(data);
  }
}

export function tundraAlbum(source: TundraAlbum[] = tundraAlbumData): TundraAlbumQuery {
  return new TundraAlbumQuery(source);
}

/** The number of pieces of a puzzle at each star level, from 1 star to 5 stars. */
export function tundraPuzzlePieceCounts(
  puzzle: TundraAlbumPuzzle,
): Record<TundraAlbumStars, number> {
  const counts: Record<TundraAlbumStars, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const piece of puzzle.pieces) counts[piece.stars]++;
  return counts;
}

/** The tiers of the rewards for the total of pieces collected, from the lowest count of pieces. */
export function tundraAlbumPieceRewards(
  source: TundraAlbumPieceRewardTier[] = tundraAlbumPieceRewardData,
): TundraAlbumPieceRewardTier[] {
  return [...source].sort((a, b) => a.pieces - b.pieces);
}

/** The tiers that a total of pieces reaches, from the lowest count of pieces. */
export function tundraAlbumPieceRewardsReached(
  pieces: number,
  source: TundraAlbumPieceRewardTier[] = tundraAlbumPieceRewardData,
): TundraAlbumPieceRewardTier[] {
  return tundraAlbumPieceRewards(source).filter((tier) => tier.pieces <= pieces);
}
