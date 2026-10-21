import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import Router from "@/routes/index";
import { setupSwagger } from "@/config/swagger";
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler";

const app = express();

// === Middleware ===
app.use(express.json({ limit: "100kb" }));
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
app.use(notFoundHandler);

// === Error-handling middleware (must be LAST) ===
app.use(errorHandler);

export default app;
