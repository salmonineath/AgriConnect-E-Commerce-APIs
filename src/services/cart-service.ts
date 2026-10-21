import { Types } from "mongoose";
import { cartModel } from "@/models/cart-model";
import { ProductModel } from "@/models/product-model";
import { notFoundError, badRequestError } from "@/utils/helper/error-helper";

/**
 * 
 * Get cart service
 * @param userId 
 * @returns 
 */
export const getCartService = async (userId: string) => {
    const carts = await cartModel.findOne({ userId }).populate("products.productId").lean();
    return carts ?? { userId, products: [] };
}

/**
 * 
 * add to cart service
 * @param userId 
 * @param productId 
 * @param quantity 
 * @returns 
 */
export const addToCartService = async (userId: string, productId: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw badRequestError("Quantity must be a whole number of at least 1");
    }
    if (!Types.ObjectId.isValid(productId)) {
        throw badRequestError("Invalid productId");
    }

    // ensure product exists and can be bought
    const product = await ProductModel.findById(productId).lean();
    if (!product) throw notFoundError("Product not found");
    if (product.status !== "Available") throw badRequestError("Product is not available");

    const cart = await cartModel.findOne({ userId }) ?? new cartModel({ userId, products: [] });

    // find product in cart
    const item = cart.products.find((p) => p.productId.toString() === productId);
    const newQuantity = (item?.quantity ?? 0) + quantity;
    if (newQuantity > product.stock) {
        throw badRequestError(`Only ${product.stock} left in stock`);
    }

    if (item) {
        item.quantity = newQuantity;
    } else {
        cart.products.push({ productId: new Types.ObjectId(productId), quantity });
    }

    await cart.save();
    return cart;
};

// remove from cart
export const removeFromCartService = async (userId: string, productId: string) => {
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
        throw notFoundError("Cart not found.")
    };
    
    cart.set("products", cart.products.filter((p) => p.productId.toString() !== productId));

    await cart.save();
    return cart;
}
