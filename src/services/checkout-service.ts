import mongoose, { ClientSession, Types } from "mongoose"; 
import { cartModel } from "@/models/cart-model"; 
import { ProductModel } from "@/models/product-model"; 
import { orderModel } from "@/models/order-model"; 
import { notFoundError, badRequestError } from "@/utils/helper/error-helper"; 
import { CheckoutResult} from "@/types/order-type";
import { IProductModel } from "@/models/product-model";


/**
 * Checkout service
 */
export const checkoutService = async (userId: string): Promise<CheckoutResult> => {
    // Start a session for the transaction
    const session: ClientSession = await mongoose.startSession(); 
    
    try {
        // Begin transaction
        session.startTransaction();

        // Load cart and populate product info
        const cart = await cartModel
            .findOne({ userId }) 
            .populate("products.productId") // Populate the product information
            .session(session); // Use the current session

        // Check if cart is empty
        if (!cart || cart.products.length === 0) {
            throw badRequestError("Cart is empty."); 
        }

        // Validate stock and compute total cost
        let total = 0; 
        const orderProducts = [];
        const bulkOps: any[] = [];

        // Loop through cart products to validate and compute totals
        for (const item of cart.products) {
            const product = item.productId as IProductModel; 
        
            // Check if the product exists
            if (!product) {
                throw notFoundError("Product in cart not found."); 
            }

            // Check if there's enough stock for the product
            // Convert the boxed Number object to a primitive number (using Number(product.stock) or .valueOf()) before comparing.
            if ((Number(product.stock) || 0) < (Number(item.quantity) || 0)) {
                throw badRequestError(`Insufficient stock for product: ${product.product_name}`); 
            }

            // Calculate the total for the item 
            // Cast the operands to number before multiplying to satisfy TypeScript's type check.
            const itemTotal = (Number(product.price) || 0) * (Number(item.quantity) || 0);
            total += itemTotal;

            // Prepare product information for the order
            orderProducts.push({
                productId: product._id,
                quantity: item.quantity, 
                priceAtPurchase: product.price, 
            });

            // Prepare bulk operations to update product stock
            /**
             * bulkOps is an array where you store multiple database update operations for different products.
             * Example: const bulkOps = [];
             * Every time the user has an item in their cart, add an update. 
             * So if the cart has 3 products, bulkOps becomes:
             * [
             *  { updateOne: { ...product1... } },
             *  { updateOne: { ...product2... } },
             *  { updateOne: { ...product3... } }
             * ]
             */
            bulkOps.push({
                updateOne: {
                    filter: { 
                        _id: product._id,
                        stock: { $gte: item.quantity } 
                    },
                    update: { $inc: { stock: -item.quantity } },
                },
            });
        }

        // Update product stock with race condition check
        if (bulkOps.length > 0) {
            const bulkResult = await ProductModel.bulkWrite(bulkOps, { session }); // update every stock all at once
            
            // Validate that all intended stock updates were successful
            if (bulkResult.modifiedCount !== bulkOps.length) {
                throw badRequestError("Stock changed during checkout. Please try again.");
            }
        }

        // Create the order
        const [order] = await orderModel.create(
            [
                {
                    userId: new Types.ObjectId(userId), 
                    products: orderProducts, 
                    total,
                    status: 'pending', 
                },
            ],
            { session }
        );

        // Clear the user's cart after successful order creation
        await cartModel.deleteOne({ userId }, { session });

        // Commit the transaction to apply all changes
        await session.commitTransaction();

        // Return the result of the checkout process
        return {
            orderId: order._id.toString(),
            total: total,
            products: order.products.map(p => ({
                productId: p.productId.toString(), 
                quantity: p.quantity ?? 0, 
                price: p.priceAtPurchase ?? 0, 
            })),
        };

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};