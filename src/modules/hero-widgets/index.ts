import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/hero-widget-levels.json';
import { HeroWidgetLevel } from '@/types';

const heroWidgetData: HeroWidgetLevel[] = data as HeroWidgetLevel[];

/** Query builder for HeroWidgetLevel data. All filter methods return a new HeroWidgetQuery for chaining. */
export class HeroWidgetQuery extends QueryBase<HeroWidgetLevel> {
  constructor(data: HeroWidgetLevel[] = heroWidgetData) {
    super(data);
  }

  /** Filter to the row at the given exclusive weapon level. */
  byLevel(level: number): HeroWidgetQuery {
    return new HeroWidgetQuery(this.data.filter((l) => l.level === level));
  }
}

/** Returns a HeroWidgetQuery for the Widgets each exclusive weapon level costs. Pass `source` to wrap a pre-filtered array. */
export function heroWidgets(source: HeroWidgetLevel[] = heroWidgetData): HeroWidgetQuery {
  return new HeroWidgetQuery(source);
}
