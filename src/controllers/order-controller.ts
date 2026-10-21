import { Request, Response } from "express";
import { handleSuccess, handleError } from "@/utils/response-util";
import { handleControllerError } from "@/utils/helper/controller-error-handler";
import { checkoutService, parseCheckoutInput } from "@/services/checkout-service";
import {
    cancelMyOrderService,
    payOrderService,
    getAllOrdersService,
    getOrdersByUserService,
    updateOrderStatusService,
} from "@/services/order-status-service";

// checkout: turn the current user's cart into an order
export const checkoutController = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return handleError(res, 401, "Unauthorized");
        }

        const input = parseCheckoutInput(req.body);
        const order = await checkoutService(req.user._id, input);

        return handleSuccess(res, 201, "Order placed successfully", order);
    } catch (error) {
        handleControllerError(res, error);
    }
};

// get my orders
export const getMyOrdersController = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return handleError(res, 401, "Unauthorized");
        }

        const orders = await getOrdersByUserService(req.user._id);

        return handleSuccess(res, 200, "Get orders successfully", orders);
    } catch (error) {
        handleControllerError(res, error);
    }
};

// cancel my order
export const cancelMyOrderController = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return handleError(res, 401, "Unauthorized");
        }

        const order = await cancelMyOrderService(req.params.id, req.user._id);

        return handleSuccess(res, 200, "Order cancelled successfully", order);
    } catch (error) {
        handleControllerError(res, error);
    }
};

// pay for my card order (simulated provider)
export const payOrderController = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return handleError(res, 401, "Unauthorized");
        }

        const order = await payOrderService(req.params.id, req.user._id, req.body?.paymentToken);

        return handleSuccess(res, 200, "Payment successful", order);
    } catch (error) {
        handleControllerError(res, error);
    }
};

// get all orders (admin)
export const getAllOrdersController = async (_req: Request, res: Response) => {
    try {
        const orders = await getAllOrdersService();

        return handleSuccess(res, 200, "Get orders successfully", orders);
    } catch (error) {
        handleControllerError(res, error);
    }
};

// update order status (admin)
export const updateOrderStatusController = async (req: Request, res: Response) => {
    try {
        const order = await updateOrderStatusService(req.params.id, req.body?.status);

        return handleSuccess(res, 200, "Order status updated successfully", order);
    } catch (error) {
        handleControllerError(res, error);
    }
};
