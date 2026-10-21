import { badRequestError, notFoundError } from "@/utils/helper/error-helper";
import { categoryModel } from "@/models/category-model";

/**
 * Service to create a new category
 * @param name - Category name
 * @param description - Category description
 * @returns Newly created category
 */
export const createCategoryService = async (name: string, description: string) => {
  // Validate name field
  if (!name?.trim()) {
    throw badRequestError("Category name is required.");
  }

  // Check if a category with the same name already exists (case-insensitive)
  const existingCategory = await categoryModel.findOne({
    name: { $regex: `^${name.trim()}$`, $options: "i" }
  });

  if (existingCategory) {
    throw badRequestError("Category with this name already exists.");
  }

  // Create and save the new category
  const createdCategory = await categoryModel.create({
    name: name.trim(),
    description: description?.trim(),
  });

  return createdCategory;
};

/**
 * Service to retrieve all categories
 * @returns 
 */
export const getAllCategoriesService = async () => {
  const categoriesList = await categoryModel.find().lean();

  if (categoriesList.length === 0) {
    throw notFoundError("No categories found.");
  }

  return categoriesList;
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

// --------------------- Placeholder for update service ------------------- //
// export const updateCategoryService = async (categoryId: string, name: string, description: string) => {
//   Implement update logic here
// }
