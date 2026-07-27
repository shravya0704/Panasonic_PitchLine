import { supabase } from "../lib/supabase";

export interface ProductSpecification {
  id?: string;
  product_id: string;
  specification_name: string;
  specification_value: string;
}

export const ProductSpecificationRepository = {
  /**
   * Get all specifications for a product by model name
   */
  async getByModel(model: string): Promise<ProductSpecification[]> {
    const { data, error } = await supabase
      .from("product_specifications")
      .select("*")
      .eq("model", model);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all specifications for a product by product ID
   */
  async getByProductId(productId: string): Promise<ProductSpecification[]> {
    const { data, error } = await supabase
      .from("product_specifications")
      .select("*")
      .eq("product_id", productId);

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a single specification
   */
  async create(spec: ProductSpecification): Promise<ProductSpecification> {
    const { data, error } = await supabase
      .from("product_specifications")
      .insert({
        product_id: spec.product_id,
        specification_name: spec.specification_name,
        specification_value: spec.specification_value,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Batch create specifications for a product by model name
   */
  async createBatch(
    model: string,
    specs: Array<{ name: string; value: string }>
  ): Promise<void> {
    const rows = specs.map((spec) => ({
      model: model,
      specification_name: spec.name,
      specification_value: spec.value,
    }));

    const { error } = await supabase
      .from("product_specifications")
      .insert(rows);

    if (error) throw error;
  },

  /**
   * Update a specification
   */
  async update(id: string, value: string): Promise<void> {
    const { error } = await supabase
      .from("product_specifications")
      .update({ specification_value: value })
      .eq("id", id);

    if (error) throw error;
  },

  /**
   * Delete all specifications for a product by product ID
   */
  async deleteByProductId(productId: string): Promise<void> {
    const { error } = await supabase
      .from("product_specifications")
      .delete()
      .eq("product_id", productId);

    if (error) throw error;
  },

  /**
   * 💡 NEW: Delete all specifications for a product by model name
   * Used during atomic updates to clear old specs before inserting new ones
   */
  async deleteByModel(model: string): Promise<void> {
    const { error } = await supabase
      .from("product_specifications")
      .delete()
      .eq("model", model);

    if (error) throw error;
  },

  /**
   * Delete a single specification
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("product_specifications")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};