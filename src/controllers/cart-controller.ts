import { Request, Response } from "express";
import { handleSuccess, handleError } from "@/utils/response-util";
import { handleControllerError } from "@/utils/helper/controller-error-handler";
import { addToCartService, removeFromCartService, getCartService } from "@/services/cart-service";

// get cart
export const getCartController = async (req: Request, res: Response) => {
    try {
        // Runtime check if user exist if exist it continue to the next step if not it return 401 error
        if (!req.user) {
          return handleError(res, 401, "Unauthorized");
        };

        const userId = req.user._id;
        const carts = await getCartService(userId);

        return handleSuccess(res, 200, "Get cart successfully", carts);
    } catch (error) {
        handleControllerError(res, error)
        // next(error);
    }
};

// add to cart
export const addToCartController = async (req: Request, res: Response) => {
    try {
        // Runtime check if user exist if exist it continue to the next step if not it return 401 error
        if (!req.user) {
          return handleError(res, 401, "Unauthorized");
        };

        const userId = req.user._id;
        const { productId, quantity } = req.body;

        const cart = await addToCartService(userId, productId, quantity || 1);

        return handleSuccess(res, 200, "Add to cart successfully", cart);
    } catch (error) {
        handleControllerError(res, error);
    }
};

// remove from cart
export const removeFromCartController = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return handleError(res, 401, "Unauthorized");
        }

        const userId = req.user._id;
        const { productId } = req.params;
        const cart = await removeFromCartService(userId, productId);

        return handleSuccess(res, 200, "Remove from cart successfully", cart);
    } catch (error) {
        handleControllerError(res, error);
    }
}