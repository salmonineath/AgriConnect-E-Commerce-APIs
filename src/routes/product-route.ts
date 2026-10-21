import { Router } from "express";
import {
    createProductController,
    getAllProductController,
    getProductByIdController,
    updateProductByIdController,
    deleteProductByIdController,
} from "@/controllers/product-controller";
import { authenticateToken } from "@/middleware/authenticateToken";
import { authorizeRole } from "@/middleware/authorizeRole";

const ProductRouter = Router();

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: List all products (public)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Get products successfully
 *   post:
 *     summary: Create a product (farmer or admin)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_name, product_des, price, category]
 *             properties:
 *               product_name: { type: string }
 *               product_des: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               category: { type: string, description: Category name }
 *               status: { type: string, enum: [Available, Unavailable] }
 *     responses:
 *       201:
 *         description: Product created successfully
 */
ProductRouter.get("/products", getAllProductController);
ProductRouter.post("/products", 
    authenticateToken, 
    authorizeRole("ADMIN", "FARMER"), 
    createProductController
);

/**
 * @openapi
 * /api/products/{id}:
 *   parameters:
 *     - { in: path, name: id, required: true, schema: { type: string } }
 *   get:
 *     summary: Get one product (public)
 *     tags: [Products]
 *     responses:
 *       200: { description: Get product successfully }
 *       404: { description: Product not found }
 *   put:
 *     summary: Update a product (owner farmer or admin)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_name: { type: string }
 *               product_des: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               category: { type: string }
 *               status: { type: string, enum: [Available, Unavailable] }
 *     responses:
 *       200: { description: Product updated successfully }
 *       403: { description: Not your product }
 *   delete:
 *     summary: Delete a product (owner farmer or admin)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Product deleted successfully }
 */
ProductRouter.get("/products/:id", getProductByIdController);
ProductRouter.put("/products/:id",
    authenticateToken,
    authorizeRole("ADMIN", "FARMER"),
    updateProductByIdController
);
ProductRouter.delete("/products/:id",
    authenticateToken,
    authorizeRole("ADMIN", "FARMER"),
    deleteProductByIdController
);

export default ProductRouter;
