import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { UserModel } from "../models/user-model";
import { rolesModel } from "../models/role-model";
import { UserRoleModel } from "../models/user-roleModel";

type SeedUser = {
    full_name: string;
    user_name: string;
    email: string;
    password: string;
    phone: string;
};

const DEFAULT_ROLES = [
    { name: "ADMIN", des: "Manages users, categories, roles and orders" },
    { name: "FARMER", des: "Sells products" },
    { name: "CUSTOMER", des: "Buys products" },
];

/**
 * Connect, run the seed, disconnect, and set the exit code.
 */
export const runSeed = async (name: string, seed: () => Promise<void>) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        await seed();
        console.log(`🌱 ${name} seeded successfully`);
    } catch (error) {
        console.error(`❌ Seeding ${name} failed:`, error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

/**
 * Create the default roles if they don't exist yet (safe to run many times).
 */
export const seedRoles = async () => {
    for (const role of DEFAULT_ROLES) {
        await rolesModel.updateOne({ name: role.name }, { $setOnInsert: role }, { upsert: true });
    }
};

/**
 * Create one user with a role, skipping users that already exist.
 */
export const seedUser = async (user: SeedUser, roleName: string) => {
    const role = await rolesModel.findOne({ name: roleName });
    if (!role) {
        throw new Error(`Role ${roleName} not found. Run "npm run seed:roles" first.`);
    }

    const exists = await UserModel.findOne({ $or: [{ email: user.email }, { user_name: user.user_name }] });
    if (exists) {
        console.log(`⚠️ ${user.user_name} already exists, skipping`);
        return;
    }

    const created = await UserModel.create({ ...user, password: await bcrypt.hash(user.password, 12) });
    await UserRoleModel.create({ user_id: created._id, role_id: role._id });
};

/**
 * Seed every user in src/data/<fileName> with the given role.
 */
export const seedUsersFromFile = async (fileName: string, roleName: string) => {
    const filePath = path.join(process.cwd(), "src", "data", fileName);
    const users: SeedUser[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    for (const user of users) {
        await seedUser(user, roleName);
    }
};
