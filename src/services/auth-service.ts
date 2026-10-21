import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { UserModel } from "@/models/user-model";
import { generateTokens } from "@/utils/token/jwt";
import { UserPayload } from "@/types/user-type";
import { 
    badRequestError, 
    unauthorizedError
} from "@/utils/helper/error-helper";
import { clearAuthCookies } from "@/utils/token/cookies";
import { UserRoleModel } from "@/models/user-roleModel";
import { rolesModel, IRoleModel } from "@/models/role-model";

type JwtDecoded = { _id: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

/**
 * Validate the register payload. Throws 400 with a clear message.
 */
const validateUserPayload = (data: Partial<UserPayload>) => {
    const { full_name, user_name, email, phone, password } = data ?? {};
    const fields = { full_name, user_name, email, phone, password };
    const missing = Object.entries(fields)
        .filter(([, value]) => typeof value !== "string" || !value.trim())
        .map(([key]) => key);

    if (missing.length) {
        throw badRequestError(`Missing required fields: ${missing.join(", ")}`);
    }
    if (!EMAIL_PATTERN.test(email as string)) {
        throw badRequestError("Email is not valid.");
    }
    if ((password as string).length < MIN_PASSWORD_LENGTH) {
        throw badRequestError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }
};

/**
 * Get the role names of a user, e.g. ["CUSTOMER"]
 */
const getUserRoleNames = async (userId: Types.ObjectId | string) => {
    const userRoles = await UserRoleModel.find({ user_id: userId }).populate<{ role_id: IRoleModel }>("role_id");
    return userRoles.map((ur) => ur.role_id?.name).filter((name): name is string => Boolean(name));
};

/**
 * Create a user with a hashed password and one role.
 */
export const createUserWithRole = async (data: UserPayload, roleName: string) => {
    validateUserPayload(data);
    const { full_name, user_name, email, phone, password } = data;

    const existUser = await UserModel.findOne({
        $or: [{ user_name }, { email: email.toLowerCase() }],
    });
    if (existUser) {
        throw badRequestError("User with this email or username already exist.");
    }

    const role = await rolesModel.findOne({ name: roleName });
    if (!role) throw new Error(`Role ${roleName} not found. Run "npm run seed:roles" first.`);

    const hashed = await bcrypt.hash(password, 12);
    const newUser = await UserModel.create({
        full_name,
        user_name,
        email,
        phone,
        password: hashed,
    });

    await UserRoleModel.create({ user_id: newUser._id, role_id: role._id });
    return newUser;
};

/**
 * Issue new tokens for a user and store the refresh token (rotation).
 */
const issueTokens = async (user: InstanceType<typeof UserModel>) => {
    const roles = await getUserRoleNames(user._id);
    const tokens = generateTokens({
        _id: user._id.toString(),
        email: user.email,
        roles,
    });

    user.refreshToken = tokens.refreshToken;
    await user.save();
    return { tokens, roles };
};

/**
 * Refresh tokens: verify incoming refresh token, ensure it matches DB,
 * generate new tokens and rotate the stored refresh token.
 */
export const refreshTokenService = async (refreshToken: string) => {

    if (!refreshToken) {
        throw unauthorizedError("No refresh token found.");
    }

    let decoded: JwtDecoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as JwtDecoded;
    } catch {
        throw unauthorizedError("Invalid refresh token.");
    }

    const user = await UserModel.findById(decoded._id);
    if (!user || user.refreshToken !== refreshToken) {
        throw unauthorizedError("Invalid refresh token.");
    }

    const { tokens } = await issueTokens(user);
    return tokens;
}


/**
 * Register a new customer, hash password, store refresh token, return user (without sensitive fields) and tokens
 */
export const registerService = async (data: UserPayload) => {
    const newUser = await createUserWithRole(data, "CUSTOMER");
    const { tokens, roles } = await issueTokens(newUser);

    return { user: newUser.toObject(), roles, tokens };
};


/**
 * Login user: validate credentials, rotate refresh token, return user + tokens
 */
export const loginService = async (data: UserPayload) => {

    const { user_name, password } = data ?? {};
    if (!user_name || !password) {
        throw badRequestError("user_name and password are required.");
    }
    
    // Same message for unknown user and wrong password, so attackers can't discover usernames
    const existingUser = await UserModel.findOne({ user_name });
    const isMatch = existingUser ? await bcrypt.compare(password, existingUser.password) : false;
    if (!existingUser || !isMatch) {
        throw unauthorizedError("Invalid username or password.");
    }
    if (existingUser.status !== "ACTIVE") {
        throw unauthorizedError("This account is inactive.");
    }

    const { tokens, roles } = await issueTokens(existingUser);

    return {
        tokens,
        user: existingUser.toObject(),
        roles
    };
};


/**
 * Logout: invalidate the stored refresh token and clear both cookies
 */
export const logoutService = async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
        await UserModel.updateOne({ refreshToken }, { $unset: { refreshToken: 1 } });
    }

    // Clear cookies
    clearAuthCookies(res);

    return res.status(200).json({
      success: true,
      message: "User logout successfully.",
    });
};
