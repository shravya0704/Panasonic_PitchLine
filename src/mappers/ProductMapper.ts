import { Product } from "../types/Product";

export const ProductMapper = {
  fromDatabase(row: any): Product {
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

  toDatabase(product: Product) {
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