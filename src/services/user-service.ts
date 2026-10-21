import { UserModel } from "@/models/user-model";
import { UserRoleModel } from "@/models/user-roleModel";
import { badRequestError, forbiddenError, notFoundError } from "@/utils/helper/error-helper";
import { UserPayload } from "@/types/user-type";
import { tokenPaylodExtends } from "@/types/auth-type";
import { createUserWithRole } from "@/services/auth-service";

// Fields a user may change on their profile. Password, roles and tokens are NOT here.
const UPDATABLE_FIELDS = ["full_name", "phone", "email"] as const;
// Admins may additionally activate/deactivate accounts
const ADMIN_UPDATABLE_FIELDS = [...UPDATABLE_FIELDS, "status"] as const;

/**
 * Create farmer (admin only)
 */
export const createUserService = async (dataPayload: UserPayload) => {
  const newUser = await createUserWithRole(dataPayload, "FARMER");
  return newUser.toObject();
};

/**
 * Get all users service
 */
export const getAllUsersService = async () => {
  return UserModel.aggregate([
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
};

/**
 * Get user by ID service
 */
export const getUsersByIdService = async (id: string) => {
  const user = await UserModel.findById(id);

  if (!user) {
    throw notFoundError("User not found.");
  }

  return user;
};

/**
 * Update user by ID. Users may update themselves; admins may update anyone.
 */
export const updateUserByIdService = async (
  id: string,
  body: Record<string, unknown>,
  currentUser: tokenPaylodExtends,
) => {
  const isAdmin = currentUser.roles.includes("ADMIN");
  if (!isAdmin && currentUser._id !== id) {
    throw forbiddenError("You can only update your own profile.");
  }

  const allowed: readonly string[] = isAdmin ? ADMIN_UPDATABLE_FIELDS : UPDATABLE_FIELDS;
  const updatedData = Object.fromEntries(
    Object.entries(body ?? {}).filter(([key]) => allowed.includes(key)),
  );
  if (Object.keys(updatedData).length === 0) {
    throw badRequestError(`Nothing to update. Allowed fields: ${allowed.join(", ")}`);
  }

  const user = await UserModel.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw notFoundError("User not found");
  }

  return user;
};

/**
 * Delete user by Id
 */
export const deleteUserByIdService = async (id: string) => {
  const deleteUser = await UserModel.findByIdAndDelete(id);

  if (!deleteUser) {
    throw notFoundError("User not found.");
  }

  await UserRoleModel.deleteMany({ user_id: deleteUser._id });
  return deleteUser;
};

/**
 * Get me service
 */
export const getMeService = async (userId: string) => {
  const userProfile = await UserModel.findById(userId);
  if (!userProfile) {
    throw notFoundError("User not found.");
  }

  return userProfile;
};
