"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const role_controller_1 = require("@/controllers/role-controller");
const RoleRouter = (0, express_1.Router)();
RoleRouter.post("/roles", role_controller_1.createRoleController);
exports.default = RoleRouter;
