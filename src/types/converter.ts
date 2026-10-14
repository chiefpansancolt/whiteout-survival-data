export interface ItemConversion {
  id: string;
  name: string;
  fromItemId: string;
  fromQuantity: number;
  toItemId: string;
  toQuantity: number;
  weeklyLimit?: number;
}
