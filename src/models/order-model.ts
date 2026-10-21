import mongoose, { Types, Schema } from "mongoose";

const orderSchema = new Schema(
    {
        userId: { 
            type: Types.ObjectId, 
            ref: "User", 
            required: true,
        },
        products: [
            {
                productId: { 
                    type: Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: { type: Number, requried: true },
                priceAtPurchase: { type: Number, requried: true }
            },
        ],
        total: { type: Number, requried: true },
        status : {
            type: String,
            enum: ["pending", "confirmed", "shipping", "devlivered", "canceled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

export const orderModel = mongoose.model("orderModel", orderSchema)