import { supabase } from "../lib/supabase";
import { Product } from "../types/Product";
import { ProductMapper } from "../mappers/ProductMapper";

export const ProductRepository = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*");

    if (error) {
      throw error;
    }

    return data?.map(ProductMapper.fromDatabase) ?? [];
  },

  async getById(id: string): Promise<Product | undefined> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return ProductMapper.fromDatabase(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }
  },

  async create(product: Product): Promise<void> {
    const { error } = await supabase
      .from("products")
      .insert(ProductMapper.toDatabase(product));

    if (error) {
      throw error;
    }
  },

  async update(product: Product): Promise<void> {
    const { error } = await supabase
      .from("products")
      .update(ProductMapper.toDatabase(product))
      .eq("id", product.id);

    if (error) {
      throw error;
    }
  },
};