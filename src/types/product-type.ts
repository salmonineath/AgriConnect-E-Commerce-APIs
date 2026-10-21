import { Types } from "mongoose";

export type ProductStatus = "Available" | "Unavailable";
export interface IProduct {
    product_name: string;
    product_des: string;
    price: number;
    stock: number;
    category: Types.ObjectId;
    status: ProductStatus;
    user_id: Types.ObjectId;
}

export type ProductPayload = {
    product_name: string;
    product_des: string;
    price: number;
    stock: number;
    // Category name, e.g. "Vegetables"
    category: string;
    status: ProductStatus;
}
