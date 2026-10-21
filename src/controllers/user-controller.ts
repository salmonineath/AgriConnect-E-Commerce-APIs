import { Request, Response } from "express";
import {
  getAllUsersService,
  getUsersByIdService,
  updateUserByIdService,
  deleteUserByIdService,
  createUserService,
  getMeService,
} from "@/services/user-service";
import { handleControllerError } from "@/utils/helper/controller-error-handler";
import { handleError, handleSuccess } from "@/utils/response-util";

// create farmer admin only
export const createUserController = async (req: Request, res: Response) => {
  try {
    const createUser = await createUserService(req.body);

    return handleSuccess(res, 201, "Create user successfully", createUser);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const getAllUsersController = async (_req: Request, res: Response) => {
  try {
    const userData = await getAllUsersService();

    return handleSuccess(res, 200, "Get user successfully.", userData);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const user = await getUsersByIdService(req.params.id);

    return handleSuccess(res, 200, "Get user successfully", user);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const updateUserByIdController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return handleError(res, 401, "Unauthorized");
    }

    const updateUser = await updateUserByIdService(req.params.id, req.body, req.user);

    return handleSuccess(res, 200, "User updated successfully", updateUser);
  } catch (error) {
    handleControllerError(res, error);
  }
};

// delete user (admin only)
export const deleteUserByIdController = async (req: Request, res: Response) => {
  try {
    await deleteUserByIdService(req.params.id);

    return handleSuccess(res, 200, "Delete user successfully.");
  } catch (error) {
    handleControllerError(res, error);
  }
};

// Get me
export const getMeController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return handleError(res, 401, "Unauthorized");
    }

    const userProfile = await getMeService(req.user._id);

    return handleSuccess(res, 200, "Get user profile successfully", userProfile);
  } catch (error) {
    handleControllerError(res, error);
  }
};
