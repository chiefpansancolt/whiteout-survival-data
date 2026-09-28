export interface ChiefCharmMaterial {
  itemId: string;
  amount: number;
}

export interface ChiefCharmLevel {
  id: string;
  name: string;
  level: number;
  stage: number;
  materials: ChiefCharmMaterial[];
  statTotalPercent: number;
  powerTotal: number;
}
