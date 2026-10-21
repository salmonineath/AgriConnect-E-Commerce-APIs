import { Router } from "express";
import {
    createCategoryController,
    getAllCategoriesController,
    getCategoryByIdController,
    updateCategoryController,
    deleteCategoryController,
} from "@/controllers/category-controller";
import { authenticateToken } from "@/middleware/authenticateToken";
import { authorizeRole } from "@/middleware/authorizeRole";

const CateRouter = Router();
const adminOnly = [authenticateToken, authorizeRole("ADMIN")];

/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: List all categories (public)
 *     tags: [Categories]
 *     responses:
 *       200: { description: Categories retrieved successfully }
 *   post:
 *     summary: Create a category (admin)
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               des: { type: string }
 *     responses:
 *       201: { description: Category created successfully }
 */
CateRouter.get("/categories", getAllCategoriesController);
CateRouter.post("/categories", ...adminOnly, createCategoryController);

/**
 * @openapi
 * /api/categories/{id}:
 *   parameters:
 *     - { in: path, name: id, required: true, schema: { type: string } }
 *   get:
 *     summary: Get one category (public)
 *     tags: [Categories]
 *     responses:
 *       200: { description: Category retrieved successfully }
 *   put:
 *     summary: Update a category (admin)
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               des: { type: string }
 *     responses:
 *       200: { description: Category updated successfully }
 *   delete:
 *     summary: Delete a category (admin)
 *     tags: [Categories]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Category deleted successfully }
 */
CateRouter.get("/categories/:id", getCategoryByIdController);
CateRouter.put("/categories/:id", ...adminOnly, updateCategoryController);
CateRouter.delete("/categories/:id", ...adminOnly, deleteCategoryController);

export default CateRouter;
