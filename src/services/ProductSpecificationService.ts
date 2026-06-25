import { ProductSpecificationRepository }
from "../repositories/ProductSpecificationRepository";

type ProductSpecificationRow = {
  specification_name: string;
  specification_value: string;
};

export const ProductSpecificationService = {
  async getByModel(model: string) {
    const rows = ((await ProductSpecificationRepository.getByModel(
      model
    )) ?? []) as ProductSpecificationRow[];

    const specs: Record<string, string> = {};

    rows.forEach((row) => {
      specs[row.specification_name] =
        row.specification_value;
    });

    return specs;
  },
};