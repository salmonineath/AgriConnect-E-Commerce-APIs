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
exports.getAllProductService = exports.createProductService = void 0;
const product_model_1 = require("@/models/product-model");
const error_helper_1 = require("@/utils/helper/error-helper");
const user_roleModel_1 = require("@/models/user-roleModel");
const category_model_1 = require("@/models/category-model");
const createProductService = (dataPayload, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    const { product_name, product_des, price, category, status } = dataPayload;
    if (!(product_name === null || product_name === void 0 ? void 0 : product_name.trim()) || !(product_des === null || product_des === void 0 ? void 0 : product_des.trim()) || !category) {
        throw (0, error_helper_1.badRequestError)("These field are requried.");
    }
    ;
    const queryRole = yield user_roleModel_1.UserRoleModel.find({ user_id: user_id }).populate("role_id");
    const hasPremission = queryRole.some((ur) => ["FARMER", "ADMIN"].includes(ur.role_id.name));
    if (!hasPremission) {
        throw (0, error_helper_1.badRequestError)("Only farmer and admin are able to post product.");
    }
    ;
    const categories = yield category_model_1.categoryModel.findOne({ name: category });
    if (!categories) {
        throw (0, error_helper_1.notFoundError)("Category not found.");
    }
    const newProduct = yield product_model_1.ProductModel.create({
        product_name,
        product_des,
        price,
        category: categories,
        status: status || "",
    });
    return newProduct;
});
exports.createProductService = createProductService;
const getAllProductService = () => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield product_model_1.ProductModel.find().populate("category", "name").lean();
    if (products.length === 0) {
        throw (0, error_helper_1.notFoundError)("No products found.");
    }
    ;
    return products;
});
exports.getAllProductService = getAllProductService;
