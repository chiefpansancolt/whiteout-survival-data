import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/pets.json';
import { Pet, PetRarity } from '@/types';

const petData: Pet[] = data as Pet[];

export const PET_REFINEMENT_STATS = [
  { stat: 'Infantry Lethality', statKey: 'infantry-lethality' },
  { stat: 'Infantry Health', statKey: 'infantry-health' },
  { stat: 'Lancer Lethality', statKey: 'lancer-lethality' },
  { stat: 'Lancer Health', statKey: 'lancer-health' },
  { stat: 'Marksman Lethality', statKey: 'marksman-lethality' },
  { stat: 'Marksman Health', statKey: 'marksman-health' },
] as const;

export const PET_REFINING_POWER_PER_PERCENT = 12000;

/**
 * Refining Power of a pet. The power is 120 for each 0.01 percent of the refined stats added up, which
 * is 12,000 for each 1 percent, and it does not depend on the pet.
 *
 * @param percents The refinement percents of the six stats, in the order of `PET_REFINEMENT_STATS`.
 * @throws RangeError when a percent is negative or not a number.
 */
export function petRefiningPower(percents: number[]): number {
  const hundredths = percents.reduce((sum, percent) => {
    if (!Number.isFinite(percent) || percent < 0) {
      throw new RangeError('A refinement percent must be a number that is not negative');
    }
    return sum + Math.round(percent * 100);
  }, 0);
  return (hundredths * PET_REFINING_POWER_PER_PERCENT) / 100;
}

export class PetQuery extends QueryBase<Pet> {
  constructor(data: Pet[] = petData) {
    super(data);
  }

  byRarity(rarity: PetRarity): PetQuery {
    return new PetQuery(this.data.filter((p) => p.rarity === rarity));
  }
}

export function pets(source: Pet[] = petData): PetQuery {
  return new PetQuery(source);
}
