import { Router } from "express";
import { createProductController, getAllProductController } from "@/controllers/product-controller";
import { authenticateToken } from "@/middleware/authenticateToken";
import { authorizeRole } from "@/middleware/authorizeRole";

const ProductRouter = Router();

ProductRouter.post("/products", 
    authenticateToken, 
    authorizeRole("ADMIN", "FARMER"), 
    createProductController
);

ProductRouter.get("/products", 
    authenticateToken,
    authorizeRole("ADMIN", "FARMER"),
    getAllProductController
);

export default ProductRouter;