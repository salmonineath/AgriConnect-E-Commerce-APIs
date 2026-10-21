// import { Types } from "mongoose";
// import { UserRole } from "./user-type";

export type tokenPayload = {
    _id: string;
    email: string;
    // roles: Types.ObjectId;
};

export interface AuthUser {
  _id: string;
  email: string;
  // roles: Types.ObjectId;
}

export interface tokenPaylodExtends extends tokenPayload {
roles: string[]
}