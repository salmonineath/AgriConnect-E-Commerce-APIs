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
exports.getAllProductController = exports.createProductController = void 0;
const product_service_1 = require("@/services/product-service");
const controller_error_handler_1 = require("@/utils/helper/controller-error-handler");
const response_util_1 = require("@/utils/response-util");
const createProductController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user || !user._id) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const dataPayload = req.body;
        const product = yield (0, product_service_1.createProductService)(dataPayload, user._id);
        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product,
        });
    }
    catch (error) {
        (0, controller_error_handler_1.handleControllerError)(res, error);
    }
});
exports.createProductController = createProductController;
const getAllProductController = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const AllProducts = yield (0, product_service_1.getAllProductService)();
        return (0, response_util_1.handleSuccess)(res, 200, "Get products successfully.", AllProducts);
    }
    catch (error) {
        (0, controller_error_handler_1.handleControllerError)(res, error);
    }
});
exports.getAllProductController = getAllProductController;
