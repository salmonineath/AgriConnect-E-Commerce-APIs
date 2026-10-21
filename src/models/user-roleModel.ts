import mongoose, { Types, Schema, Document } from "mongoose";
import { IUser_role } from "@/types/role-type";

export interface IUserRoleModel extends IUser_role, Document {
  _id: Types.ObjectId
}

const userRoleSchema = new Schema<IUserRoleModel>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role_id: { type: Schema.Types.ObjectId, ref: "Role", required: true },
  },
  { timestamps: true }
);

export const UserRoleModel = mongoose.model<IUserRoleModel>("User_Role", userRoleSchema);
