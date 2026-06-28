import { supabase } from "../lib/supabase";
import { Product } from "../types/Product";

export const ProductRepository = {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*");

    if (error) throw error;

    return (
      data?.map((row) => ({
        id: row.id,

        model: row.model,
        seriesCode: row.series_code,
        applicationType: row.application_type,

        pitch: row.pitch,
        brightness: row.brightness,

        maxPowerPerM2: row.max_power_per_m2,
        avgPowerPerM2: row.avg_power_per_m2,

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

    if (error) throw error;

    return {
      id: data.id,

      model: data.model,
      seriesCode: data.series_code,
      applicationType: data.application_type,

      pitch: data.pitch,
      brightness: data.brightness,

      maxPowerPerM2: data.max_power_per_m2,
      avgPowerPerM2: data.avg_power_per_m2,

      cabinetWidth: data.cabinet_width,
      cabinetHeight: data.cabinet_height,

      cabinetResolutionW: data.cabinet_resolution_w,
      cabinetResolutionH: data.cabinet_resolution_h,

      modulesPerCabinet: data.modules_per_cabinet,
    };
  },

  async create(product: Product) {
    const { error } = await supabase
      .from("products")
      .insert({
        series_code: product.seriesCode,
        model: product.model,
        application_type: product.applicationType,

        pitch: product.pitch,
        brightness: product.brightness,

        max_power_per_m2: product.maxPowerPerM2,
        avg_power_per_m2: product.avgPowerPerM2,

        cabinet_width: product.cabinetWidth,
        cabinet_height: product.cabinetHeight,

        cabinet_resolution_w: product.cabinetResolutionW,
        cabinet_resolution_h: product.cabinetResolutionH,

        modules_per_cabinet: product.modulesPerCabinet,
      });

    if (error) throw error;
  },

  async update(product: Product) {
    const { error } = await supabase
      .from("products")
      .update({
        series_code: product.seriesCode,
        model: product.model,
        application_type: product.applicationType,

        pitch: product.pitch,
        brightness: product.brightness,

        max_power_per_m2: product.maxPowerPerM2,
        avg_power_per_m2: product.avgPowerPerM2,

        cabinet_width: product.cabinetWidth,
        cabinet_height: product.cabinetHeight,

        cabinet_resolution_w: product.cabinetResolutionW,
        cabinet_resolution_h: product.cabinetResolutionH,

        modules_per_cabinet: product.modulesPerCabinet,
      })
      .eq("id", product.id);

    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};