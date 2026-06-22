import { ProductRepository } from "../repositories/ProductRepository";

export const ProductService = {
  async getProducts() {
    return ProductRepository.getAll();
  },

  async getProduct(
    id: string
  ) {
    return ProductRepository.getById(id);
  },
};