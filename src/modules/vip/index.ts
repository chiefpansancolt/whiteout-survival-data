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

  /**
   * Keeps only the highest level that the total XP reaches. The XP needed for a level is the sum of
   * `xpRequired` up to that level. The result is empty if the XP reaches no level.
   */
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

/** Returns a query over all VIP levels. Pass `source` to query a different array instead of the packaged data. */
export function vip(source: VipLevel[] = vipData): VipQuery {
  return new VipQuery(source);
}
