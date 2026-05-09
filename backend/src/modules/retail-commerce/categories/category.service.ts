import { NotFoundError } from "../../../shared/errors/http-errors";
import * as repo from "./category.repository";

export const createCategory = (
  organizationId: string,
  data: { name: string; code?: string; parentId?: string }
) => repo.createCategory(organizationId, data);

export const listCategories = (organizationId: string) => repo.findCategories(organizationId);

export const getCategory = async (organizationId: string, id: string) => {
  const category = await repo.findCategoryById(organizationId, id);
  if (!category) {
    throw new NotFoundError("Category not found");
  }

  return category;
};
