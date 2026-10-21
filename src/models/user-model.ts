import mongoose, { Types, Schema, Document } from "mongoose";
import { IUser } from "@/types/user-type";

export type UserStatus = "ACTIVE" | "INACTIVE";

export interface IUserModel extends IUser, Document {
  _id: Types.ObjectId;
  status: UserStatus;
  refreshToken?: string;
}

// Never send password hashes or tokens to the client
const hideSensitiveFields = (_doc: unknown, ret: Record<string, unknown>) => {
  delete ret.password;
  delete ret.refreshToken;
  delete ret.__v;
  return ret;
};

const userSchema: Schema = new Schema<IUserModel>(
  {
    full_name: { type: String, required: true, trim: true },
    user_name: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      required: true
    },
    refreshToken: { type: String },
  },
  {
    timestamps: true,
    toJSON: { transform: hideSensitiveFields },
    toObject: { transform: hideSensitiveFields },
  }
);

export const UserModel = mongoose.model<IUserModel>("User", userSchema);
