import { Product } from "../types/Product";

/**
 * Utility object responsible for transforming product data between the backend 
 * database format and the frontend TypeScript interface.
 * * This creates a boundary layer that protects the frontend from database schema 
 * changes and handles the conversion between SQL snake_case and JavaScript camelCase.
 */
export const ProductMapper = {
  /**
   * Converts a raw row retrieved from the Supabase database into a strictly typed Product object.
   *
   * @param {any} row - The raw data object returned from a Supabase query (typically using snake_case keys).
   * @returns {Product} The formatted Product object ready for use in the React frontend.
   */
  fromDatabase(row: any): Product {
    // We map snake_case database columns to camelCase frontend properties here.
    // This ensures our UI components never have to deal with backend naming conventions.
    return {
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
      maxPowerPerM2:
        row.max_power_per_m2,

      avgPowerPerM2:
        row.avg_power_per_m2,
    };
  },

  /**
   * Transforms a frontend Product object back into the schema format required by the Supabase database.
   *
   * @param {Product} product - The strictly typed frontend Product object.
   * @returns {object} A plain object with snake_case keys, ready to be passed into a Supabase insert or update query.
   */
  toDatabase(product: Product) {
    // The 'id' field is intentionally omitted from this mapping.
    // For inserts, the database auto-generates the UUID. 
    // For updates, the ID is typically passed as a match() parameter in the Supabase query, 
    // not in the body of the update payload itself.
    return {
      model: product.model,
      series_code: product.seriesCode,
      application_type: product.applicationType,
      pitch: product.pitch,
      brightness: product.brightness,
      cabinet_width: product.cabinetWidth,
      cabinet_height: product.cabinetHeight,
      cabinet_resolution_w: product.cabinetResolutionW,
      cabinet_resolution_h: product.cabinetResolutionH,
      modules_per_cabinet: product.modulesPerCabinet,
      max_power_per_m2:
        product.maxPowerPerM2,

      avg_power_per_m2:
        product.avgPowerPerM2,
    };
  },
};