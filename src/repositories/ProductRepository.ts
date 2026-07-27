import { supabase } from "../lib/supabase";
import { Product, ProductSpecification } from "../types/Product";
import { ProductSpecificationRepository } from "./ProductSpecificationRepository";

export const ProductRepository = {
  async getAll(): Promise<Product[]> {
    // 💡 CHANGED: Added foreign key relationship fetch
    const { data, error } = await supabase
      .from("products")
      .select("*, product_specifications(specification_name, specification_value)");

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
        
        // 💡 NEW: Pass the fetched array through
        product_specifications: row.product_specifications, 
      })) ?? []
    );
  },

  async getById(id: string): Promise<Product | undefined> {
    // 💡 CHANGED: Added foreign key relationship fetch
    const { data, error } = await supabase
      .from("products")
      .select("*, product_specifications(specification_name, specification_value)")
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
      
      // 💡 NEW: Pass the fetched array through
      product_specifications: data.product_specifications,
    };
  },

  // 💡 ATOMIC CREATE: Save both products table AND product_specifications in one go
  async create(product: Product) {
    // Step 1: Insert into products table
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
      })
      .select()
      .single();

    if (productError) throw productError;

    // Step 2: If specs exist, insert them linked by model name
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

  // 💡 ATOMIC UPDATE: Update products table AND sync product_specifications
  async update(product: Product) {
    // Step 1: Update products table
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
      })
      .eq("id", product.id);

    if (productError) throw productError;

    // Step 2: Delete existing specs for this model and re-insert new ones
    if (product.product_specifications && product.product_specifications.length > 0) {
      // Delete old specs for this model
      await ProductSpecificationRepository.deleteByModel(product.model);

      // Insert new specs
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