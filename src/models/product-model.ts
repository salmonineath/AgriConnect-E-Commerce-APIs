import mongoose, { Types, Schema, Document } from "mongoose";
import { IProduct } from "@/types/product-type";

export interface IProductModel extends IProduct, Document {
    _id: Types.ObjectId;
}

const productSchema = new Schema<IProductModel>(
    {
        product_name: { 
            type: String, 
            required: true,
            trim: true
        },

        product_des: { 
            type: String, 
            required: true,
            trim: true
        },

        price: { 
            type: Number, 
            required: true, 
        },

        stock: { type: Number },

        category: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },

        status: {
            type: String,
            enum: ["Available", "Unavailable"],
            default: "Available",
            required: true,
        },

        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false
        }
    },
    { 
        timestamps: true 
    }
);

export const ProductModel = mongoose.model<IProductModel>("Product", productSchema);
