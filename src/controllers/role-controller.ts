import { Request, Response } from "express";
import { createRoleService, getAllRolesService, getRoleByIdService, deleteRoleByIdService } from "@/services/roles-service";
import { handleControllerError } from "@/utils/helper/controller-error-handler";
import { handleSuccess } from "@/utils/response-util";

/**
 * Create role controller
 */
export const createRoleController = async (req: Request, res: Response) => {
  try {
    const { name, des } = req.body ?? {};

    const result = await createRoleService(name, des);

    return handleSuccess(res, 201, "Create role successfully", result)

  } catch (error) {
    handleControllerError(res, error)
  }
};

/**
 * Get all roles controller
 */
export const getAllRoleController = async (_req: Request, res: Response) => {
  try {
    const roles = await getAllRolesService();

    return handleSuccess(res, 200, "Get roles successfully", roles);

  } catch (error) {
    handleControllerError(res, error);
  }
};

/**
 * Get role by id controller
 */
export const getRoleByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const roleData = await getRoleByIdService(id);

    return handleSuccess(res, 200, "Get role successfully.", roleData);
  } catch (error) {
    handleControllerError(res, error);
  }
};

/**
 * Delete role by id controller
 */
export const deleteRoleByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await deleteRoleByIdService(id);

    return handleSuccess(res, 200, "Role deleted successfully.");
  }  catch (error) {
    handleControllerError(res, error);
  }
};