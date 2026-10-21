import { PaymentMethod } from "@/models/order-model";

export interface ShippingAddress {
    recipient_name: string;
    phone: string;
    address_line: string;
    city: string;
    note?: string;
}

export interface CheckoutInput {
    shippingAddress: ShippingAddress;
    paymentMethod: PaymentMethod;
}

export interface CheckoutResult {
    orderId: string;
    total: number; 
    status: string;
    payment: { method: PaymentMethod; status: string };
    shippingAddress: ShippingAddress;
    products: Array<{
        productId: string;
        product_name: string;
        quantity: number;
        price: number;
    }>;
}
