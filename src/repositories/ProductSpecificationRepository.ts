import { supabase } from "../lib/supabase";

export const ProductSpecificationRepository = {
  async getByModel(model: string) {
    console.log(
      "LOOKING FOR MODEL:",
      model
    );

    const { data, error } = await supabase
      .from("product_specifications")
      .select("*")
      .eq("model", model);

    console.log(
      "SPEC ROWS:",
      data
    );

    if (error) {
      throw error;
    }

    return data ?? [];
  },
};