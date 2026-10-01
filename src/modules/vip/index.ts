import { QueryBase } from '@/common/query-base';
import data from '@/data/vip.json';
import { VipLevel } from '@/types';

const vipData: VipLevel[] = data as VipLevel[];

/** Query builder for VipLevel data. All filter methods return a new VipQuery for chaining. */
export class VipQuery extends QueryBase<VipLevel> {
  constructor(data: VipLevel[] = vipData) {
    super(data);
  }

  /** Filter to the given VIP level. */
  byLevel(level: number): VipQuery {
    return new VipQuery(this.data.filter((l) => l.level === level));
  }

  /** Filter to the highest VIP level reachable with the given total XP. */
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

/** Returns a VipQuery for the full VIP 1-12 progression. Pass `source` to wrap a pre-filtered array. */
export function vip(source: VipLevel[] = vipData): VipQuery {
  return new VipQuery(source);
}
