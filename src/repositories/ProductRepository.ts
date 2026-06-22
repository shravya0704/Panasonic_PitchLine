import { products } from "../data/models";
import { Product } from "../types/Product";

export const ProductRepository = {
  getAll(): Product[] {
    return products;
  },

  getById(
    id: string
  ): Product | undefined {
    return products.find(
      (p) => p.id === id
    );
  },
};