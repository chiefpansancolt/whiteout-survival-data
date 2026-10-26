import { QueryBase } from '@/common/query-base';
import signInData from '@/data/vip-sign-in.json';
import data from '@/data/vip.json';
import { VipLevel, VipSignInReward } from '@/types';

const vipData: VipLevel[] = data as VipLevel[];
const signInRewards: VipSignInReward[] = signInData as VipSignInReward[];

export class VipQuery extends QueryBase<VipLevel> {
  constructor(data: VipLevel[] = vipData) {
    super(data);
  }

  byLevel(level: number): VipQuery {
    return new VipQuery(this.data.filter((l) => l.level === level));
  }

  /** Keeps the highest level that `totalXp` reaches. The XP for a level is the sum of `xpRequired` up to it. */
  atXp(totalXp: number): VipQuery {
    let cumulativeXp = 0;
    let reached: VipLevel | undefined;
    for (const level of this.data) {
      cumulativeXp += level.xpRequired;
      if (cumulativeXp > totalXp) break;
      reached = level;
    }
    return new VipQuery(reached ? [reached] : []);
  }
}

export function vip(source: VipLevel[] = vipData): VipQuery {
  return new VipQuery(source);
}

/** Returns the VIP points of the daily sign-in for each day of the streak, from day 1 up. */
export function vipSignInRewards(): VipSignInReward[] {
  return signInRewards;
}

/**
 * Returns the VIP points that the daily sign-in gives on a day of the streak. Day 1 gives 100
 * points, and each day adds 100 up to 500 on day 5. Every day after day 5 gives 500.
 *
 * @param streakDay The day of the sign-in streak, counted from 1.
 * @throws RangeError when `streakDay` is not a whole number of 1 or more.
 */
export function vipSignInPoints(streakDay: number): number {
  if (!Number.isInteger(streakDay) || streakDay < 1) {
    throw new RangeError('The streak day must be a whole number of 1 or more');
  }
  return signInRewards.filter((reward) => reward.streakDay <= streakDay).pop()!.points;
}
