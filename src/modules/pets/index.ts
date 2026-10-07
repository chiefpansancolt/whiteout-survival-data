import { QueryBase } from '@/common/query-base';
import data from '@/data/chief/pets.json';
import { Pet, PetRarity } from '@/types';

const petData: Pet[] = data as Pet[];

export class PetQuery extends QueryBase<Pet> {
  constructor(data: Pet[] = petData) {
    super(data);
  }

  byRarity(rarity: PetRarity): PetQuery {
    return new PetQuery(this.data.filter((p) => p.rarity === rarity));
  }
}

/** Returns a query over all pets. Pass `source` to query a different array instead of the packaged data. */
export function pets(source: Pet[] = petData): PetQuery {
  return new PetQuery(source);
}
