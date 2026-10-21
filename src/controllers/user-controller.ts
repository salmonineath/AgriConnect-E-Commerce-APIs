<<<<<<< Updated upstream
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
import { handleSuccess } from "@/utils/response-util";

// create user admin only
/**
 *
 * @param req
 * @param res
 * @returns
 */
export const createUserController = async (req: Request, res: Response) => {
  try {
    const createUser = await createUserService(req.body);

    return handleSuccess(res, 201, "Create user successfully", createUser);
  } catch (error) {
    handleControllerError(res, error);
  }
};

/**
 * 
 * @param _req 
 * @param res 
 * @returns 
 */
export const getAllUsersController = async (_req: Request, res: Response) => {
  try {
    const userData = await getAllUsersService();
    // console.log(userData)
    return handleSuccess(res, 200, "Get user successfully.", userData);
  } catch (error) {
    // console.error(error);
    handleControllerError(res, error);
  }
};

/**
 *
 * @param req
 * @param res
 * @returns
 */
export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const user = await getUsersByIdService(req, res);

    return handleSuccess(res, 200, "Get user successfully", user);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const updateUserByIdController = async (req: Request, res: Response) => {
  try {
    const updateUser = await updateUserByIdService(req, res);

    return handleSuccess(res, 200, "User updated successfully", updateUser);
  } catch (error) {
    handleControllerError(res, error);
  }
};

// delete user
/**
 *
 * @param req
 * @param res
 * @returns
 */
export const deleteUserByIdController = async (req: Request, res: Response) => {
  const deleteUserResult = await deleteUserByIdService(req, res);
  return deleteUserResult;
};

// Get me
/**
 *
 * @param req
 * @param res
 * @returns
 */
export const getMeController = async (req: Request, res: Response) => {
  try {
    const userProfile = await getMeService(req);

    return handleSuccess(
      res,
      200,
      "Get user profile successfully",
      userProfile,
    );
  } catch (error) {
    handleControllerError(res, error);
  }
};
=======
import { Request, Response } from "express";
import { 
    getAllUsersService, 
    getUsersByIdService, 
    updateUserByIdService, 
    deleteUserByIdService,
    createUserService,
    getMeService
} from "@/services/user-service";
import { handleControllerError } from "@/utils/helper/controller-error-handler";
import { handleSuccess } from "@/utils/response-util";


// create user admin only
/**
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export const createUserController = async (req: Request, res: Response) => {
    try {
        const createUser = await createUserService(req.body);

        return handleSuccess(res, 201, "Create user successfully", createUser)
    } catch (error) {
        handleControllerError(res, error)
    }
}

/**
 * 
 * @param _req 
 * @param res 
 * @returns 
 */
export const getAllUsersController = async (_req: Request, res: Response) => {
    try {
        const userData = await getAllUsersService();
        // console.log(userData)
        return handleSuccess(res, 200, "Get user successfully.", userData)
        
    } catch (error) {
        // console.error(error);
        handleControllerError(res, error)
    }
}

/**
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const user = await getUsersByIdService(req, res);

    return handleSuccess(res, 200, "Get user successfully", user)

  } catch (error) {
    handleControllerError(res, error);
  }
};

export const updateUserByIdController = async (req: Request, res: Response) => {
    try {
        const updateUser = await updateUserByIdService(req, res);

        return handleSuccess(res, 200, "User updated successfully", updateUser)
    } catch (error) {
        handleControllerError(res, error)
    }
}

// delete user
/**
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export const deleteUserByIdController = async (req: Request, res: Response) => {
    const deleteUserResult = await deleteUserByIdService(req, res);
    return deleteUserResult;
}

// Get me 
/**
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export const getMeController = async (req: Request, res: Response) => {
    try {
        const userProfile = await getMeService(req);

        return handleSuccess(res, 200, "Get user profile successfully", userProfile);
    } catch (error) {
        handleControllerError(res, error)
    }
}
>>>>>>> Stashed changes
