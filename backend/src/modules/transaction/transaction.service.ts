import * as repo from "./transaction.repository";

export const getTransactions = async (
  organizationId: string,
  storeId?: string
) => {

  if (storeId) {
    return repo.getTransactionsByStore(
      organizationId,
      storeId
    );
  }

  return repo.getAllTransactions(organizationId);
};