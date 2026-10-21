import { badRequestError, notFoundError } from "@/utils/helper/error-helper";
import { categoryModel } from "@/models/category-model";

// Escape user input before putting it in a RegExp (prevents regex injection)
const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const assertNameIsFree = async (name: string, ignoreId?: string) => {
  const existingCategory = await categoryModel.findOne({
    name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
    ...(ignoreId ? { _id: { $ne: ignoreId } } : {}),
  });

  if (existingCategory) {
    throw badRequestError("Category with this name already exists.");
  }
};

/**
 * Service to create a new category
 * @param name - Category name
 * @param description - Category description
 * @param userId - Admin who created it
 * @returns Newly created category
 */
export const createCategoryService = async (name: string, description?: string, userId?: string) => {
  if (typeof name !== "string" || !name.trim()) {
    throw badRequestError("Category name is required.");
  }
  await assertNameIsFree(name.trim());

  return categoryModel.create({
    name: name.trim(),
    des: description?.trim(),
    user_id: userId,
  });
};

/**
 * Service to retrieve all categories
 * @returns 
 */
export const getAllCategoriesService = async () => {
  return categoryModel.find().sort({ name: 1 }).lean();
};

/**
 * Service to get a category by its ID
 * @param categoryId - The ID of the category
 * @returns Category object
 */
export const getCategoryByIdService = async (categoryId: string) => {
  const foundCategory = await categoryModel.findById(categoryId).lean();

  if (!foundCategory) {
    throw notFoundError("Category not found.");
  }

  return foundCategory;
};

/**
 * Service to update a category's name and/or description
 */
export const updateCategoryService = async (categoryId: string, name?: string, description?: string) => {
  const category = await categoryModel.findById(categoryId);
  if (!category) {
    throw notFoundError("Category not found.");
  }

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      throw badRequestError("Category name cannot be empty.");
    }
    await assertNameIsFree(name.trim(), categoryId);
    category.name = name.trim();
  }
  if (description !== undefined) {
    category.des = description.trim();
  }

  return category.save();
};

/**
 * Service to delete a category by its ID
 * @param categoryId - The ID of the category to delete
 * @returns Deleted category object
 */
export const deleteCategoryService = async (categoryId: string) => {
  const deletedCategory = await categoryModel.findByIdAndDelete(categoryId);

  if (!deletedCategory) {
    throw notFoundError("Category not found.");
  }

  return deletedCategory;
};
