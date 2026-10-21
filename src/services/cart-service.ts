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
    const carts = await cartModel.findOne({ userId}).populate("products.productId").lean();
    return carts;
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
    // if user try to add 0 it will throw 400 error
    if (quantity <= 0) {
        throw badRequestError("Quantity must be at least 1");
    }

    // ensure product exists
    const product = await ProductModel.findById(productId).lean();
    if (!product) throw notFoundError("Product not found");

    const cart = await cartModel.findOne({ userId });
    if (!cart) {
        const created = await cartModel.create({
            userId: new Types.ObjectId(userId),
            products: [{ productId: new Types.ObjectId(productId), quantify: quantity}],
        });
        return created;
    }

    // find product in cart
    const itemIndex = cart.products.findIndex((p: any) => p.productId.toString() === productId);
    if (itemIndex > -1) {
        cart.products[itemIndex].quantity += quantity;
    } else {
        cart.products.push({ productId: new Types.ObjectId(productId), quantity: quantity});
    };

    await cart.save();
    return cart;
};

// remove from cart
export const removeFromCartService = async (userId: string, productId: string) => {
    const cart = await cartModel.findOne({ userId });
    if (!cart) {
        throw notFoundError("Cart not found.")
    };
    
    cart.set("products",cart.products.filter((p: any) => p.productId.toString() !== productId));

    await cart.save();
    return cart;
}