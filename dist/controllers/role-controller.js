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
exports.createRoleController = void 0;
const roles_service_1 = require("@/services/roles-service");
const controller_error_handler_1 = require("@/utils/helper/controller-error-handler");
const response_util_1 = require("@/utils/response-util");
const createRoleController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, des } = req.body;
        const result = yield (0, roles_service_1.createRoleService)(name, des);
        return (0, response_util_1.handleSuccess)(res, 201, "Create role successfully", result);
    }
    catch (error) {
        (0, controller_error_handler_1.handleControllerError)(res, error);
    }
});
exports.createRoleController = createRoleController;
