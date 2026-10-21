import { Router } from "express";
import {
    checkoutController,
    getMyOrdersController,
    cancelMyOrderController,
    getAllOrdersController,
    updateOrderStatusController,
} from "@/controllers/order-controller";
import { authenticateToken } from "@/middleware/authenticateToken";
import { authorizeRole } from "@/middleware/authorizeRole";

const OrderRouter = Router();

OrderRouter.use("/orders", authenticateToken);

/**
 * @openapi
 * /api/orders/checkout:
 *   post:
 *     summary: Place an order from my cart
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Order placed successfully }
 *       400: { description: Cart is empty or not enough stock }
 * /api/orders/me:
 *   get:
 *     summary: List my orders
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Get orders successfully }
 * /api/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel my pending order (stock is returned)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Order cancelled successfully }
 * /api/orders:
 *   get:
 *     summary: List all orders (admin)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Get orders successfully }
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update an order's status (admin)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [pending, confirmed, shipped, delivered, cancelled] }
 *     responses:
 *       200: { description: Order status updated successfully }
 */
OrderRouter.post("/orders/checkout", checkoutController);
OrderRouter.get("/orders/me", getMyOrdersController);
OrderRouter.patch("/orders/:id/cancel", cancelMyOrderController);
OrderRouter.get("/orders", authorizeRole("ADMIN"), getAllOrdersController);
OrderRouter.patch("/orders/:id/status", authorizeRole("ADMIN"), updateOrderStatusController);

export default OrderRouter;
