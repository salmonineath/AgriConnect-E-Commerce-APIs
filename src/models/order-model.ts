import mongoose, { Schema } from "mongoose";

export const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

const orderSchema = new Schema(
    {
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: "User", 
            required: true,
        },
        products: [
            {
                productId: { 
                    type: Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: { type: Number, required: true, min: 1 },
                priceAtPurchase: { type: Number, required: true, min: 0 }
            },
        ],
        total: { type: Number, required: true, min: 0 },
        status : {
            type: String,
            enum: ORDER_STATUSES,
            default: "pending",
        },
    },
    { timestamps: true }
);

export const orderModel = mongoose.model("orderModel", orderSchema)
