import { QueryBase } from '@/common/query-base';
import data from '@/data/vip.json';
import { VipLevel } from '@/types';

const vipData: VipLevel[] = data as VipLevel[];

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
