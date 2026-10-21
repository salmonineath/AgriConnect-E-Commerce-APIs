import mongoose, { Types, Schema, Document } from "mongoose";
import { IUser } from "@/types/user-type";
// import { UserRole } from "@/types/user-type";

export type UserStatus = "ACTIVE" | "INACTIVE";

export interface IUserModel extends IUser, Document {
  _id: Types.ObjectId;
  status: UserStatus;
  accessToken: string;
  refreshToken: string;
  // roles: Types.ObjectId;
   
}

const userSchema: Schema = new Schema<IUserModel>(
  {
    full_name: { type: String, required: true },
    user_name: { type: String, required: true, unique: true },
    phone: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: true },
    // roles: {
    //   type: [String],
    //   default: ["CUSTOMER"],
    //   required: true
    // },
    // roles: {
    //   type: Schema.Types.ObjectId,
    //   ref: "User_Role",
    //   // required: true
    // },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      required: true
    },
    accessToken: { type: String },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUserModel>("User", userSchema);
