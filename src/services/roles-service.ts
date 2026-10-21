import { badRequestError, notFoundError } from "@/utils/helper/error-helper";
import { rolesModel } from "@/models/role-model";
// import { IRole } from "@/types/role-type";

export const createRoleService = async (name: string, des?: string) => {
  
  if (!name?.trim()) {
    throw badRequestError("Role name is required");
  }

  const existRole = await rolesModel.findOne({ name: name.trim() });
  if (existRole) {
    throw badRequestError("This role already exists");
  }

  const newRole = await rolesModel.create({
    name: name.trim(),
    des: des || "",
  });

  return newRole;
};

// get all role
export const getAllRolesService = async () => {
  const getRoles = await rolesModel.find();

  if (!getRoles) {
    throw notFoundError("No roles found");
  }

  return getRoles;
};

// get role by id
export const getRoleByIdService = async (id: string) => {
  const roleIdData = await rolesModel.findById(id);

  if (!roleIdData) {
    throw notFoundError("Role not found");
  }

  return roleIdData;
};

// delete role
export const deleteRoleByIdService = async (id: string) => {
  const deleteRole = await rolesModel.findByIdAndDelete(id);

  if (!deleteRole) {
    throw notFoundError("Role not found");
  }

  return deleteRole;
};

// ======================== Update role by id ================== //

