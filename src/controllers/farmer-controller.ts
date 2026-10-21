import { Request, Response } from "express";
import { handleSuccess, handleError, handlePaginatedSuccess } from "@/utils/response-util";
import { handleControllerError } from "@/utils/helper/controller-error-handler";
import { listProductsService } from "@/services/product-query-service";
import { getFarmerOrdersService, updateFarmerOrderStatusService } from "@/services/order-status-service";

// my products (same filters as GET /api/products)
export const getMyProductsController = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return handleError(res, 401, "Unauthorized");
        }

        const result = await listProductsService(req.query, req.user._id);

        return handlePaginatedSuccess(res, "Get my products successfully", result);
    } catch (error) {
        handleControllerError(res, error);
    }
};

// orders that contain my products
export const getFarmerOrdersController = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return handleError(res, 401, "Unauthorized");
        }

        const orders = await getFarmerOrdersService(req.user._id);

        return handleSuccess(res, 200, "Get orders successfully", orders);
    } catch (error) {
        handleControllerError(res, error);
    }
};

// update status of an order made only of my products
export const updateFarmerOrderStatusController = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return handleError(res, 401, "Unauthorized");
        }

        const order = await updateFarmerOrderStatusService(req.params.id, req.user._id, req.body?.status);

        return handleSuccess(res, 200, "Order status updated successfully", order);
    } catch (error) {
        handleControllerError(res, error);
    }
};
