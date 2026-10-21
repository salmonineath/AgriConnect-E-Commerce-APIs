import { Request, Response, NextFunction } from "express";
import { handleControllerError } from "@/utils/helper/controller-error-handler";
import { notFoundError } from "@/utils/helper/error-helper";

/**
 * 404 for any route that did not match.
 */
export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
    next(notFoundError("Route not found"));
};

/**
 * Centralized error handler (must be registered LAST).
 * Express 5 forwards rejected async handlers here automatically.
 */
 
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    // Malformed JSON body from express.json()
    if (err instanceof SyntaxError && "body" in err) {
        return res.status(400).json({ success: false, message: "Invalid JSON body" });
    }
    return handleControllerError(res, err);
};
