import { ProductSpecificationRepository } from "../repositories/ProductSpecificationRepository";

export const ProductSpecificationService = {
  getProductSpecifications(
    model: string
  ) {
    return ProductSpecificationRepository.getByModel(
      model
    );
  },
};