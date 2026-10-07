import { calculatePets, PET_ADVANCEMENT_INTERVAL } from '@/modules/calculators';
import { events } from '@/modules/events';
import { pets } from '@/modules/pets';

const hyena = (current: number, goal: number, extra = {}) => ({
  id: 'cave-hyena',
  current,
  goal,
  ...extra,
});
const amountOf = (materials: { itemId: string; amount: number }[], itemId: string) =>
  materials.find((m) => m.itemId === itemId)?.amount;

describe('calculatePets', () => {
  it('returns zero for no goals', () => {
    expect(calculatePets()).toEqual({
      items: [],
      levels: 0,
      advancements: 0,
      resources: [],
      troopAttack: 0,
      troopDefense: 0,
      power: 0,
      advancementScore: 0,
      eventPoints: { svs: 0, allianceShowdown: 0, kingOfIcefield: 0 },
    });
  });

  it('costs the pet food of each level after the current level up to the goal', () => {
    const result = calculatePets([hyena(1, 10)]);
    expect(result.levels).toBe(9);
    expect(result.resources).toEqual([{ itemId: 'pet-food', amount: 1715 }]);
    expect(result.advancements).toBe(0);
  });

  it('gives the stat gains between the two levels', () => {
    const result = calculatePets([hyena(1, 10)]);
    expect(result.troopAttack).toBe(0.45);
    expect(result.troopDefense).toBe(0.45);
    expect(result.power).toBe(36000 - 3600);
    expect(result.items[0]).toMatchObject({ id: 'cave-hyena', name: 'Cave Hyena', levels: 9 });
  });

  it('pays for the advancement at a multiple of 10 that the range passes', () => {
    const result = calculatePets([hyena(1, 11)]);
    expect(result.advancements).toBe(1);
    expect(result.resources).toEqual([
      { itemId: 'pet-food', amount: 1965 },
      { itemId: 'taming-manual', amount: 15 },
    ]);
    expect(result.troopAttack).toBe(0.92);
    expect(result.power).toBe(69840 - 3600);
  });

  it('pays for the advancement of a pet that starts at a multiple of 10', () => {
    const result = calculatePets([hyena(10, 11)]);
    expect(result.advancements).toBe(1);
    expect(amountOf(result.resources, 'pet-food')).toBe(250);
    expect(amountOf(result.resources, 'taming-manual')).toBe(15);
  });

  it('does not pay again for a pet that is already advanced at its current level', () => {
    const result = calculatePets([hyena(10, 11, { currentAdvanced: true })]);
    expect(result.advancements).toBe(0);
    expect(result.resources).toEqual([{ itemId: 'pet-food', amount: 250 }]);
    expect(result.troopAttack).toBe(0.05);
    expect(result.power).toBe(69840 - 66240);
  });

  it('pays only for the advancement when the goal is the current level and is advanced', () => {
    const result = calculatePets([hyena(10, 10, { goalAdvanced: true })]);
    expect(result.levels).toBe(0);
    expect(result.advancements).toBe(1);
    expect(result.resources).toEqual([{ itemId: 'taming-manual', amount: 15 }]);
    expect(result.troopAttack).toBe(0.42);
    expect(result.power).toBe(66240 - 36000);
  });

  it('pays for the final advancement at the max level only when asked', () => {
    const plain = calculatePets([hyena(49, 50)]);
    expect(plain.resources).toEqual([{ itemId: 'pet-food', amount: 1320 }]);
    const advanced = calculatePets([hyena(49, 50, { goalAdvanced: true })]);
    expect(advanced.advancements).toBe(1);
    expect(amountOf(advanced.resources, 'taming-manual')).toBe(90);
    expect(amountOf(advanced.resources, 'energizing-potion')).toBe(30);
    expect(amountOf(advanced.resources, 'strengthening-serum')).toBe(10);
    expect(advanced.troopAttack).toBe(0.67);
  });

  it('costs nothing when the goal equals the current level', () => {
    const result = calculatePets([hyena(5, 5)]);
    expect(result).toMatchObject({ levels: 0, advancements: 0, resources: [], power: 0 });
  });

  it('adds up every level and advancement for a full upgrade', () => {
    const pet = pets().find('cave-hyena')!;
    const result = calculatePets([hyena(1, pet.maxLevel, { goalAdvanced: true })]);
    expect(amountOf(result.resources, 'pet-food')).toBe(
      pet.levels.reduce((sum, l) => sum + l.petFoodCost, 0),
    );
    expect(result.advancements).toBe(pet.maxLevel / PET_ADVANCEMENT_INTERVAL);
  });

  it('adds the pets together', () => {
    const result = calculatePets([hyena(1, 10), { id: 'arctic-wolf', current: 1, goal: 10 }]);
    expect(result.items).toHaveLength(2);
    expect(result.levels).toBe(18);
    expect(amountOf(result.resources, 'pet-food')).toBe(
      result.items[0].resources[0].amount + result.items[1].resources[0].amount,
    );
    expect(result.power).toBe(result.items[0].power + result.items[1].power);
    expect(result.troopAttack).toBe(
      Math.round((result.items[0].troopAttack + result.items[1].troopAttack) * 100) / 100,
    );
  });

  it('rejects unknown pets, levels out of range, goals below the current level, and advanced flags off a multiple of 10', () => {
    expect(() => calculatePets([{ id: 'nope', current: 1, goal: 2 }])).toThrow('Unknown pet: nope');
    expect(() => calculatePets([hyena(0, 5)])).toThrow(
      'The current level of cave-hyena must be a whole number from 1 to 50',
    );
    expect(() => calculatePets([hyena(1, 51)])).toThrow(RangeError);
    expect(() => calculatePets([hyena(1, 2.5)])).toThrow(RangeError);
    expect(() => calculatePets([hyena(9, 5)])).toThrow(
      'The goal level of cave-hyena must not be below the current level',
    );
    expect(() => calculatePets([hyena(5, 11, { currentAdvanced: true })])).toThrow(
      'The current advancement of cave-hyena needs a level that is a multiple of 10',
    );
    expect(() => calculatePets([hyena(1, 11, { goalAdvanced: true })])).toThrow(
      'The goal advancement of cave-hyena needs a level that is a multiple of 10',
    );
  });

  it('exports the advancement interval', () => {
    expect(PET_ADVANCEMENT_INTERVAL).toBe(10);
  });

  it('adds the advancement score of each advancement paid for', () => {
    expect(calculatePets([hyena(1, 10)]).advancementScore).toBe(0);
    expect(calculatePets([hyena(1, 11)]).advancementScore).toBe(500);
    expect(calculatePets([hyena(1, 50, { goalAdvanced: true })]).advancementScore).toBe(
      500 + 1000 + 2000 + 3000 + 4500,
    );
    expect(calculatePets([hyena(10, 11, { currentAdvanced: true })]).advancementScore).toBe(0);
    expect(calculatePets([hyena(10, 10, { goalAdvanced: true })]).advancementScore).toBe(500);
  });

  it('turns the advancement score into event points with the points of each event', () => {
    const result = calculatePets([hyena(1, 50, { goalAdvanced: true })]);
    expect(result.eventPoints).toEqual({
      svs: 11000 * 50,
      allianceShowdown: 11000 * 30,
      kingOfIcefield: 11000 * 50,
    });
    expect(result.items[0].eventPoints).toEqual(result.eventPoints);
  });

  it('adds the score and event points of several pets', () => {
    const result = calculatePets([hyena(1, 11), { id: 'cave-lion', current: 1, goal: 31 }]);
    expect(result.advancementScore).toBe(500 + 500 + 1000 + 2000);
    expect(result.eventPoints.svs).toBe(4000 * 50);
  });

  it('reads one points value for each event from the pet advancement row of the event', () => {
    ['svs-state-of-power', 'alliance-showdown', 'king-of-icefield'].forEach((id) => {
      const points = events()
        .find(id)!
        .days!.flatMap((d) => d.scoring)
        .filter((row) => /^Pet advancement score/.test(row.action))
        .map((row) => row.points);
      expect(points.length).toBeGreaterThan(0);
      expect(new Set(points).size).toBe(1);
    });
  });
});

