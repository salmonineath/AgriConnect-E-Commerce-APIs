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
const user_model_1 = require("../models/user-model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const projectRoot = process.cwd();
const seedFarmer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log("Database Connected");
        const filePath = path_1.default.join(projectRoot, "src", "data", "farmer.json");
        const farmerData = JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
        const farmerHashed = yield Promise.all(farmerData.map((farmer) => __awaiter(void 0, void 0, void 0, function* () {
            return (Object.assign(Object.assign({}, farmer), { password: yield bcrypt_1.default.hash(farmer.password, 10) }));
        })));
        yield user_model_1.UserModel.insertMany(farmerHashed);
        console.log("Farmer seeded successfully");
        process.exit(0);
    }
    catch (err) {
        console.error("Error seeding farmer", err);
        process.exit(1);
    }
});
seedFarmer();
