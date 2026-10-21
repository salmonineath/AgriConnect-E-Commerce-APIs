"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("@/controllers/category-controller");
const CateRouter = (0, express_1.Router)();
CateRouter.post("/categories", category_controller_1.createCategoryController);
CateRouter.get("/categories", category_controller_1.getAllCategoriesController);
exports.default = CateRouter;
