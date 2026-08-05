// src/types/Product.ts

export interface ProductSpecification {
  specification_name: string;
  specification_value: string;
}

export interface Product {
  id: string;
  model: string;
  seriesCode: string;
  applicationType: string;
  pitch: number;
  maxPowerPerM2: number;
  avgPowerPerM2: number;
  brightness: number;
  cabinetWidth: number;
  cabinetHeight: number;
  cabinetResolutionW: number;
  cabinetResolutionH: number;
  modulesPerCabinet: number;
  led_type?: string | null;
  seriesType?: "standard" | "aio";
  // 💡 NEW: Attach the dynamic specs array
  product_specifications?: ProductSpecification[];
}