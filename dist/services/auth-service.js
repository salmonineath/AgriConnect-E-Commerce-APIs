"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeMyAccountService = exports.logoutService = exports.loginService = exports.registerService = exports.refreshTokenService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("@/models/user-model");
const jwt_1 = require("@/utils/token/jwt");
const error_helper_1 = require("@/utils/helper/error-helper");
const cookies_1 = require("@/utils/token/cookies");
const user_roleModel_1 = require("@/models/user-roleModel");
const role_model_1 = require("@/models/role-model");
const refreshTokenService = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    if (!refreshToken) {
        throw (0, error_helper_1.notFoundError)("No refresh token found..");
    }
    const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = yield user_model_1.UserModel.findById(decoded._id);
    if (!user || user.refreshToken !== refreshToken) {
        throw (0, error_helper_1.unauthorizedError)("Invalid refresh token.");
    }
    const fetchUserRole = yield user_roleModel_1.UserRoleModel.find({ user_id: user._id }).populate("role_id");
    const roles = fetchUserRole.map((ur) => (ur.role_id).name);
    const tokens = (0, jwt_1.generateTokens)({
        _id: user._id.toString(),
        email: user.email,
        roles: roles,
    });
    user.refreshToken = tokens.refreshToken;
    yield user.save();
    return tokens;
});
exports.refreshTokenService = refreshTokenService;
const registerService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { full_name, user_name, email, phone, password } = data;
    const existUser = yield user_model_1.UserModel.findOne({
        $or: [{ user_name }, { email }],
    });
    if (existUser) {
        throw (0, error_helper_1.badRequestError)("User with this email or username already exist.");
    }
    const hashed = yield bcrypt_1.default.hash(password, 12);
    const newUser = yield user_model_1.UserModel.create({
        full_name,
        user_name,
        email,
        phone,
        password: hashed,
    });
    const defaultRole = yield role_model_1.rolesModel.findOne({ name: "CUSTOMER" });
    if (!defaultRole)
        throw new Error("Default role not found.");
    yield user_roleModel_1.UserRoleModel.create({
        user_id: newUser._id,
        role_id: defaultRole._id,
    });
    const fetchUserRole = yield user_roleModel_1.UserRoleModel.find({ user_id: newUser._id }).populate("role_id");
    const roles = fetchUserRole.map((ur) => ur.role_id.name);
    const tokens = (0, jwt_1.generateTokens)({
        _id: newUser._id.toString(),
        email: newUser.email,
        roles: roles,
    });
    newUser.refreshToken = tokens.refreshToken;
    yield newUser.save();
    const userObj = newUser.toObject();
    return { user: userObj, roles: roles };
});
exports.registerService = registerService;
const loginService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_name, password } = data;
    const existingUser = yield user_model_1.UserModel.findOne({ user_name });
    if (!existingUser) {
        throw (0, error_helper_1.notFoundError)("USER NOT FOUND.");
    }
    const isMatch = yield bcrypt_1.default.compare(password, existingUser.password);
    if (!isMatch) {
        throw (0, error_helper_1.unauthorizedError)("Invalid username or password.");
    }
    const fetchUserRole = yield user_roleModel_1.UserRoleModel.find({ user_id: existingUser._id }).populate("role_id");
    const roles = fetchUserRole.map((ur) => ur.role_id.name);
    const tokens = (0, jwt_1.generateTokens)({
        _id: existingUser._id.toString(),
        email: existingUser.email,
        roles: roles,
    });
    existingUser.refreshToken = tokens.refreshToken;
    const savedUser = yield existingUser.save();
    const userObj = savedUser.toObject();
    return {
        tokens,
        user: userObj,
        roles: roles
    };
});
exports.loginService = loginService;
const logoutService = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, cookies_1.clearAuthCookies)(res);
    return res.status(200).json({
        message: "User logout successfully.",
    });
});
exports.logoutService = logoutService;
const removeMyAccountService = () => __awaiter(void 0, void 0, void 0, function* () {
});
exports.removeMyAccountService = removeMyAccountService;
