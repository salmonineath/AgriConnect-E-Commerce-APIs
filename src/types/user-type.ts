// export type UserRole = "ADMIN" | "FARMER" | "CUSTOMER";
import { Types } from "mongoose";

export interface IUser {
    _id: Types.ObjectId,
    full_name: string,
    user_name: string,
    phone: string,
    email: string,
    password: string,
    // roles: UserRole[],
}

export interface UserPayload {
    full_name: string,
    user_name: string,
    phone: string,
    email: string,
    password: string,
}