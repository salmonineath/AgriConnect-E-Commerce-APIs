import { Router } from "express";
import { createRoleController } from "@/controllers/role-controller";

const RoleRouter = Router();

RoleRouter.post("/roles", createRoleController)

export default RoleRouter;