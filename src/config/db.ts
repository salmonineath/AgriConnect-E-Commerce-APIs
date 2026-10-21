import mongoose from "mongoose";
import { env } from "@/config/env";


const connectDB = async () => {
    try {
        const MONGODB_URI = env.MONGODB_URI;

        if (!MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in environment variables");
            // console.error("MONGODB_URI is not defined in environment variables");
            // return;

        }

        const conn = await mongoose.connect(MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
}

export default connectDB;