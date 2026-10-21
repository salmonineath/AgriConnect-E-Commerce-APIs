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
exports.createRoleService = void 0;
const error_helper_1 = require("@/utils/helper/error-helper");
const role_model_1 = require("@/models/role-model");
const createRoleService = (name, des) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(name === null || name === void 0 ? void 0 : name.trim())) {
        throw (0, error_helper_1.badRequestError)("Role name is required");
    }
    const existRole = yield role_model_1.rolesModel.findOne({ name: name.trim() });
    if (existRole) {
        throw (0, error_helper_1.badRequestError)("This role already exists");
    }
    const newRole = yield role_model_1.rolesModel.create({
        name: name.trim(),
        des: des || "",
    });
    return newRole;
});
exports.createRoleService = createRoleService;
