import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import Router from "@/routes/index";
import { setupSwagger } from "@/config/swagger";
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler";
import { UPLOAD_ROOT } from "@/config/upload";

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

// === Uploaded product images ===
// nosniff: browsers must treat files as the image type we saved, never as HTML/JS
app.use("/uploads", express.static(UPLOAD_ROOT, {
  index: false,
  setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
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
