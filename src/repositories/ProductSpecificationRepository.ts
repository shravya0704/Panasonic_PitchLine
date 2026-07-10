import { supabase } from "../lib/supabase";

export const ProductSpecificationRepository = {
  async getByModel(model: string) {
    const { data, error } = await supabase
      .from("product_specifications")
      .select("*")
      .eq("model", model);

    if (error) {
      throw error;
    }

    return data ?? [];
  },
};