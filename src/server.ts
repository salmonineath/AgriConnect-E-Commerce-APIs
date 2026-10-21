import dotenv from "dotenv";
dotenv.config();

import app from "@/app";
import connectDB from "@/config/db";

const PORT = process.env.PORT || 8000;

// === Connect to DB, then start server ===
connectDB()
  .then(() => {
    console.log("✅ Database connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📘 Swagger Docs at http://localhost:${PORT}/swagger`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });
