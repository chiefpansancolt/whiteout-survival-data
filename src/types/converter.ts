/** A fixed exchange rate between two items (e.g. a resource converter screen). */
export interface ItemConversion {
  id: string;
  name: string;
  fromItemId: string;
  fromQuantity: number;
  toItemId: string;
  toQuantity: number;
  /** Maximum number of times this conversion can be used per week, where the source caps it. */
  weeklyLimit?: number;
}
