import { NotFoundError } from "../../shared/errors/http-errors";
import * as repo from "./invoice.repository";

export const listInvoices = (organizationId: string) => {
  return repo.findInvoices(organizationId);
};

export const getInvoice = async (organizationId: string, id: string) => {
  const invoice = await repo.findInvoiceById(organizationId, id);

  if (!invoice) {
    throw new NotFoundError("Invoice not found");
  }

  return invoice;
};
