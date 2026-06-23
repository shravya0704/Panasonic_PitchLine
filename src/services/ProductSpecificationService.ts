import { ProductSpecificationRepository }
from "../repositories/ProductSpecificationRepository";

export const ProductSpecificationService = {
  async getProductSpecifications(
    model: string
  ) {
    return ProductSpecificationRepository.getByModel(
      model
    );
  },
};