import { supabase } from "../lib/supabase";
import { Product } from "../types/Product";
import { ProductSpecificationRepository } from "./ProductSpecificationRepository";

export const ProductRepository = {
  async getAll(): Promise<Product[]> {
    // Fetch products
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("*, product_specifications(specification_name, specification_value)");

    if (productsError) throw productsError;

    // Fetch series to build a type map
    const { data: seriesData, error: seriesError } = await supabase
      .from("series")
      .select("code, type");

    if (seriesError) throw seriesError;

    // Build map: seriesCode → type
    const seriesTypeMap: Record<string, "standard" | "aio"> = {};

    (seriesData || []).forEach((s: any) => {
      seriesTypeMap[s.code] = s.type === "aio" ? "aio" : "standard";
    });

    // Attach seriesType, led_type, aio_display_diagonal, and screenWeightPerM2 to each product
    return (productsData || []).map((row: any) => ({
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
      product_specifications: row.product_specifications,
      seriesType: seriesTypeMap[row.series_code] ?? "standard",
      led_type: row.led_type,
      aio_display_diagonal: row.aio_display_diagonal,
      screenWeightPerM2: row.screenWeightPerM2 
        ? Number(row.screenWeightPerM2) 
        : undefined,
    }));
  },

  async getById(id: string): Promise<Product | undefined> {
    // Fetch product
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*, product_specifications(specification_name, specification_value)")
      .eq("id", id)
      .single();

    if (productError) throw productError;

    // Fetch series type
    const { data: series, error: seriesError } = await supabase
      .from("series")
      .select("type")
      .eq("code", product.series_code)
      .single();

    if (seriesError) throw seriesError;

    return {
      id: product.id,
      model: product.model,
      seriesCode: product.series_code,
      applicationType: product.application_type,
      pitch: product.pitch,
      brightness: product.brightness,
      maxPowerPerM2: product.max_power_per_m2,
      avgPowerPerM2: product.avg_power_per_m2,
      cabinetWidth: product.cabinet_width,
      cabinetHeight: product.cabinet_height,
      cabinetResolutionW: product.cabinet_resolution_w,
      cabinetResolutionH: product.cabinet_resolution_h,
      modulesPerCabinet: product.modules_per_cabinet,
      product_specifications: product.product_specifications,
      seriesType: series?.type === "aio" ? "aio" : "standard",
      led_type: product.led_type,
      aio_display_diagonal: product.aio_display_diagonal,
      screenWeightPerM2: product.screenWeightPerM2 
        ? Number(product.screenWeightPerM2) 
        : undefined,
    };
  },

  // 💡 ATOMIC CREATE
  async create(product: Omit<Product, "id">) {
    const { data: insertedProduct, error: productError } = await supabase
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
        led_type: product.led_type,
        aio_display_diagonal: (product as any).aio_display_diagonal,
        screenWeightPerM2: product.screenWeightPerM2,
      })
      .select()
      .single();

    if (productError) throw productError;

    if (product.product_specifications && product.product_specifications.length > 0) {
      await ProductSpecificationRepository.createBatch(
        product.model,
        product.product_specifications.map((spec) => ({
          name: spec.specification_name,
          value: spec.specification_value,
        }))
      );
    }
  },

  // 💡 ATOMIC UPDATE
  async update(product: Product) {
    const { error: productError } = await supabase
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
        led_type: product.led_type,
        aio_display_diagonal: (product as any).aio_display_diagonal,
        screenWeightPerM2: product.screenWeightPerM2,
      })
      .eq("id", product.id);

    if (productError) throw productError;

    if (product.product_specifications && product.product_specifications.length > 0) {
      await ProductSpecificationRepository.deleteByModel(product.model);

      await ProductSpecificationRepository.createBatch(
        product.model,
        product.product_specifications.map((spec) => ({
          name: spec.specification_name,
          value: spec.specification_value,
        }))
      );
    }
  },

  async delete(id: string) {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};