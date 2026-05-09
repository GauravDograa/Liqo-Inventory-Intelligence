import { NotFoundError } from "../../../shared/errors/http-errors";
import * as repo from "./customer.repository";

export type CreateCustomerInput = {
  customerNumber: string;
  name: string;
  email?: string;
  phone?: string;
  gstin?: string;
  billingAddress?: object;
  shippingAddress?: object;
};

export const createCustomer = (organizationId: string, data: CreateCustomerInput) =>
  repo.createCustomer(organizationId, data);

export const listCustomers = (organizationId: string) => repo.findCustomers(organizationId);

export const getCustomer = async (organizationId: string, id: string) => {
  const customer = await repo.findCustomerById(organizationId, id);
  if (!customer) {
    throw new NotFoundError("Customer not found");
  }

  return customer;
};
