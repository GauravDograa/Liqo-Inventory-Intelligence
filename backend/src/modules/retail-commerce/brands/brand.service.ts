import { NotFoundError } from "../../../shared/errors/http-errors";
import * as repo from "./brand.repository";

export const createBrand = (organizationId: string, data: { name: string; code?: string }) => {
  return repo.createBrand(organizationId, data);
};

export const listBrands = (organizationId: string) => {
  return repo.findBrands(organizationId);
};

export const getBrand = async (organizationId: string, id: string) => {
  const brand = await repo.findBrandById(organizationId, id);

  if (!brand) {
    throw new NotFoundError("Brand not found");
  }

  return brand;
};
