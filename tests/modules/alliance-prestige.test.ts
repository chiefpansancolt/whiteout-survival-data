import { alliancePrestige, AlliancePrestigeQuery } from '@/modules/alliance/prestige';
import { events } from '@/modules/events';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('alliancePrestige', () => alliancePrestige());

describe('AlliancePrestigeQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = alliancePrestige().get().slice(0, 1);
    expect(new AlliancePrestigeQuery(subset).count()).toBe(1);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new AlliancePrestigeQuery().count()).toBeGreaterThan(0);
  });
});

describe('Alliance prestige buildings', () => {
  it('lists the six buildings in order', () => {
    expect(
      alliancePrestige()
        .get()
        .map((b) => b.name),
    ).toEqual([
      'Championship Statue',
      'Guardian',
      'Foundry Rewards',
      'Battle Horn',
      'Weapons Master',
      'Siege Herald',
    ]);
  });

  it('gives the event and the requirement that the package owner states for each building', () => {
    const sources = Object.fromEntries(
      alliancePrestige()
        .get()
        .map((b) => [b.id, [b.source!.event, b.source!.requirement]]),
    );
    expect(sources).toEqual({
      'championship-statue': ['Alliance Championship', 'Reach Silver III'],
      guardian: ['Alliance Mobilization', 'Reach Senior Tier'],
      'foundry-rewards': ['Foundry Battle', 'S-rated'],
      'battle-horn': ['Alliance Showdown', '5-Star'],
      'weapons-master': ['Tundra Arms League', 'Advance to Championships'],
      'siege-herald': ['Winter Siege', 'Reach Pioneer Tier'],
    });
  });

  it('links each event that the package has to events() by its id and name', () => {
    const linked = alliancePrestige()
      .get()
      .filter((b) => b.source?.eventId !== undefined);
    expect(linked.map((b) => b.id)).toEqual([
      'championship-statue',
      'guardian',
      'foundry-rewards',
      'battle-horn',
      'weapons-master',
    ]);
    for (const building of linked) {
      const event = events().find(building.source!.eventId!);
      expect(event).toBeDefined();
      expect(event!.name).toBe(building.source!.event);
    }
    expect(alliancePrestige().find('siege-herald')!.source!.eventId).toBeUndefined();
  });

  it('gives every building four tiers of one Resource Gathering Speed bonus', () => {
    const amounts = [3, 5, 7, 10];
    for (const building of alliancePrestige().get()) {
      expect(building.levels).toHaveLength(4);
      building.levels!.forEach((level, i) => {
        expect(level.bonuses).toEqual([
          {
            stat: 'Resource Gathering Speed',
            statKey: 'resource-gathering-speed',
            value: `+${amounts[i]}%`,
            amount: amounts[i],
            unit: 'percent',
          },
        ]);
      });
    }
  });

  it('names the tiers of the Championship Statue and numbers the tiers of the other buildings', () => {
    const names = (id: string) =>
      alliancePrestige()
        .find(id)!
        .levels!.map((l) => l.name);
    expect(names('championship-statue')).toEqual(['Silver', 'Gold', 'Diamond', 'Ultimate']);
    for (const building of alliancePrestige().get().slice(1)) {
      expect(building.levels!.map((l) => l.name)).toEqual(['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4']);
    }
  });

  it('uses the stat key of the Resource Gathering Speed of the Alliance Facilities', () => {
    const keys = new Set(
      alliancePrestige()
        .get()
        .flatMap((b) => b.levels!.flatMap((l) => l.bonuses.map((x) => x.statKey))),
    );
    expect([...keys]).toEqual(['resource-gathering-speed']);
  });

  it('finds a building by name', () => {
    expect(alliancePrestige().findByName('Battle Horn')!.id).toBe('battle-horn');
  });
});
