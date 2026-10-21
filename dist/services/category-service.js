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
exports.getAllCategoriesService = exports.createCategoryService = void 0;
const error_helper_1 = require("@/utils/helper/error-helper");
const category_model_1 = require("@/models/category-model");
const createCategoryService = (name, des) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(name === null || name === void 0 ? void 0 : name.trim())) {
        throw (0, error_helper_1.badRequestError)("Category name is required.");
    }
    const existingCategory = yield category_model_1.categoryModel.findOne({
        name: { $regex: `^${name.trim()}$`, $options: "i" }
    });
    if (existingCategory) {
        throw (0, error_helper_1.badRequestError)("Category with this name already exists.");
    }
    ;
    const newCategory = yield category_model_1.categoryModel.create({
        name: name.trim(),
        description: des === null || des === void 0 ? void 0 : des.trim(),
    });
    return newCategory;
});
exports.createCategoryService = createCategoryService;
const getAllCategoriesService = () => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield category_model_1.categoryModel.find().lean();
    if (categories.length === 0) {
        throw (0, error_helper_1.notFoundError)("No categories found.");
    }
    return categories;
});
exports.getAllCategoriesService = getAllCategoriesService;
