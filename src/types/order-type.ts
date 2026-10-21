export interface CheckoutResult {
    orderId: string;
    total: number; 
    products: Array<{
        productId: string;
        quantity: number;
        price: number;
    }>;
}