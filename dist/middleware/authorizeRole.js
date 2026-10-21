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
exports.authorizeRole = void 0;
const response_util_1 = require("@/utils/response-util");
const user_roleModel_1 = require("@/models/user-roleModel");
const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!req.user) {
                return (0, response_util_1.handleError)(res, 401, "Unauthorized.");
            }
            const userId = req.user._id;
            const joined = yield user_roleModel_1.UserRoleModel.find({ user_id: userId }).populate("role_id");
            if (!joined.length) {
                return (0, response_util_1.handleError)(res, 403, "No roles assigned. Access denied.");
            }
            const userRoles = joined
                .map((j) => j.role_id.name)
                .filter((name) => Boolean(name));
            const hasAccess = userRoles.some((role) => allowedRoles.includes(role));
            if (!hasAccess) {
                return (0, response_util_1.handleError)(res, 403, "Forbidden. Not enough permissions.");
            }
            next();
        }
        catch (error) {
            console.error(error);
            return (0, response_util_1.handleError)(res, 500, "Unexpected error");
        }
    });
};
exports.authorizeRole = authorizeRole;
