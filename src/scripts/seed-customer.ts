import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import path from "path";
import { UserModel } from "../models/user-model";
import fs from "fs";

// Use project root instead of import.meta (__dirname alternative)
const projectRoot = process.cwd();

const seedCustomer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("✅ Database Connected");

        // Load local JSON data
        const filePath = path.join(projectRoot, "src", "data", "customer.json");
        const customerData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        // Optional: clear existing users
        // await UserModel.deleteMany({});
        // console.log("🗑️ Old users removed");

        // Hash passwords + insert users
        const customersWithHashedPassword = await Promise.all(
            customerData.map(async (customer: any) => ({
                ...customer,
                password: await bcrypt.hash(customer.password, 10)
            }))
        );

        await UserModel.insertMany(customersWithHashedPassword);
        console.log("🌱 Customers seeded successfully");

        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding customers:", err);
        process.exit(1);
    }
};

seedCustomer();
