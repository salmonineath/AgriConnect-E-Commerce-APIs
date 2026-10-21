import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "@/config/db";
import Router from "@/routes/index";
// import { errorHandler } from "@/middleware/errorHandler";
import { setupSwagger } from "@/config/swagger";

const app = express();

// === Middleware ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS — allow credentials for cookies
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
app.use(cors({
  origin: FRONTEND_ORIGIN, // accept requests from your frontend
  credentials: true, // allow cookies
}));

// === Swagger Docs ===
setupSwagger(app);

// === Routes ===
app.use("/api", Router);

// === 404 handler for unknown routes ===
app.use((_req, _res, next) => {
  const error = new Error("Route not found");
  (error as any).statusCode = 404;
  next(error);
});

// === Error-handling middleware (must be LAST) ===
// app.use(errorHandler);

// === Connect to DB and start server ===
// console.log("connecting...")
connectDB()
  .then(() => console.log("✅ Database connected"))
  .catch((err) => console.error("❌ Database connection failed:", err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📘 Swagger Docs at http://localhost:${PORT}/swagger`);
});
