import { Router } from "express";
import {
    createProductController,
    getAllProductController,
    getProductByIdController,
    updateProductByIdController,
    deleteProductByIdController,
    uploadProductImagesController,
    deleteProductImageController,
} from "@/controllers/product-controller";
import { authenticateToken } from "@/middleware/authenticateToken";
import { authorizeRole } from "@/middleware/authorizeRole";

const ProductRouter = Router();

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Search and list products (public)
 *     tags: [Products]
 *     parameters:
 *       - { in: query, name: search, schema: { type: string }, description: Matches name or description }
 *       - { in: query, name: category, schema: { type: string }, description: Category name or id }
 *       - { in: query, name: minPrice, schema: { type: number } }
 *       - { in: query, name: maxPrice, schema: { type: number } }
 *       - { in: query, name: inStock, schema: { type: boolean } }
 *       - { in: query, name: status, schema: { type: string, enum: [Available, Unavailable] } }
 *       - { in: query, name: farmer, schema: { type: string }, description: Farmer user id }
 *       - { in: query, name: sort, schema: { type: string, enum: [newest, price_asc, price_desc, name], default: newest } }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20, maximum: 100 } }
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

/**
 * @openapi
 * /api/products/{id}/images:
 *   post:
 *     summary: Upload product images (owner farmer or admin). JPEG/PNG/WebP, 2 MB each, max 5 per product
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       201: { description: Images uploaded successfully }
 * /api/products/{id}/images/{imageId}:
 *   delete:
 *     summary: Delete one product image (owner farmer or admin)
 *     tags: [Products]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *       - { in: path, name: imageId, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Image deleted successfully }
 */
ProductRouter.post("/products/:id/images",
    authenticateToken,
    authorizeRole("ADMIN", "FARMER"),
    uploadProductImagesController
);
ProductRouter.delete("/products/:id/images/:imageId",
    authenticateToken,
    authorizeRole("ADMIN", "FARMER"),
    deleteProductImageController
);

export default ProductRouter;
