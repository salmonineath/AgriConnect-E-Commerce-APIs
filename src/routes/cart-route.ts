import { Router } from "express";
import { getCartController, addToCartController, removeFromCartController } from "@/controllers/cart-controller";
import { authenticateToken } from "@/middleware/authenticateToken";
import { authorizeRole } from "@/middleware/authorizeRole";

const cartRouter = Router();

cartRouter.use("/cart", authenticateToken, authorizeRole("CUSTOMER", "FARMER", "ADMIN"));

/**
 * @openapi
 * /api/cart:
 *   get:
 *     summary: Get my cart
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Get cart successfully }
 * /api/cart/add:
 *   post:
 *     summary: Add a product to my cart
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId: { type: string }
 *               quantity: { type: integer, default: 1 }
 *     responses:
 *       200: { description: Add to cart successfully }
 * /api/cart/remove/{productId}:
 *   delete:
 *     summary: Remove a product from my cart
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: productId, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Remove from cart successfully }
 */
cartRouter.get("/cart", getCartController);
cartRouter.post("/cart/add", addToCartController);
cartRouter.delete("/cart/remove/:productId", removeFromCartController);

export default cartRouter;
