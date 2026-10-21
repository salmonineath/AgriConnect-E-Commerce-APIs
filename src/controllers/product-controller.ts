import { Request, Response } from "express";
import {
  createProductService,
  getProductByIdService,
  updateProductByIdService,
  deleteProductByIdService,
  assertCanAddImages,
  addProductImagesService,
  deleteProductImageService,
} from "@/services/product-service";
import { receiveProductImages } from "@/config/upload";
import { listProductsService } from "@/services/product-query-service";
import { handleControllerError } from "@/utils/helper/controller-error-handler";
import { ProductPayload } from "@/types/product-type";
import { handleError, handleSuccess, handlePaginatedSuccess } from "@/utils/response-util";

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

// Get all products, with search / filter / sort / pagination from the query string
export const getAllProductController = async (req: Request, res: Response) => {
  try {
    const result = await listProductsService(req.query);

    return handlePaginatedSuccess(res, "Get products successfully.", result);
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

// upload images (multipart/form-data, field "images")
export const uploadProductImagesController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return handleError(res, 401, "Unauthorized");
    }

    const { id } = req.params;
    await assertCanAddImages(id, req.user);
    const files = await receiveProductImages(req, res);
    const product = await addProductImagesService(id, req.user, files);

    return handleSuccess(res, 201, "Images uploaded successfully.", product);
  } catch (error) {
    handleControllerError(res, error);
  }
};

// delete one image
export const deleteProductImageController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return handleError(res, 401, "Unauthorized");
    }

    const { id, imageId } = req.params;
    const product = await deleteProductImageService(id, imageId, req.user);

    return handleSuccess(res, 200, "Image deleted successfully.", product);
  } catch (error) {
    handleControllerError(res, error);
  }
};
