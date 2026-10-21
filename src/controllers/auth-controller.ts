import { Request, Response } from "express";
import {
  registerService,
  loginService,
  refreshTokenService,
  logoutService,
} from "@/services/auth-service";
import { handleControllerError } from "@/utils/helper/controller-error-handler";
import { setAuthCookies } from "@/utils/token/cookies";

/**
 * 
 * @param req 
 * @param res 
 */
export const registerController = async (req: Request, res: Response) => {
    try {
        const { user, roles } = await registerService(req.body);
        const tokens = (user as any).tokens;

        if (tokens) {
            setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
        }

        res.status(201).json({
            message: "User registered successfully.",
            user,
            roles
            // ...(tokens ? { accessToken: tokens.accessToken } : {}),
        });
    } catch (err) {
        handleControllerError(res, err);
    }
};

/**
 * 
 * @param req 
 * @param res 
 */
export const loginController = async (req: Request, res: Response) => {
    try {
        const { user, tokens, roles } = await loginService(req.body);

        setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

        res.status(200).json({
            message: "Login successful.",
            accessToken: tokens.accessToken,
            user,
            roles,
        });
    } catch (err) {
      handleControllerError(res, err);
    }
};

/**
 * 
 * @param req 
 * @param res 
 */
export const refreshTokenController = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        const tokens = await refreshTokenService(refreshToken);

        setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

        res.status(200).json({
            message: "Access token refreshed.",
            accessToken: tokens.accessToken,
        });
    } catch (err) {
      handleControllerError(res, err);
    }
};

/**
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export const logoutController = async (req: Request, res: Response) => {
    const result = await logoutService(req, res);
    return result;
};