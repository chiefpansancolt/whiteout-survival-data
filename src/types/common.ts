export interface Base {
  id: string;
  name: string;
  img: string;
}

export interface Resource {
  name: string;
  count: number;
  pricePerItem?: number;
}
