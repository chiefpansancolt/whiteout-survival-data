import { QueryBase } from '@/common/query-base';
import rewardLevelData from '@/data/daily-mission-reward-levels.json';
import missionData from '@/data/daily-missions.json';
import { DailyMission, DailyMissionLevel, DailyMissionRewardLevel } from '@/types';

const dailyMissionData: DailyMission[] = missionData as DailyMission[];
const dailyMissionRewardLevelData: DailyMissionRewardLevel[] =
  rewardLevelData as DailyMissionRewardLevel[];

export const DAILY_MISSION_ACTIVENESS_ITEM_ID = 'activeness';

export class DailyMissionQuery extends QueryBase<DailyMission> {
  constructor(data: DailyMission[] = dailyMissionData) {
    super(data);
  }
}

export function dailyMissions(source: DailyMission[] = dailyMissionData): DailyMissionQuery {
  return new DailyMissionQuery(source);
}

/** The reward levels of the activity bar, from the lowest to the highest points. */
export function dailyMissionRewardLevels(
  source: DailyMissionRewardLevel[] = dailyMissionRewardLevelData,
): DailyMissionRewardLevel[] {
  return [...source].sort((a, b) => a.activeness - b.activeness);
}

/** The activeness that a level of a mission gives. It is the amount of the `activeness` reward. */
export function dailyMissionActiveness(level: DailyMissionLevel): number {
  return level.rewards
    .filter((reward) => reward.itemId === DAILY_MISSION_ACTIVENESS_ITEM_ID)
    .reduce((sum, reward) => sum + reward.amount, 0);
}

/**
 * The activeness of a mission that is done up to a level. The levels add up: a mission done at level 2
 * gives the activeness of level 1 and of level 2.
 */
export function dailyMissionActivenessThrough(mission: DailyMission, level: number): number {
  return mission.levels
    .filter((l) => l.level <= level)
    .reduce((sum, l) => sum + dailyMissionActiveness(l), 0);
}