describe('pet advancement score data', () => {
  const SCORES = [500, 1000, 2000, 3000, 4500, 6750, 10000, 12000, 14500, 17500];

  it('gives every advancement row the score of its level, the same for every pet', () => {
    pets()
      .get()
      .forEach((pet) => {
        const rows = pet.levels.filter((l) => l.advancementMaterials !== undefined);
        expect(rows.map((l) => l.level)).toEqual(
          Array.from({ length: pet.maxLevel / 10 }, (_, i) => (i + 1) * 10),
        );
        rows.forEach((l) => expect(l.advancementScore).toBe(SCORES[l.level / 10 - 1]));
        pet.levels
          .filter((l) => l.advancementMaterials === undefined)
          .forEach((l) => expect(l.advancementScore).toBeUndefined());
      });
  });

  it('matches the scores from level 40 up in the King of Icefield note from the wiki', () => {
    const note = events().find('king-of-icefield')!.days![2].note!;
    const wiki = [...note.matchAll(/Lv\. (\d+) ([\d,]+)/g)]
      .filter((m) => Number(m[1]) >= 40 && Number(m[1]) <= 100)
      .map((m) => Number(m[2].replace(/,/g, '')));
    expect(wiki.slice(0, 7)).toEqual(SCORES.slice(3));
  });
});
