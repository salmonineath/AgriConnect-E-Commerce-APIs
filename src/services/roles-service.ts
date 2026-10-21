import { badRequestError, notFoundError } from "@/utils/helper/error-helper";
import { rolesModel } from "@/models/role-model";
// import { IRole } from "@/types/role-type";

export const createRoleService = async (name: string, des?: string) => {
  
  if (typeof name !== "string" || !name.trim()) {
    throw badRequestError("Role name is required");
  }

  const existRole = await rolesModel.findOne({ name: name.trim().toUpperCase() });
  if (existRole) {
    throw badRequestError("This role already exists");
  }

  const newRole = await rolesModel.create({
    name: name.trim().toUpperCase(),
    des: des || "",
  });

  return newRole;
};

// get all role
export const getAllRolesService = async () => {
  return rolesModel.find().sort({ name: 1 });
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


