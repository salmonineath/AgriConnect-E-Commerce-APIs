import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { UserModel } from "../models/user-model";
import { rolesModel } from "../models/role-model";
import { UserRoleModel } from "../models/user-roleModel";

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("✅ Database connected");

        const {
            PASSWORD_ADMIN,
            FULL_NAME_ADMIN,
            USER_NAME_ADMIN,
            EMAIL_ADMIN,
            PHONE_ADMIN
        } = process.env;

        // 1. Check if admin user exists
        const existingAdmin = await UserModel.findOne({ email: EMAIL_ADMIN });
        if (existingAdmin) {
            console.log("⚠️ Admin already exists. Skipping seed.");
            process.exit(0);
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(PASSWORD_ADMIN!, 10);

        // 3. Create admin user
        const newAdmin = await UserModel.create({
            full_name: FULL_NAME_ADMIN,
            user_name: USER_NAME_ADMIN,
            email: EMAIL_ADMIN,
            password: hashedPassword,
            phone: PHONE_ADMIN,
        });

        // 4. Find admin role
        const adminRole = await rolesModel.findOne({ name: "ADMIN" });
        if (!adminRole) {
            console.log("❌ ADMIN role not found. Make sure roles are seeded first.");
            process.exit(1);
        }

        // 5. Insert into user_roles pivot table
        await UserRoleModel.create({
            user_id: newAdmin._id,
            role_id: adminRole._id,
        });

        console.log("🎉 Admin user seeded successfully with ADMIN role!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
}

seedAdmin();
