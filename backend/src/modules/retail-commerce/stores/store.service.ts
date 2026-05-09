import { NotFoundError } from "../../../shared/errors/http-errors";
import * as repo from "./store.repository";

export type CreateStoreInput = {
  code: string;
  name: string;
  gstin?: string;
  region?: string;
  city?: string;
  state?: string;
  country?: string;
};

export const createStore = (organizationId: string, data: CreateStoreInput) => {
  return repo.createStore(organizationId, data);
};

export const listStores = (organizationId: string) => repo.findStores(organizationId);

export const getStore = async (organizationId: string, id: string) => {
  const store = await repo.findStoreById(organizationId, id);
  if (!store) {
    throw new NotFoundError("Store not found");
  }

  return store;
};
