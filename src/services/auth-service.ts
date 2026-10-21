import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "@/models/user-model";
import { generateTokens } from "@/utils/token/jwt";
import { UserPayload } from "@/types/user-type";
import { 
    badRequestError, 
    notFoundError, 
    unauthorizedError
} from "@/utils/helper/error-helper";
import { clearAuthCookies } from "@/utils/token/cookies";
import { UserRoleModel } from "@/models/user-roleModel";
import { rolesModel, IRoleModel } from "@/models/role-model";

type JwtDecoded = { _id: string };

/**
 * Refresh tokens: verify incoming refresh token, ensure it matches DB,
 * generate new tokens and rotate the stored refresh token.
 */
export const refreshTokenService = async (refreshToken: string) => {

    if (!refreshToken) {
        throw notFoundError("No refresh token found..");
    }

    const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string
    ) as JwtDecoded;

    const user = await UserModel.findById(decoded._id);
    if (!user || user.refreshToken !== refreshToken) {
        throw unauthorizedError("Invalid refresh token.");
    }

    // Fetch user role
    const fetchUserRole = await UserRoleModel.find({ user_id: user._id}).populate<{ role_id: IRoleModel }>("role_id");

    // Extract role name
    const roles = fetchUserRole.map((ur) => (ur.role_id).name);

    // rotate tokens
    const tokens = generateTokens({
        _id: user._id.toString(),
        email: user.email,
        roles: roles,
    });

    user.refreshToken = tokens.refreshToken;

    await user.save();
    return tokens;
}


/**
 * Register a new user, hash password, store refresh token, return user (without sensitive fields) and tokens
 */
export const registerService = async (data: UserPayload) => {

    const { full_name, user_name, email, phone, password } = data;

    const existUser = await UserModel.findOne({
        $or: [{ user_name }, { email }],
    });
    if (existUser) {
        throw badRequestError("User with this email or username already exist.");
    }

    const hashed = await bcrypt.hash(password, 12);

    const newUser = await UserModel.create({
        full_name,
        user_name,
        email,
        phone,
        password: hashed,
    });

    // assign a default role
    const defaultRole = await rolesModel.findOne({ name: "CUSTOMER" });
    if (!defaultRole) throw new Error("Default role not found.");

    // create record in user_roles
    await UserRoleModel.create({
        user_id: newUser._id,
        role_id: defaultRole._id,
    });

    // Fetch user role
    const fetchUserRole = await UserRoleModel.find({ user_id: newUser._id }).populate<{ role_id: IRoleModel }>("role_id");

    // Extract role name
    const roles = fetchUserRole.map((ur) => (ur.role_id as IRoleModel).name);
    // console.log("===ROLE===", roles)

    const tokens = generateTokens({
        _id: newUser._id.toString(),
        email: newUser.email,
        roles: roles,
    });

    newUser.refreshToken = tokens.refreshToken;
    const userObj = newUser.toObject();
    // remove sensitive fields
    // delete userObj.password;
    // delete userObj.refreshToken;

    return { user: userObj, roles: roles };
};


/**
 * Login user: validate credentials, rotate refresh token, return user + tokens
 */
export const loginService = async (data: UserPayload) => {

    const { user_name, password } = data;
    
    const existingUser = await UserModel.findOne({ user_name });
    if (!existingUser) {
        throw notFoundError("USER NOT FOUND.");
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
        throw unauthorizedError("Invalid username or password.");
    }

    // Fetch user role
    const fetchUserRole = await UserRoleModel.find({ user_id: existingUser._id}).populate("role_id")

    // Extract role name
    const roles = fetchUserRole.map((ur) => (ur.role_id as any).name);

    const tokens = generateTokens({
        _id: existingUser._id.toString(),
        email: existingUser.email,
        roles: roles,
    });

    existingUser.refreshToken = tokens.refreshToken;

    const savedUser = await existingUser.save();
    const userObj = savedUser.toObject();
    // delete userObj.password;
    // delete userObj.refreshToken;

    // Role formatter

    return {
        tokens,
        user: userObj,
        roles: roles
    };
};


/**
 * Logout: clear both refreshToken and accessToken from cookie and response a success message
 */
export const logoutService = async (_req: Request, res: Response) => {

    // Clear cookies
    clearAuthCookies(res);

    return res.status(200).json({
      message: "User logout successfully.",
    });
};

/**
 * Remove account: find user in the database and remove the user 
 */
export const removeMyAccountService = async () => {
    // code 
}
