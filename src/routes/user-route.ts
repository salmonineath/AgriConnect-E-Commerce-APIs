import { Router } from "express";
import { authenticateToken } from "@/middleware/authenticateToken";
import { authorizeRole } from "@/middleware/authorizeRole";
import { 
    getAllUsersController, 
    getUserByIdController,
    updateUserByIdController,
    deleteUserByIdController,
    createUserController,
    getMeController
} from "@/controllers/user-controller";

const UserRouter = Router();

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Get users successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
UserRouter.get("/users",
    authenticateToken,
    authorizeRole("ADMIN"),
    getAllUsersController
);

/**
 * @openapi
 * /api/farmers:
 *   post:
 *     summary: Create a farmer account (admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [full_name, user_name, phone, email, password]
 *             properties:
 *               full_name: { type: string }
 *               user_name: { type: string }
 *               phone: { type: string }
 *               email: { type: string }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201: { description: Create user successfully }
 */
UserRouter.post("/farmers", 
    authenticateToken, 
    authorizeRole("ADMIN"), 
    createUserController
);

/**
 * @openapi
 * /api/users/{id}:
 *   parameters:
 *     - { in: path, name: id, required: true, schema: { type: string } }
 *   get:
 *     summary: Get one user (admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Get user successfully }
 *   put:
 *     summary: Update a user (yourself, or anyone if admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name: { type: string }
 *               phone: { type: string }
 *               email: { type: string }
 *               status: { type: string, enum: [ACTIVE, INACTIVE], description: Admin only }
 *     responses:
 *       200: { description: User updated successfully }
 *       403: { description: Not your profile }
 *   delete:
 *     summary: Delete a user (admin)
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Delete user successfully }
 */
UserRouter.get("/users/:id", authenticateToken, authorizeRole("ADMIN"), getUserByIdController);
UserRouter.put("/users/:id", authenticateToken, updateUserByIdController);
UserRouter.delete("/users/:id", authenticateToken, authorizeRole("ADMIN"), deleteUserByIdController);

/**
 * @openapi
 * /api/profile/me:
 *   get:
 *     summary: Get my profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Get user profile successfully }
 */
UserRouter.get("/profile/me", authenticateToken, getMeController);

export default UserRouter;