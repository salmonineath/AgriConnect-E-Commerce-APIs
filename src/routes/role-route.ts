import { Router } from "express";
import {
    createRoleController,
    getAllRoleController,
    getRoleByIdController,
    deleteRoleByIdController,
} from "@/controllers/role-controller";
import { authenticateToken } from "@/middleware/authenticateToken";
import { authorizeRole } from "@/middleware/authorizeRole";

const RoleRouter = Router();

// Every role route is admin only
RoleRouter.use("/roles", authenticateToken, authorizeRole("ADMIN"));

/**
 * @openapi
 * /api/roles:
 *   get:
 *     summary: List roles (admin)
 *     tags: [Roles]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Get roles successfully }
 *   post:
 *     summary: Create a role (admin)
 *     tags: [Roles]
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
 *       201: { description: Create role successfully }
 * /api/roles/{id}:
 *   parameters:
 *     - { in: path, name: id, required: true, schema: { type: string } }
 *   get:
 *     summary: Get one role (admin)
 *     tags: [Roles]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Get role successfully }
 *   delete:
 *     summary: Delete a role (admin)
 *     tags: [Roles]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Role deleted successfully }
 */
RoleRouter.get("/roles", getAllRoleController);
RoleRouter.post("/roles", createRoleController);
RoleRouter.get("/roles/:id", getRoleByIdController);
RoleRouter.delete("/roles/:id", deleteRoleByIdController);

export default RoleRouter;
