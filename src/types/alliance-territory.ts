export interface AllianceBannerCost {
  itemId: string;
  amount: number;
}

export interface AllianceBannerLevel {
  id: string;
  name: string;
  minLevel: number;
  maxLevel: number;
  cost: AllianceBannerCost[];
}
