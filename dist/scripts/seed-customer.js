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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const path_1 = __importDefault(require("path"));
const user_model_1 = require("../models/user-model");
const fs_1 = __importDefault(require("fs"));
const projectRoot = process.cwd();
const seedCustomer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log("✅ Database Connected");
        const filePath = path_1.default.join(projectRoot, "src", "data", "customer.json");
        const customerData = JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
        const customersWithHashedPassword = yield Promise.all(customerData.map((customer) => __awaiter(void 0, void 0, void 0, function* () {
            return (Object.assign(Object.assign({}, customer), { password: yield bcrypt_1.default.hash(customer.password, 10) }));
        })));
        yield user_model_1.UserModel.insertMany(customersWithHashedPassword);
        console.log("🌱 Customers seeded successfully");
        process.exit(0);
    }
    catch (err) {
        console.error("❌ Error seeding customers:", err);
        process.exit(1);
    }
});
seedCustomer();
