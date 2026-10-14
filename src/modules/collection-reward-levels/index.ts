import { QueryBase } from '@/common/query-base';
import medallionData from '@/data/collection-medallions.json';
import rewardLevelData from '@/data/collection-reward-levels.json';
import { CollectionMedallion, CollectionRewardLevel } from '@/types';

const collectionMedallionData: CollectionMedallion[] = medallionData as CollectionMedallion[];
const collectionRewardLevelData: CollectionRewardLevel[] =
  rewardLevelData as CollectionRewardLevel[];

export const COLLECTION_MAX_LEVEL = 51;

export class CollectionMedallionQuery extends QueryBase<CollectionMedallion> {
  constructor(data: CollectionMedallion[] = collectionMedallionData) {
    super(data);
  }
}

/** The medallions of the collection, from the lowest to the highest. */
export function collectionMedallions(
  source: CollectionMedallion[] = collectionMedallionData,
): CollectionMedallionQuery {
  return new CollectionMedallionQuery(source);
}

/** The levels of the collection with what each gives, from level 1. */
export function collectionRewardLevels(
  source: CollectionRewardLevel[] = collectionRewardLevelData,
): CollectionRewardLevel[] {
  return [...source].sort((a, b) => a.level - b.level);
}

/**
 * The medallion that you hold at a collection level: the one with the highest `unlockLevel` that
 * the level reaches. Gives `undefined` below level 1.
 */
export function collectionMedallionAt(
  level: number,
  source: CollectionMedallion[] = collectionMedallionData,
): CollectionMedallion | undefined {
  return source
    .filter((medallion) => medallion.unlockLevel <= level)
    .sort((a, b) => b.unlockLevel - a.unlockLevel)[0];
}
