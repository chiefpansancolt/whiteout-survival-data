import { QueryBase } from '@/common/query-base';
import albumData from '@/data/tundra-album.json';
import { TundraAlbum, TundraAlbumPuzzle, TundraAlbumStars } from '@/types';

const tundraAlbumData: TundraAlbum[] = albumData as TundraAlbum[];

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
