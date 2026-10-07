import { heroGearEnhancement } from '@/modules/hero-gear-enhancement';
import { heroGearStats, HeroGearStatsQuery } from '@/modules/hero-gear-stats';
import { testQueryBaseContract } from '../helpers';

testQueryBaseContract('heroGearStats', () => heroGearStats());

describe('HeroGearStatsQuery', () => {
  it('accepts an explicit source array', () => {
    const subset = heroGearStats().get().slice(0, 2);
    expect(new HeroGearStatsQuery(subset).count()).toBe(2);
  });

  it('uses default data when constructed without arguments', () => {
    expect(new HeroGearStatsQuery().count()).toBeGreaterThan(0);
  });

  it('bySlot() filters to the three troop types of a slot', () => {
    const goggles = heroGearStats().bySlot('goggles');
    expect(goggles.count()).toBe(3);
    expect(goggles.get().every((s) => s.slot === 'goggles')).toBe(true);
  });

  it('byTroopType() filters to the four slots of a troop type', () => {
    const lancer = heroGearStats().byTroopType('lancer');
    expect(lancer.count()).toBe(4);
    expect(lancer.get().every((s) => s.troopType === 'lancer')).toBe(true);
  });
});

describe('Hero gear stats data', () => {
  it('has 4 slots for each of the 3 troop types, each with 200 levels', () => {
    expect(heroGearStats().count()).toBe(12);
    heroGearStats()
      .get()
      .forEach((s) => {
        expect(s.levels).toHaveLength(200);
        expect(s.levels.map((l) => l.level)).toEqual(Array.from({ length: 200 }, (_, i) => i + 1));
      });
  });

  it('matches the enhancement table in its number of levels', () => {
    expect(heroGearStats().first()!.levels.length).toBe(heroGearEnhancement().count() * 2);
  });

  it('gives Attack and Lethality to Goggles and Boots, and Defense and Health to Gloves and Belt', () => {
    const labels = (slot: 'goggles' | 'boots' | 'gloves' | 'belt') =>
      heroGearStats().bySlot(slot).first()!;
    expect(labels('goggles')).toMatchObject({ combatStat: 'Attack', percentStat: 'Lethality' });
    expect(labels('boots')).toMatchObject({ combatStat: 'Attack', percentStat: 'Lethality' });
    expect(labels('gloves')).toMatchObject({ combatStat: 'Defense', percentStat: 'Health' });
    expect(labels('belt')).toMatchObject({ combatStat: 'Defense', percentStat: 'Health' });
  });

  it('has the level 100 and level 200 values of infantry goggles', () => {
    const levels = heroGearStats().find('goggles-infantry')!.levels;
    expect(levels[99]).toEqual({ level: 100, combatStat: 345, health: 3375, percentStat: 50 });
    expect(levels[199]).toEqual({ level: 200, combatStat: 690, health: 6750, percentStat: 100 });
  });

  it('has five milestones at empowerment levels 20 to 100 for every slot', () => {
    heroGearStats()
      .get()
      .forEach((s) =>
        expect(s.milestones.map((m) => m.empowermentLevel)).toEqual([20, 40, 60, 80, 100]),
      );
    expect(heroGearStats().find('goggles-infantry')!.milestones[0]).toEqual({
      empowermentLevel: 20,
      event: 'Expedition',
      stat: 'Infantry Attack +20%',
    });
    expect(heroGearStats().find('gloves-marksman')!.milestones[0].stat).toBe(
      'Marksman Defense +20%',
    );
  });
});
