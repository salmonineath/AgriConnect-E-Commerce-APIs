import { Request, Response } from "express";
import { createProductService, getAllProductService, getProductByIdService, updateProductByIdService, deleteProductByIdService } from "@/services/product-service";
import { handleControllerError } from "@/utils/helper/controller-error-handler";
import { ProductPayload } from "@/types/product-type";
import { handleSuccess } from "@/utils/response-util";

/**
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export const createProductController = async (req: Request, res: Response) => {
  try {
    // Get user from auth middleware
    const user = (req as any).user;
    if (!user || !user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Get product payload from body
    const dataPayload: ProductPayload = req.body;

    // Call service
    const product = await createProductService(dataPayload, user._id);

    // Return success
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    // Use advanced error handler
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
    const { id } = req.params;
    const dataPayload: ProductPayload = req.body;

    const updatedProduct = await updateProductByIdService(id, dataPayload);

    return handleSuccess(res, 200, "Product updated successfully.", updatedProduct);
  } catch (error) {
    handleControllerError(res, error);
  }
};

// delete product by Id
export const deleteProductByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedProduct = await deleteProductByIdService(id);

    return handleSuccess(res, 200, "Product deleted successfully.");
  } catch (error) {
    handleControllerError(res, error);
  }
};
