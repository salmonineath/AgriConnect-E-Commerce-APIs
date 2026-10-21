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
const user_model_1 = require("../models/user-model");
const role_model_1 = require("../models/role-model");
const user_roleModel_1 = require("../models/user-roleModel");
const seedAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log("✅ Database connected");
        const { PASSWORD_ADMIN, FULL_NAME_ADMIN, USER_NAME_ADMIN, EMAIL_ADMIN, PHONE_ADMIN } = process.env;
        const existingAdmin = yield user_model_1.UserModel.findOne({ email: EMAIL_ADMIN });
        if (existingAdmin) {
            console.log("⚠️ Admin already exists. Skipping seed.");
            process.exit(0);
        }
        const hashedPassword = yield bcrypt_1.default.hash(PASSWORD_ADMIN, 10);
        const newAdmin = yield user_model_1.UserModel.create({
            full_name: FULL_NAME_ADMIN,
            user_name: USER_NAME_ADMIN,
            email: EMAIL_ADMIN,
            password: hashedPassword,
            phone: PHONE_ADMIN,
        });
        const adminRole = yield role_model_1.rolesModel.findOne({ name: "ADMIN" });
        if (!adminRole) {
            console.log("❌ ADMIN role not found. Make sure roles are seeded first.");
            process.exit(1);
        }
        yield user_roleModel_1.UserRoleModel.create({
            user_id: newAdmin._id,
            role_id: adminRole._id,
        });
        console.log("🎉 Admin user seeded successfully with ADMIN role!");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
});
seedAdmin();
