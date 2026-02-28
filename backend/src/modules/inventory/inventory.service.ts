import * as repository from "./inventory.repository";

export const getInventory = async (organizationId: string) => {
  return repository.findInventoryByOrganization(organizationId);
};