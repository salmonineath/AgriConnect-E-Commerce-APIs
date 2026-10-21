// src/routes/auth-route.ts
import { Router } from "express";
import {
  registerController,
  loginController,
  refreshTokenController,
  logoutController,
} from "@/controllers/auth-controller";

const AuthRouter = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               user_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
AuthRouter.post("/register", registerController);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login an existing user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
AuthRouter.post("/login", loginController);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token cookie
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Access token refreshed
 */
AuthRouter.post("/refresh", refreshTokenController);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout user and clear tokens
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
AuthRouter.post("/logout", logoutController);

export default AuthRouter;
