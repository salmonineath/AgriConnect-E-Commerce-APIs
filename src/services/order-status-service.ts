import { Types } from "mongoose";
import { orderModel, ORDER_STATUSES, OrderStatus, OrderDocument } from "@/models/order-model";
import { notFoundError, badRequestError, forbiddenError } from "@/utils/helper/error-helper";
import { restoreStock } from "@/services/checkout-service";
import { chargeCard, refundCharge } from "@/services/payment-service";

// Which status can follow which. delivered and cancelled are final.
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
};

const findOrder = async (orderId: string) => {
    if (!Types.ObjectId.isValid(orderId)) {
        throw badRequestError("Invalid order id");
    }
    const order = await orderModel.findById(orderId);
    if (!order) {
        throw notFoundError("Order not found");
    }
    return order;
};

const parseStatus = (status: string) => {
    if (!ORDER_STATUSES.includes(status as OrderStatus)) {
        throw badRequestError(`Invalid order status. Use one of: ${ORDER_STATUSES.join(", ")}`);
    }
    return status as OrderStatus;
};

// Payment side of a status change: paid-before-confirm, refund on cancel, COD paid on delivery
const applyPaymentRules = async (payment: NonNullable<OrderDocument["payment"]>, next: OrderStatus) => {
    if (next === "confirmed" && payment.method === "card" && payment.status !== "paid") {
        throw badRequestError("Card orders must be paid before they can be confirmed");
    }
    if (next === "cancelled" && payment.status === "paid" && payment.transactionId) {
        await refundCharge(payment.transactionId);
        payment.status = "refunded";
    }
    if (next === "delivered" && payment.method === "cash_on_delivery") {
        payment.status = "paid";
        payment.paidAt = new Date();
    }
};

/**
 * Apply a status change with all its side effects:
 * - card orders must be paid before they are confirmed
 * - cancelling returns stock and refunds a paid card order
 * - delivering a cash-on-delivery order marks it paid
 */
const applyStatusChange = async (order: OrderDocument, status: string) => {
    const next = parseStatus(status);
    const current = order.status as OrderStatus;
    if (!ALLOWED_TRANSITIONS[current].includes(next)) {
        throw badRequestError(`Cannot change order from ${current} to ${next}`);
    }

    await applyPaymentRules(order.payment!, next);
    if (next === "cancelled") {
        await restoreStock(order.products.map((p) => ({ productId: p.productId, quantity: p.quantity })));
    }

    order.status = next;
    return order.save();
};

// update order status (admin: any order)
export const updateOrderStatusService = async (orderId: string, status: string) => {
    const order = await findOrder(orderId);
    return applyStatusChange(order, status);
};

// update order status (farmer: only orders where every item is theirs)
export const updateFarmerOrderStatusService = async (orderId: string, farmerId: string, status: string) => {
    const order = await findOrder(orderId);
    const ownsEveryItem = order.products.every((p) => p.farmerId?.toString() === farmerId);
    if (!ownsEveryItem) {
        throw forbiddenError("This order has items from other farmers. Ask an admin to update it.");
    }
    return applyStatusChange(order, status);
};

// cancel own order: customers may only cancel while still pending
export const cancelMyOrderService = async (orderId: string, userId: string) => {
    const order = await findOrder(orderId);
    if (order.userId.toString() !== userId) {
        throw notFoundError("Order not found");
    }
    if (order.status !== "pending") {
        throw badRequestError("Only pending orders can be cancelled");
    }
    return applyStatusChange(order, "cancelled");
};

// pay for own card order (simulated provider)
export const payOrderService = async (orderId: string, userId: string, paymentToken: unknown) => {
    const order = await findOrder(orderId);
    if (order.userId.toString() !== userId) {
        throw notFoundError("Order not found");
    }

    const payment = order.payment!;
    if (payment.method !== "card") {
        throw badRequestError("This order is cash on delivery; pay when it arrives.");
    }
    if (payment.status !== "unpaid") {
        throw badRequestError(`This order is already ${payment.status}.`);
    }
    if (order.status !== "pending") {
        throw badRequestError(`Cannot pay for a ${order.status} order.`);
    }

    const charge = await chargeCard(order.total, paymentToken);
    payment.status = "paid";
    payment.transactionId = charge.transactionId;
    payment.paidAt = new Date();
    return order.save();
};

// get order by user
export const getOrdersByUserService = async (userId: string) => {
    return await orderModel.find({ userId }).sort({ createdAt: -1}).lean()
};

// get orders containing this farmer's products; only their own items are returned
export const getFarmerOrdersService = async (farmerId: string) => {
    const orders = await orderModel
        .find({ "products.farmerId": farmerId })
        .sort({ createdAt: -1 })
        .lean();

    return orders.map((order) => {
        const items = order.products.filter((p) => p.farmerId?.toString() === farmerId);
        return {
            _id: order._id,
            status: order.status,
            payment: { method: order.payment?.method, status: order.payment?.status },
            shippingAddress: order.shippingAddress,
            createdAt: order.createdAt,
            items,
            farmerSubtotal: items.reduce((sum, p) => sum + p.priceAtPurchase * p.quantity, 0),
            hasItemsFromOtherFarmers: items.length !== order.products.length,
        };
    });
};

// get all order
export const getAllOrdersService = async () => {
    return await orderModel.find().sort({ createdAt: -1}).lean()
};
