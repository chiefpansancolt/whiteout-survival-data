export type PetRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface PetPrerequisitePet {
  name: string;
  level: number;
}

export interface PetUnlockRequirement {
  daysRequired: number;
  furnaceLevel?: number;
  prerequisitePet?: PetPrerequisitePet;
}

export interface PetSkill {
  name: string;
  img: string;
  description: string;
  values: number[];
  durationSeconds?: number;
  cooldownSeconds?: number;
  cooldownSecondsByTier?: number[];
}

export interface PetStatValue {
  value: number;
  refinedValue?: number;
}

export interface PetAdvancementMaterial {
  itemId: string;
  amount: number;
}

export interface PetLevel {
  level: number;
  petFoodCost: number;
  advancementMaterials?: PetAdvancementMaterial[];
  troopAttack: PetStatValue;
  troopDefense: PetStatValue;
  troopsPower: PetStatValue;
}

export interface Pet {
  id: string;
  name: string;
  img: string;
  rarity: PetRarity;
  maxLevel: number;
  maxRefinementPercent: number;
  unlockRequirement: PetUnlockRequirement;
  skill: PetSkill;
  levels: PetLevel[];
}
