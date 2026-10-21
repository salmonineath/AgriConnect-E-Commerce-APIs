import { Types } from "mongoose";
import { orderModel, ORDER_STATUSES, OrderStatus } from "@/models/order-model";
import { notFoundError, badRequestError } from "@/utils/helper/error-helper";
import { restoreStock } from "@/services/checkout-service";

// update order status service
export const updateOrderStatusService = async (orderId: string, status: string) => {
    if (!ORDER_STATUSES.includes(status as OrderStatus)) {
        throw badRequestError(`Invalid order status. Use one of: ${ORDER_STATUSES.join(", ")}`);
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
        throw notFoundError("Order not found");
    }
    if (order.status === "cancelled" || order.status === "delivered") {
        throw badRequestError(`Order is already ${order.status} and cannot be changed`);
    }

    // Cancelling gives the reserved stock back
    if (status === "cancelled") {
        await restoreStock(order.products.map((p) => ({ productId: p.productId, quantity: p.quantity })));
    }

    order.status = status as OrderStatus;
    return order.save();
};

// cancel own order: customers may only cancel while still pending
export const cancelMyOrderService = async (orderId: string, userId: string) => {
    if (!Types.ObjectId.isValid(orderId)) {
        throw badRequestError("Invalid order id");
    }
    const order = await orderModel.findOne({ _id: orderId, userId });
    if (!order) {
        throw notFoundError("Order not found");
    }
    if (order.status !== "pending") {
        throw badRequestError("Only pending orders can be cancelled");
    }
    return updateOrderStatusService(orderId, "cancelled");
};

// get order by user
export const getOrdersByUserService = async (userId: string) => {
    return await orderModel.find({ userId }).sort({ createdAt: -1}).lean()
};

// get all order
export const getAllOrdersService = async () => {
    return await orderModel.find().sort({ createdAt: -1}).lean()
};
