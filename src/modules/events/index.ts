import { QueryBase } from '@/common/query-base';
import allianceChampionship from '@/data/events/alliance-championship.json';
import allianceMobilization from '@/data/events/alliance-mobilization.json';
import allianceShowdown from '@/data/events/alliance-showdown.json';
import armamentCompetition from '@/data/events/armament-competition.json';
import bearHunt from '@/data/events/bear-hunt.json';
import brothersInArms from '@/data/events/brothers-in-arms.json';
import canyonClash from '@/data/events/canyon-clash.json';
import cityDevelopment from '@/data/events/city-development.json';
import crazyJoe from '@/data/events/crazy-joe.json';
import defeatNearbyBeasts from '@/data/events/defeat-nearby-beasts.json';
import developNewTech2 from '@/data/events/develop-new-tech-2.json';
import developNewTech from '@/data/events/develop-new-tech.json';
import fishingTournament from '@/data/events/fishing-tournament.json';
import flameAndFang from '@/data/events/flame-and-fang.json';
import foundryBattle from '@/data/events/foundry-battle.json';
import frostdragonTyrant from '@/data/events/frostdragon-tyrant.json';
import frostfireMine from '@/data/events/frostfire-mine.json';
import growYourHeroes from '@/data/events/grow-your-heroes.json';
import hallOfChief from '@/data/events/hall-of-chief.json';
import hallOfHeroes from '@/data/events/hall-of-heroes.json';
import heroRally from '@/data/events/hero-rally.json';
import herosMission from '@/data/events/heros-mission.json';
import homeBeyond from '@/data/events/home-beyond.json';
import icefireWarhymnLeague from '@/data/events/icefire-warhymn-league.json';
import kingOfIcefield from '@/data/events/king-of-icefield.json';
import luckyWheel from '@/data/events/lucky-wheel.json';
import mercenaryPrestige from '@/data/events/mercenary-prestige.json';
import miaFortune from '@/data/events/mia-fortune.json';
import officerProject from '@/data/events/officer-project.json';
import planYourCity from '@/data/events/plan-your-city.json';
import powerUp from '@/data/events/power-up.json';
import snowbusters from '@/data/events/snowbusters.json';
import standOfArms from '@/data/events/stand-of-arms.json';
import sunfireCastle from '@/data/events/sunfire-castle.json';
import svsStateOfPower from '@/data/events/svs-state-of-power.json';
import theLabyrinth from '@/data/events/the-labyrinth.json';
import treasureHunter from '@/data/events/treasure-hunter.json';
import trialEvent from '@/data/events/trial-event.json';
import trustedChief from '@/data/events/trusted-chief.json';
import tundraArmsLeague from '@/data/events/tundra-arms-league.json';
import tundraGames from '@/data/events/tundra-games.json';
import tundraTradeRoute from '@/data/events/tundra-trade-route.json';
import tundraTradingStationGuide from '@/data/events/tundra-trading-station-guide.json';
import warPreparation from '@/data/events/war-preparation.json';
import wildBrawl from '@/data/events/wild-brawl.json';
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
  armamentCompetition,
  brothersInArms,
  fishingTournament,
  herosMission,
  officerProject,
  theLabyrinth,
  treasureHunter,
  tundraTradingStationGuide,
  defeatNearbyBeasts,
  flameAndFang,
  heroRally,
  luckyWheel,
  snowbusters,
  standOfArms,
  tundraGames,
  wildBrawl,
  cityDevelopment,
  developNewTech,
  developNewTech2,
  growYourHeroes,
  homeBeyond,
  planYourCity,
  powerUp,
  trialEvent,
  trustedChief,
  warPreparation,
  hallOfChief,
  hallOfHeroes,
  miaFortune,
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
