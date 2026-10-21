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
exports.getAllCategoriesController = exports.createCategoryController = void 0;
const category_service_1 = require("@/services/category-service");
const response_util_1 = require("@/utils/response-util");
const createCategoryController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, des } = req.body;
        const newCategory = yield (0, category_service_1.createCategoryService)(name, des);
        return res.status(201).json({
            message: "Category created successfully.",
            data: newCategory,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createCategoryController = createCategoryController;
const getAllCategoriesController = (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allCategories = yield (0, category_service_1.getAllCategoriesService)();
        return (0, response_util_1.handleSuccess)(res, 200, "Categories retrieved successfully", allCategories);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllCategoriesController = getAllCategoriesController;
