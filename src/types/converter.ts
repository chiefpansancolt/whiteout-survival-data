export interface ItemConversion {
  id: string;
  name: string;
  fromItemId: string;
  fromQuantity: number;
  toItemId: string;
  toQuantity: number;
  /** Maximum uses of this conversion per week. Absent where the source states no cap. */
  weeklyLimit?: number;
}
