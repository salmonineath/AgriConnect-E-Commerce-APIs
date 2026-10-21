import { Request, Response } from "express"
import { createCategoryService, getAllCategoriesService, getCategoryByIdService, updateCategoryService, deleteCategoryService } from "@/services/category-service"
import { handleSuccess } from "@/utils/response-util"
import { handleControllerError } from "@/utils/helper/controller-error-handler"

/**
 * Controller to create a new category
 * @param req 
 * @param res 
 * @returns 
 */
export const createCategoryController = async (req: Request, res: Response) => {
  try {
    const { name, des } = req.body ?? {};

    const createdCategory = await createCategoryService(name, des, req.user?._id);

    return handleSuccess(res, 201, "Category created successfully", createdCategory);

  } catch (error) {
    handleControllerError(res, error);
  }
}

/**
 * Controller to get all categories
 * @param _req
 * @param res
 * @returns
 */
export const getAllCategoriesController = async (_req: Request, res: Response) => {
  try {
    const categoriesList = await getAllCategoriesService();

    return handleSuccess(res, 200, "Categories retrieved successfully", categoriesList);

  } catch (error) {
    handleControllerError(res, error);
  }
}

/**
 * Controller to get a category by ID
 * @param req 
 * @param res
 * @returns 
 */
export const getCategoryByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const foundCategory = await getCategoryByIdService(id);

    return handleSuccess(res, 200, "Category retrieved successfully", foundCategory);

  } catch (error) {
    handleControllerError(res, error);
  }
}

/**
 * Controller to update a category by ID
 * @param req
 * @param res
 * @returns
 */
export const updateCategoryController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, des } = req.body ?? {};

    const updatedCategory = await updateCategoryService(id, name, des);

    return handleSuccess(res, 200, "Category updated successfully", updatedCategory);

  } catch (error) {
    handleControllerError(res, error);
  }
}

/**
 * Controller to delete a category by ID
 * @param req 
 * @param res
 * @returns
 */
export const deleteCategoryController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedCategory = await deleteCategoryService(id);

    return handleSuccess(res, 200, "Category deleted successfully", deletedCategory);

  } catch (error) {
    handleControllerError(res, error);
  }
}
