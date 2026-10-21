"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = __importDefault(require("./auth-route"));
const user_route_1 = __importDefault(require("./user-route"));
const role_route_1 = __importDefault(require("./role-route"));
const category_route_1 = __importDefault(require("./category-route"));
const product_route_1 = __importDefault(require("./product-route"));
const router = (0, express_1.Router)();
router.use("/auth", auth_route_1.default);
router.use("/", user_route_1.default);
router.use("/", role_route_1.default);
router.use("/", category_route_1.default);
router.use("/", product_route_1.default);
exports.default = router;
