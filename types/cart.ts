import type { Product } from "./product";

export type CartItem = {
  key: string;
  product: Product;
  size: string;
  colour: string;
  quantity: number;
};
