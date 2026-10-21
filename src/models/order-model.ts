import mongoose, { HydratedDocument, InferSchemaType, Schema } from "mongoose";

export const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ["cash_on_delivery", "card"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

const PAYMENT_STATUSES = ["unpaid", "paid", "refunded"] as const;

const shippingAddressSchema = new Schema(
    {
        recipient_name: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        address_line: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        note: { type: String, trim: true },
    },
    { _id: false }
);

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
                // Snapshots taken at checkout, so the order still makes sense if the product changes
                product_name: { type: String },
                farmerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
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
        shippingAddress: { type: shippingAddressSchema, required: true },
        payment: {
            method: { type: String, enum: PAYMENT_METHODS, required: true },
            status: { type: String, enum: PAYMENT_STATUSES, default: "unpaid" },
            transactionId: { type: String },
            paidAt: { type: Date },
        },
    },
    { timestamps: true }
);

export type OrderDocument = HydratedDocument<InferSchemaType<typeof orderSchema>>;

export const orderModel = mongoose.model("orderModel", orderSchema)
