import { Request, Response, NextFunction } from "express";
import { handleError } from "@/utils/response-util";
import { UserRoleModel } from "@/models/user-roleModel";
import { IRoleModel } from "@/models/role-model"; 

export const authorizeRole = (...allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return handleError(res, 401, "Unauthorized.");
      }

      const userId = req.user._id;

      const joined = await UserRoleModel.find({ user_id: userId }).populate<{ role_id: IRoleModel }>("role_id");
  
      if (!joined.length) {
        return handleError(res, 403, "No roles assigned. Access denied.");
      }

      // Extract names safely
      const userRoles = joined
        .map((j) => j.role_id.name)
        .filter((name): name is string => Boolean(name));

      const hasAccess = userRoles.some((roles) =>
        allowedRoles.includes(roles)
      );

      if (!hasAccess) {
        return handleError(res, 403, "Forbidden. Not enough permissions.");
      }

      next();
    } catch (error) {
      console.error(error);
      return handleError(res, 500, "Unexpected error");
    }
  };
};
