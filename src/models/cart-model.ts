import mongoose, { Schema } from "mongoose";

const cartSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", unique: true, required: true },
        products: [
            { 
                productId: { type: Schema.Types.ObjectId, ref: "Product", required: true }, 
                quantity: { type: Number, required: true, min: 1 }
            }
        ]
    },
    { timestamps: true }
);

export const cartModel = mongoose.model("CartModel", cartSchema);
