import { QueryBase } from '@/common/query-base';
import data from '@/data/pets.json';
import { Pet, PetRarity } from '@/types';

const petData: Pet[] = data as Pet[];

/** Query builder for Pet data. All filter methods return a new PetQuery for chaining. */
export class PetQuery extends QueryBase<Pet> {
  constructor(data: Pet[] = petData) {
    super(data);
  }

  /** Filter to pets of the given rarity. */
  byRarity(rarity: PetRarity): PetQuery {
    return new PetQuery(this.data.filter((p) => p.rarity === rarity));
  }
}

/** Returns a PetQuery for all Pet data. Pass `source` to wrap a pre-filtered array. */
export function pets(source: Pet[] = petData): PetQuery {
  return new PetQuery(source);
}
