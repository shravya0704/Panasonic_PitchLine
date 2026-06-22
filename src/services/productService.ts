//EVERYTHING TALKS TO THIS FILE ONLY TO RETRIVE MODELS, NOT MODEL.TS

import { products } from "../data/models";
import { Product } from "../types/Product";

export const getProducts = async (): Promise<Product[]> => {
  return products;
};

export const getProductById = async (
  id: string
): Promise<Product | undefined> => {
  return products.find(
    (product) => product.id === id
  );
};

export const getProductByModel = async (
  model: string
): Promise<Product | undefined> => {
  return products.find(
    (product) => product.model === model
  );
};