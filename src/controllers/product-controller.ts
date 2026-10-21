import { Request, Response } from "express";
import { createProductService, getAllProductService, getProductByIdService, updateProductByIdService, deleteProductByIdService } from "@/services/product-service";
import { handleControllerError } from "@/utils/helper/controller-error-handler";
import { ProductPayload } from "@/types/product-type";
import { handleError, handleSuccess } from "@/utils/response-util";

/**
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export const createProductController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return handleError(res, 401, "Unauthorized");
    }

    const dataPayload: ProductPayload = req.body;
    const product = await createProductService(dataPayload, req.user._id);

    return handleSuccess(res, 201, "Product created successfully", product);
  } catch (error) {
    handleControllerError(res, error);
  }
};

// Get all product
export const getAllProductController = async (_req: Request, res: Response) => {
  try {
    const AllProducts = await getAllProductService();

    return handleSuccess(res, 200, "Get products successfully.", AllProducts);
  } catch (error) {
    handleControllerError(res, error )
  }
};

export const getProductByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const productData = await getProductByIdService(id);

    return handleSuccess(res, 200, "Get product successfully.", productData);
  } catch (error) {
    handleControllerError(res, error);
  }
};

// update product by Id 
export const updateProductByIdController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return handleError(res, 401, "Unauthorized");
    }

    const { id } = req.params;
    const updatedProduct = await updateProductByIdService(id, req.body, req.user);

    return handleSuccess(res, 200, "Product updated successfully.", updatedProduct);
  } catch (error) {
    handleControllerError(res, error);
  }
};

// delete product by Id
export const deleteProductByIdController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return handleError(res, 401, "Unauthorized");
    }

    const { id } = req.params;
    await deleteProductByIdService(id, req.user);

    return handleSuccess(res, 200, "Product deleted successfully.");
  } catch (error) {
    handleControllerError(res, error);
  }
};
