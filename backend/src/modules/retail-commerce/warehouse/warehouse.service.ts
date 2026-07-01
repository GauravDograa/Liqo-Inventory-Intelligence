import { BadRequestError } from "../../../shared/errors/http-errors";
import * as repo from "./warehouse.repository";

export const listWarehouses = (organizationId: string) => repo.findWarehouses(organizationId);

export const assertWarehouseAndStore = async (
  organizationId: string,
  sourceWarehouseId: string,
  destinationStoreId: string
) => {
  if (sourceWarehouseId === destinationStoreId) {
    throw new BadRequestError("sourceWarehouseId and destinationStoreId must be different");
  }

  const [source, destination] = await Promise.all([
    repo.findLocation(organizationId, sourceWarehouseId),
    repo.findLocation(organizationId, destinationStoreId),
  ]);

  if (!source || source.locationType !== "WAREHOUSE") {
    throw new BadRequestError("sourceWarehouseId must be an active warehouse location");
  }

  if (!destination || destination.locationType !== "STORE") {
    throw new BadRequestError("destinationStoreId must be a store location");
  }

  return { source, destination };
};
