import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { UserModel } from "../models/user-model";
import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";

const projectRoot = process.cwd();

const seedFarmer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("Database Connected");

        const filePath = path.join(projectRoot, "src", "data", "farmer.json");
        const farmerData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        // await UserModel.deleteMany({});
        // console.log("Old farmer removed");

        const farmerHashed = await Promise.all(
            farmerData.map(async (farmer: any) => ({
                ...farmer,
                password: await bcrypt.hash(farmer.password, 10)
            }))
        );

        await UserModel.insertMany(farmerHashed);
        console.log("Farmer seeded successfully");

        process.exit(0);
    } catch (err) {
        console.error("Error seeding farmer", err)
        process.exit(1);
    }
}

seedFarmer();