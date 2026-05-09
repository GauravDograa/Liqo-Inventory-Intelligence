import { NotFoundError } from "../../../shared/errors/http-errors";
import * as repo from "./product.repository";

export type CreateProductInput = {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  hsnCode?: string;
  gstRate?: number;
  baseCost?: number;
  mrp?: number;
  brandId?: string;
  categoryId?: string;
};

export const createProduct = (organizationId: string, data: CreateProductInput) => {
  return repo.createProduct(organizationId, data);
};

export const listProducts = (organizationId: string) => repo.findProducts(organizationId);

export const getProduct = async (organizationId: string, id: string) => {
  const product = await repo.findProductById(organizationId, id);
  if (!product) {
    throw new NotFoundError("Product not found");
  }

  return product;
};
