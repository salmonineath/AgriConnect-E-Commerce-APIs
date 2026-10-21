import { Router } from "express";
import { createCategoryController, getAllCategoriesController, getCategoryByIdController } from "@/controllers/category-controller";

const CateRouter = Router();

CateRouter.post("/categories", createCategoryController);
CateRouter.get("/categories", getAllCategoriesController);
CateRouter.get("/categories/:id", getCategoryByIdController);

export default CateRouter;