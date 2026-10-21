import { orderModel } from "@/models/order-model";
import { notFoundError, badRequestError } from "@/utils/helper/error-helper";

// update order status service
export const updateOrderStatusService = async (orderId: string, status: string) => {
    const validStatuses = ["pending", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
        throw badRequestError("Invalid order status");
    };

    const updateOrder = await orderModel.findByIdAndUpdate(
        orderId,
        { status },
        { new: true, runValidators: true }
    );

    if (!updateOrder) {
        throw notFoundError("Order not found");
    };

    return updateOrder;
};

// get order by user
export const getOrdersByUserService = async (userId: string) => {
    return await orderModel.find({ userId }).sort({ createdAt: -1}).lean()
};

// get all order
export const getAllOrdersService = async () => {
    return await orderModel.find().sort({ createdAt: -1}).lean()
};