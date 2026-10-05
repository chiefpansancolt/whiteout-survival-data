import { QueryBase } from '@/common/query-base';
import allianceChampionship from '@/data/events/alliance-championship.json';
import allianceMobilization from '@/data/events/alliance-mobilization.json';
import allianceShowdown from '@/data/events/alliance-showdown.json';
import bearHunt from '@/data/events/bear-hunt.json';
import canyonClash from '@/data/events/canyon-clash.json';
import crazyJoe from '@/data/events/crazy-joe.json';
import foundryBattle from '@/data/events/foundry-battle.json';
import frostdragonTyrant from '@/data/events/frostdragon-tyrant.json';
import frostfireMine from '@/data/events/frostfire-mine.json';
import icefireWarhymnLeague from '@/data/events/icefire-warhymn-league.json';
import kingOfIcefield from '@/data/events/king-of-icefield.json';
import mercenaryPrestige from '@/data/events/mercenary-prestige.json';
import sunfireCastle from '@/data/events/sunfire-castle.json';
import svsStateOfPower from '@/data/events/svs-state-of-power.json';
import tundraArmsLeague from '@/data/events/tundra-arms-league.json';
import tundraTradeRoute from '@/data/events/tundra-trade-route.json';
import { EventCategory, GameEvent } from '@/types';

const eventsData: GameEvent[] = [
  allianceChampionship,
  bearHunt,
  canyonClash,
  crazyJoe,
  foundryBattle,
  frostdragonTyrant,
  frostfireMine,
  icefireWarhymnLeague,
  tundraArmsLeague,
  tundraTradeRoute,
  allianceMobilization,
  allianceShowdown,
  kingOfIcefield,
  mercenaryPrestige,
  sunfireCastle,
  svsStateOfPower,
] as GameEvent[];

/** Query builder for GameEvent data. All filter methods return a new EventsQuery for chaining. */
export class EventsQuery extends QueryBase<GameEvent> {
  constructor(data: GameEvent[] = eventsData) {
    super(data);
  }

  /** Filter to events in one wiki category: solo, alliance, rookie, or holiday. */
  byCategory(category: EventCategory): EventsQuery {
    return new EventsQuery(this.data.filter((e) => e.category === category));
  }
}

/** Returns an EventsQuery for every tracked game event. Pass `source` to wrap a pre-filtered array. */
export function events(source: GameEvent[] = eventsData): EventsQuery {
  return new EventsQuery(source);
}
