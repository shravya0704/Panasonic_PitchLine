import { PRODUCT_SPECS } from "../data/productSpecifications";

export const ProductSpecificationRepository = {
  getByModel(
    model: string
  ) {
    return PRODUCT_SPECS[model];
  },
};