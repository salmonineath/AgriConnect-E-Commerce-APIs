import { Types } from "mongoose";


export type ProductStatus = "Available" | "Unavailable";
export interface IProduct {
    product_name: string;
    product_des: string;
    price: Number;
    // currency: string;
    stock: Number;
    // category: string;
    category: Types.ObjectId;
    status: ProductStatus;
    user_id: Types.ObjectId;
}

export type ProductPayload = {
    _id: string | Types.ObjectId;
    product_name: string;
    product_des: string;
    price: string;
    stock: Number;
    // category: string;
    category: Types.ObjectId;
    status: ProductStatus;
}