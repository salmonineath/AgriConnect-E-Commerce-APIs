// src/types/index.ts
import { Document, Types } from "mongoose";

export interface CartProduct {
  productId: Types.ObjectId | string;
  quantity: number;
}

export interface ICart extends Document {
  userId: Types.ObjectId | string;
  products: CartProduct[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderProduct {
  productId: Types.ObjectId | string;
  quantity: number;
  priceAtPurchase: number;
}

export interface IOrder extends Document {
  userId: Types.ObjectId | string;
  products: IOrderProduct[];
  total: number;
  status: string;
}
