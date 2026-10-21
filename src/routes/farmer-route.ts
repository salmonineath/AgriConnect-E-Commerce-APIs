import { Router } from "express";
import {
    getMyProductsController,
    getFarmerOrdersController,
    updateFarmerOrderStatusController,
} from "@/controllers/farmer-controller";
import { authenticateToken } from "@/middleware/authenticateToken";
import { authorizeRole } from "@/middleware/authorizeRole";

const FarmerRouter = Router();

FarmerRouter.use("/farmer", authenticateToken, authorizeRole("FARMER"));

/**
 * @openapi
 * /api/farmer/products:
 *   get:
 *     summary: List my products (farmer). Accepts the same filters as GET /api/products
 *     tags: [Farmer]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Get my products successfully }
 * /api/farmer/orders:
 *   get:
 *     summary: List orders that contain my products, showing only my items
 *     tags: [Farmer]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Get orders successfully }
 * /api/farmer/orders/{id}/status:
 *   patch:
 *     summary: Update status of an order whose items are all mine
 *     description: "Allowed: pending → confirmed|cancelled, confirmed → shipped|cancelled, shipped → delivered. Card orders must be paid before confirming."
 *     tags: [Farmer]
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
 *               status: { type: string, enum: [confirmed, shipped, delivered, cancelled] }
 *     responses:
 *       200: { description: Order status updated successfully }
 *       403: { description: Order includes other farmers' items }
 */
FarmerRouter.get("/farmer/products", getMyProductsController);
FarmerRouter.get("/farmer/orders", getFarmerOrdersController);
FarmerRouter.patch("/farmer/orders/:id/status", updateFarmerOrderStatusController);

export default FarmerRouter;
