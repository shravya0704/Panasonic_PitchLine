import { supabase } from "../lib/supabase";
import { Product } from "../types/Product";

export const ProductRepository = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*");

    if (error) {
      throw error;
    }

    return (
      data?.map((row) => ({
        id: row.id,
        model: row.model,
        seriesCode: row.series_code,
        applicationType: row.application_type,
        pitch: row.pitch,
        brightness: row.brightness,
        cabinetWidth: row.cabinet_width,
        cabinetHeight: row.cabinet_height,
        cabinetResolutionW: row.cabinet_resolution_w,
        cabinetResolutionH: row.cabinet_resolution_h,
        modulesPerCabinet: row.modules_per_cabinet,
      })) ?? []
    );
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

    return {
      id: data.id,
      model: data.model,
      seriesCode: data.series_code,
      applicationType: data.application_type,
      pitch: data.pitch,
      brightness: data.brightness,
      cabinetWidth: data.cabinet_width,
      cabinetHeight: data.cabinet_height,
      cabinetResolutionW: data.cabinet_resolution_w,
      cabinetResolutionH: data.cabinet_resolution_h,
      modulesPerCabinet: data.modules_per_cabinet,
    };
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
};