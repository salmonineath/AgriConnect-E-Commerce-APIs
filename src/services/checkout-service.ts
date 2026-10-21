import { Types } from "mongoose";
import { cartModel } from "@/models/cart-model";
import { ProductModel, IProductModel } from "@/models/product-model";
import { orderModel, PAYMENT_METHODS, PaymentMethod } from "@/models/order-model";
import { badRequestError } from "@/utils/helper/error-helper";
import { CheckoutInput, CheckoutResult, ShippingAddress } from "@/types/order-type";

type StockChange = { productId: Types.ObjectId; quantity: number };

// Put stock back for items already reserved (used when checkout fails part-way)
export const restoreStock = async (items: StockChange[]) => {
    await Promise.all(
        items.map((item) =>
            ProductModel.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } }),
        ),
    );
};

const REQUIRED_ADDRESS_FIELDS = ["recipient_name", "phone", "address_line", "city"] as const;

/**
 * Validate the checkout body and return a clean copy (unknown fields dropped).
 */
export const parseCheckoutInput = (body: unknown): CheckoutInput => {
    const { shippingAddress, paymentMethod } = (body ?? {}) as Record<string, unknown>;

    if (!PAYMENT_METHODS.includes(paymentMethod as PaymentMethod)) {
        throw badRequestError(`paymentMethod must be one of: ${PAYMENT_METHODS.join(", ")}`);
    }

    const address = (shippingAddress ?? {}) as Record<string, unknown>;
    const missing = REQUIRED_ADDRESS_FIELDS.filter(
        (field) => typeof address[field] !== "string" || !(address[field] as string).trim(),
    );
    if (missing.length) {
        throw badRequestError(`shippingAddress is missing: ${missing.join(", ")}`);
    }

    const cleanAddress: ShippingAddress = {
        recipient_name: address.recipient_name as string,
        phone: address.phone as string,
        address_line: address.address_line as string,
        city: address.city as string,
        ...(typeof address.note === "string" ? { note: address.note } : {}),
    };
    return { shippingAddress: cleanAddress, paymentMethod: paymentMethod as PaymentMethod };
};

/**
 * Checkout service.
 *
 * Works on a standalone MongoDB (no transactions needed): each product's
 * stock is decremented with an atomic "only if enough stock" update, and if
 * any step fails, the stock already taken is put back.
 */
export const checkoutService = async (userId: string, input: CheckoutInput): Promise<CheckoutResult> => {
    // Load cart and populate product info
    const cart = await cartModel
        .findOne({ userId })
        .populate<{ products: { productId: IProductModel | null; quantity: number }[] }>("products.productId");

    if (!cart || cart.products.length === 0) {
        throw badRequestError("Cart is empty.");
    }

    // Validate every item before touching stock
    let total = 0;
    const orderProducts = cart.products.map((item) => {
        const product = item.productId;
        if (!product) {
            throw badRequestError("A product in your cart no longer exists. Please remove it.");
        }
        if (product.status !== "Available") {
            throw badRequestError(`Product is not available: ${product.product_name}`);
        }
        total += product.price * item.quantity;
        return {
            productId: product._id,
            product_name: product.product_name,
            farmerId: product.user_id,
            quantity: item.quantity,
            priceAtPurchase: product.price,
        };
    });

    // Reserve stock one product at a time; roll back on the first failure
    const reserved: StockChange[] = [];
    try {
        for (const item of orderProducts) {
            const result = await ProductModel.updateOne(
                { _id: item.productId, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
            );
            if (result.modifiedCount !== 1) {
                throw badRequestError("Insufficient stock for one of the products in your cart.");
            }
            reserved.push({ productId: item.productId, quantity: item.quantity });
        }

        const order = await orderModel.create({
            userId: new Types.ObjectId(userId),
            products: orderProducts,
            total,
            status: "pending",
            shippingAddress: input.shippingAddress,
            payment: { method: input.paymentMethod, status: "unpaid" },
        });

        // Clear the user's cart after successful order creation
        await cartModel.deleteOne({ userId });

        return {
            orderId: order._id.toString(),
            total,
            status: order.status,
            payment: { method: input.paymentMethod, status: "unpaid" },
            shippingAddress: input.shippingAddress,
            products: orderProducts.map((p) => ({
                productId: p.productId.toString(),
                product_name: p.product_name,
                quantity: p.quantity,
                price: p.priceAtPurchase,
            })),
        };
    } catch (error) {
        await restoreStock(reserved);
        throw error;
    }
};
