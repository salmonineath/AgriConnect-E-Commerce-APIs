import cors from "cors";
export const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export const corsMiddleware = cors(corsOptions);
