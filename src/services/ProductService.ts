import { ProductRepository } from "../repositories/ProductRepository";
import { Product } from "../types/Product"; // 💡 Added this import line

export const ProductService = {
  async getProducts() {
    return ProductRepository.getAll();
  },

  async getProduct(id: string) {
    return ProductRepository.getById(id);
  },

  async deleteProduct(id: string) {
    return ProductRepository.delete(id);
  },

  async createProduct(product: Product) {
    return ProductRepository.create(product);
  },

  async updateProduct(product: Product) {
    return ProductRepository.update(product);
  },
};