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
exports.getMeService = exports.deleteUserByIdService = exports.updateUserByIdService = exports.getUsersByIdService = exports.getAllUsersService = exports.createUserService = void 0;
const user_model_1 = require("@/models/user-model");
const error_helper_1 = require("@/utils/helper/error-helper");
const response_util_1 = require("@/utils/response-util");
const user_roleModel_1 = require("@/models/user-roleModel");
const role_model_1 = require("@/models/role-model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const createUserService = (dataPayload) => __awaiter(void 0, void 0, void 0, function* () {
    const { full_name, user_name, email, phone, password } = dataPayload;
    const existing = yield user_model_1.UserModel.findOne({
        $or: [{ user_name }, { email }]
    });
    if (existing) {
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
    const defaultRole = yield role_model_1.rolesModel.findOne({ name: "FARMER" });
    if (!defaultRole)
        throw new Error("Default role not found.");
    yield user_roleModel_1.UserRoleModel.create({
        user_id: newUser._id,
        role_id: defaultRole._id,
    });
    const farmerObj = newUser.toObject();
    return farmerObj;
});
exports.createUserService = createUserService;
const getAllUsersService = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.UserModel.aggregate([
        {
            $lookup: {
                from: "user_roles",
                localField: "_id",
                foreignField: "user_id",
                as: "userRoles"
            }
        },
        {
            $lookup: {
                from: "roles",
                localField: "userRoles.role_id",
                foreignField: "_id",
                as: "roles"
            }
        },
        {
            $addFields: {
                roles: {
                    $map: {
                        input: "$roles",
                        as: "r",
                        in: "$$r.name"
                    }
                }
            }
        },
        {
            $project: {
                password: 0,
                refreshToken: 0,
                __v: 0,
                userRoles: 0,
            }
        }
    ]);
    if (!users || users.length === 0) {
        throw (0, error_helper_1.notFoundError)("User not found.");
    }
    return users;
});
exports.getAllUsersService = getAllUsersService;
const getUsersByIdService = (req, _res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield user_model_1.UserModel.findById(id);
    if (!user) {
        throw (0, error_helper_1.notFoundError)("User not found.");
    }
    return user;
});
exports.getUsersByIdService = getUsersByIdService;
const updateUserByIdService = (req, _res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const updatedData = req.body;
    const users = yield user_model_1.UserModel.findByIdAndUpdate(id, updatedData, {
        new: true,
        runValidators: true,
    });
    if (!users) {
        throw (0, error_helper_1.notFoundError)("User not found");
    }
    ;
    return users;
});
exports.updateUserByIdService = updateUserByIdService;
const deleteUserByIdService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const deleteUser = yield user_model_1.UserModel.findByIdAndDelete(id);
    if (!deleteUser) {
        throw (0, error_helper_1.notFoundError)("User not found..");
    }
    return (0, response_util_1.handleSuccess)(res, 200, "Delete user successfully.");
});
exports.deleteUserByIdService = deleteUserByIdService;
const getMeService = (req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.user || !req.user._id) {
        throw (0, error_helper_1.unauthorizedError)("Token not found.");
    }
    const userProfile = yield user_model_1.UserModel.findById(req.user._id).select("-password");
    if (!userProfile) {
        throw (0, error_helper_1.notFoundError)("User not found.");
    }
    return userProfile;
});
exports.getMeService = getMeService;
