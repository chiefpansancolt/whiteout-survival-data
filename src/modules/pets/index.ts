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
