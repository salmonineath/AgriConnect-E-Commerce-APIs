import mongoose, { Types, Schema } from "mongoose";

const cartSchema = new Schema(
    {
        userId: {type: Types.ObjectId, unique: true, required: true },
        products: [
            { 
                productId: { type: Types.ObjectId }, 
                quantity: { type: Number, required: true }
            }
        ]
    },
    { timestamps: true }
);

export const cartModel = mongoose.model("CartModel", cartSchema);