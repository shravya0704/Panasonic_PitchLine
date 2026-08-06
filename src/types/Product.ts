// src/types/Product.ts

export interface ProductSpecification {
  specification_name: string;
  specification_value: string;
}

// File: src/types/Product.ts

export interface Product {
  id: string;
  model: string;
  seriesCode: string;
  applicationType: string;
  pitch: number;
  brightness: number;
  maxPowerPerM2: number;
  avgPowerPerM2: number;
  cabinetWidth: number;
  cabinetHeight: number;
  cabinetResolutionW: number;
  cabinetResolutionH: number;
  modulesPerCabinet: number;
  product_specifications?: any[];
  seriesType?: string;  // "standard" | "aio"
  led_type?: string;  // "COB" | "SMD" | "GOB"
  aio_display_diagonal?: number;  // Diagonal in inches for AIO products
}
