<<<<<<< Updated upstream
import { Request, Response } from "express";
import { UserModel } from "@/models/user-model";
import {
  badRequestError,
  notFoundError,
  unauthorizedError,
} from "@/utils/helper/error-helper";
// import { IUser } from "@/types/user-type";
import { handleSuccess } from "@/utils/response-util";
import { UserRoleModel } from "@/models/user-roleModel";
import { IRoleModel, rolesModel } from "@/models/role-model";
import bcrypt from "bcrypt";
import { UserPayload } from "@/types/user-type";

/**
 * Create user service
 */
export const createUserService = async (dataPayload: UserPayload) => {
  const { full_name, user_name, email, phone, password } = dataPayload;

  // Check duplicate username/email
  const existing = await UserModel.findOne({
    $or: [{ user_name }, { email }],
  });

  if (existing) {
    throw badRequestError("User with this email or username already exist.");
  }

  // Hash password
  const hashed = await bcrypt.hash(password, 12);

  // Create user
  const newUser = await UserModel.create({
    full_name,
    user_name,
    email,
    phone,
    password: hashed,
  });

  // Assign default role: FARMER
  const defaultRole = await rolesModel.findOne({ name: "FARMER" });
  if (!defaultRole) throw new Error("Default role not found.");

  await UserRoleModel.create({
    user_id: newUser._id,
    role_id: defaultRole._id,
  });

  // Prepare response without password & refreshToken
  const farmerObj = newUser.toObject();
  // delete farmerObj.password;
  // delete farmerObj.refreshToken;
  return farmerObj;
};

/**
 * Get all users service
 */
export const getAllUsersService = async () => {
  const users = await UserModel.aggregate([
    // Join users with user_roles
    {
      $lookup: {
        from: "user_roles",
        localField: "_id",
        foreignField: "user_id",
        as: "userRoles",
      },
    },

    // Join user_roles with roles
    {
      $lookup: {
        from: "roles",
        localField: "userRoles.role_id",
        foreignField: "_id",
        as: "roles",
      },
    },
    // convert role object to an array display only role name
    {
      $addFields: {
        roles: {
          $map: {
            input: "$roles",
            as: "r",
            in: "$$r.name",
          },
        },
      },
    },

    // Remove sensitive fields
    {
      $project: {
        password: 0,
        refreshToken: 0,
        __v: 0,
        userRoles: 0,
      },
    },
  ]);

  if (!users || users.length === 0) {
    throw notFoundError("User not found.");
  }

  return users;
};

/**
 * Get user by ID service
 */
export const getUsersByIdService = async (req: Request, _res: Response) => {
  const { id } = req.params;
  const user = await UserModel.findById(id);

  if (!user) {
    throw notFoundError("User not found.");
  }

  return user;
};

/**
 * Update user by ID
 */
export const updateUserByIdService = async (req: Request, _res: Response) => {
  const { id } = req.params;

  const updatedData = req.body;

  const users = await UserModel.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  });

  if (!users) {
    throw notFoundError("User not found");
  }

  return users;
};

/**
 * Delete user by Id
 */
export const deleteUserByIdService = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleteUser = await UserModel.findByIdAndDelete(id);

  if (!deleteUser) {
    throw notFoundError("User not found..");
  }

  return handleSuccess(res, 200, "Delete user successfully.");
};

/**
 * Get me service
 */
export const getMeService = async (req: Request) => {
  if (!req.user || !req.user._id) {
    throw unauthorizedError("Token not found.");
  }

  const userProfile = await UserModel.findById(req.user._id).select(
    "-password",
  );
  if (!userProfile) {
    throw notFoundError("User not found.");
  }

  return userProfile;
};
=======
import { Request, Response } from "express";
import { UserModel } from "@/models/user-model";
import { badRequestError, notFoundError, unauthorizedError } from "@/utils/helper/error-helper";
// import { IUser } from "@/types/user-type";
import { handleSuccess } from "@/utils/response-util";
import { UserRoleModel } from "@/models/user-roleModel";
import { IRoleModel, rolesModel } from "@/models/role-model";
import bcrypt from "bcrypt";
import { UserPayload } from "@/types/user-type";



/**
 * Create user service
 */
export const createUserService = async (dataPayload: UserPayload) => {
  const { full_name, user_name, email, phone, password } = dataPayload;

  // Check duplicate username/email
  const existing = await UserModel.findOne({
    $or: [{ user_name }, { email }]
  });

  if (existing) {
    throw badRequestError("User with this email or username already exist.");
  }

  // Hash password
  const hashed = await bcrypt.hash(password, 12);

  // Create user
  const newUser = await UserModel.create({
    full_name,
    user_name,
    email,
    phone,
    password: hashed,
  });

  // Assign default role: FARMER
  const defaultRole = await rolesModel.findOne({ name: "FARMER" });
  if (!defaultRole) throw new Error("Default role not found.");

  await UserRoleModel.create({
    user_id: newUser._id,
    role_id: defaultRole._id,
  });
  
  // Prepare response without password & refreshToken
  const farmerObj = newUser.toObject();
  // delete farmerObj.password;
  // delete farmerObj.refreshToken;
  return farmerObj;
};


/**
 * Get all users service
 */
export const getAllUsersService = async () => {
  const users = await UserModel.aggregate([
    // Join users with user_roles
    {
      $lookup: {
        from: "user_roles",
        localField: "_id",
        foreignField: "user_id",
        as: "userRoles"
      }
    },

    // Join user_roles with roles
    {
      $lookup: {
        from: "roles",
        localField: "userRoles.role_id",
        foreignField: "_id",
        as: "roles"
      }
    },
    // convert role object to an array display only role name
    {
      $addFields: {
        roles: {
          $map: {
            input: "$roles",
            as: "r",
            in: "$$r.name"
          }
        }
      }
    },

    // Remove sensitive fields
    {
      $project: {
        password: 0,
        refreshToken: 0,
        __v: 0,
        userRoles: 0,
      }
    }
  ]);

  if (!users || users.length === 0) {
    throw notFoundError("User not found.");
  }

  return users;
};



/**
 * Get user by ID service
 */
export const getUsersByIdService = async (req: Request, _res: Response) => {

    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) {
      throw notFoundError("User not found.");
    }

    return user;

};

/**
 * Update user by ID
 */
export const updateUserByIdService = async (req: Request, _res: Response) => {

  const { id } = req.params;

  const updatedData = req.body;

  const users = await UserModel.findByIdAndUpdate( id, updatedData, {
    new: true,
    runValidators: true,
  });

  if (!users) {
    throw notFoundError("User not found")
  };

  return users;

};

/**
 * Delete user by Id
 */
export const deleteUserByIdService = async (req: Request, res: Response) => {

  const { id } = req.params;
  const deleteUser = await UserModel.findByIdAndDelete( id )

  if (!deleteUser) {
    throw notFoundError("User not found..")
  }

  return handleSuccess(res, 200, "Delete user successfully.")
}


/**
 * Get me service
 */
export const getMeService = async (req: Request) => {

  if (!req.user || !req.user._id) {
    throw unauthorizedError("Token not found.");
  }
  
  const userProfile = await UserModel.findById(req.user._id).select("-password")
  if (!userProfile) {
    throw notFoundError("User not found.");
  }
  
  return userProfile;

};
>>>>>>> Stashed changes
