import { NotFoundError } from "../../shared/errors/http-errors";
import * as repo from "./payment.repository";

export const listPayments = (organizationId: string) => {
  return repo.findPayments(organizationId);
};

export const getPayment = async (organizationId: string, id: string) => {
  const payment = await repo.findPaymentById(organizationId, id);

  if (!payment) {
    throw new NotFoundError("Payment not found");
  }

  return payment;
};
