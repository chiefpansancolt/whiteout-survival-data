/** Base fields shared by every entry across the dataset. */
export interface Base {
  id: string;
  name: string;
  img: string;
}

/** A named, counted item, typically a cost, drop, or ingredient. */
export interface Resource {
  name: string;
  count: number;
  pricePerItem?: number;
}
