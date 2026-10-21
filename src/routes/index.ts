import { Router } from "express";
import AuthRouter from "./auth-route";
import UserRouter from "./user-route";
import RoleRouter from "./role-route";
import CateRouter from "./category-route";
import ProductRouter from "./product-route";
import cartRouter from "./cart-route";
import OrderRouter from "./order-route";

const router = Router();

// Auth route
router.use("/auth", AuthRouter);

// User Route
router.use("/", UserRouter);

router.use("/", RoleRouter);

router.use("/", CateRouter);

router.use("/", ProductRouter);

router.use("/", cartRouter);

router.use("/", OrderRouter);

export default router;

