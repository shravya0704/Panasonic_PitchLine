import { ProductRepository } from "../repositories/ProductRepository";
import { Product } from "../types/Product"; // 💡 Added this import line

/**
 * Service layer for Product data operations.
 * * WHY THIS EXISTS: This acts as an intermediary orchestration layer between the React UI components 
 * (like the Configurator and Admin Table) and the raw database repository. 
 * Components should never call the repository directly. This separation ensures that if we ever 
 * change the underlying database (e.g., migrating away from Supabase), we only have to update 
 * the repository layer, while these service signatures remain exactly the same for the UI.
 */
export const ProductService = {
  /**
   * Fetches the complete catalog of active products available for configuration.
   *
   * @returns {Promise<Product[]>} A promise that resolves to an array of all Product objects.
   */
  async getProducts() {
    return ProductRepository.getAll();
  },

  /**
   * Retrieves a specific product's full details by its unique identifier.
   *
   * @param {string} id - The unique UUID of the product to fetch.
   * @returns {Promise<Product>} A promise that resolves to the requested Product object.
   */
  async getProduct(id: string) {
    return ProductRepository.getById(id);
  },

  /**
   * Permanently removes a product from the database catalog.
   * * @param {string} id - The unique UUID of the product to delete.
   * @returns {Promise<void>} A promise that resolves when the deletion is successful.
   */
  async deleteProduct(id: string) {
    return ProductRepository.delete(id);
  },

  /**
   * Registers a new LED display product model into the system catalog.
   *
   * @param {Omit<Product, 'id'>} product - The new Product object to be created (without the generated ID).
   * @returns {Promise<Product>} A promise that resolves to the newly created Product object (including its generated ID).
   */
  async createProduct(product: Omit<Product, 'id'>) {
    return ProductRepository.create(product);
  },

  /**
   * Updates an existing product's specifications or metadata in the catalog.
   *
   * @param {Product} product - The modified Product object containing the updated values and original ID.
   * @returns {Promise<Product>} A promise that resolves to the updated Product object.
   */
  async updateProduct(product: Product) {
    return ProductRepository.update(product);
  },
};

export default ProductService;