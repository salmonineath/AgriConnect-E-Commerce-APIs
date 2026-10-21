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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMeController = exports.deleteUserByIdController = exports.updateUserByIdController = exports.getUserByIdController = exports.getAllUsersController = exports.createUserController = void 0;
const user_service_1 = require("@/services/user-service");
const controller_error_handler_1 = require("@/utils/helper/controller-error-handler");
const response_util_1 = require("@/utils/response-util");
const createUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const createUser = yield (0, user_service_1.createUserService)(req.body);
        return (0, response_util_1.handleSuccess)(res, 201, "Create user successfully", createUser);
    }
    catch (error) {
        (0, controller_error_handler_1.handleControllerError)(res, error);
    }
});
exports.createUserController = createUserController;
const getAllUsersController = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = yield (0, user_service_1.getAllUsersService)();
        return (0, response_util_1.handleSuccess)(res, 200, "Get user successfully.", userData);
    }
    catch (error) {
        (0, controller_error_handler_1.handleControllerError)(res, error);
    }
});
exports.getAllUsersController = getAllUsersController;
const getUserByIdController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield (0, user_service_1.getUsersByIdService)(req, res);
        return (0, response_util_1.handleSuccess)(res, 200, "Get user successfully", user);
    }
    catch (error) {
        (0, controller_error_handler_1.handleControllerError)(res, error);
    }
});
exports.getUserByIdController = getUserByIdController;
const updateUserByIdController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateUser = yield (0, user_service_1.updateUserByIdService)(req, res);
        return (0, response_util_1.handleSuccess)(res, 200, "User updated successfully", updateUser);
    }
    catch (error) {
        (0, controller_error_handler_1.handleControllerError)(res, error);
    }
});
exports.updateUserByIdController = updateUserByIdController;
const deleteUserByIdController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deleteUserResult = yield (0, user_service_1.deleteUserByIdService)(req, res);
    return deleteUserResult;
});
exports.deleteUserByIdController = deleteUserByIdController;
const getMeController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userProfile = yield (0, user_service_1.getMeService)(req);
        return (0, response_util_1.handleSuccess)(res, 200, "Get user profile successfully", userProfile);
    }
    catch (error) {
        (0, controller_error_handler_1.handleControllerError)(res, error);
    }
});
exports.getMeController = getMeController;
