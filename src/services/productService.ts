import { ProductRepository } from "../repositories/ProductRepository";

export const ProductService = {
  getProducts() {
    return ProductRepository.getAll();
  },

  getProduct(
    id: string
  ) {
    return ProductRepository.getById(id);
  },
};