import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { handleError } from "@/utils/response-util";
import {  tokenPaylodExtends } from "@/types/auth-type";

declare global {
    namespace Express {
        interface Request {
            user?:  tokenPaylodExtends;
        }
    }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return handleError(res, 401, "Unauthorized");
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      return handleError(res, 401, "Unauthorized");
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (!decoded?._id || !decoded?.email || !decoded?.roles) {
      return handleError(res, 400, "Invalid token");
    }

    req.user = {
      _id: decoded._id,
      email: decoded.email,
      roles: (decoded as any).roles || [] 
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return handleError(res, 401, "Access token expired.");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return handleError(res, 401, "Invalid token.");
    }
    return handleError(res, 500, "Unexpected error.");
  }
};
