import mongoose from "mongoose";
import { env } from "@/config/env";

const connectDB = async () => {
    const MONGODB_URI = env.MONGODB_URI;

    if (!MONGODB_URI) {
        throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
};

export default connectDB;
