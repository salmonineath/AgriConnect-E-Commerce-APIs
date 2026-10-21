"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("@/config/db"));
const index_1 = __importDefault(require("@/routes/index"));
const errorHandler_1 = require("@/middleware/errorHandler");
const swagger_1 = require("@/config/swagger");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
const FRONTEND_ORIGIN = (_a = process.env.FRONTEND_ORIGIN) !== null && _a !== void 0 ? _a : "http://localhost:5173";
app.use((0, cors_1.default)({
    origin: FRONTEND_ORIGIN,
    credentials: true,
}));
(0, swagger_1.setupSwagger)(app);
app.use("/api", index_1.default);
app.use((_req, _res, next) => {
    const error = new Error("Route not found");
    error.statusCode = 404;
    next(error);
});
app.use(errorHandler_1.errorHandler);
(0, db_1.default)()
    .then(() => console.log("✅ Database connected"))
    .catch((err) => console.error("❌ Database connection failed:", err));
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📘 Swagger Docs at http://localhost:${PORT}/swagger`);
});
