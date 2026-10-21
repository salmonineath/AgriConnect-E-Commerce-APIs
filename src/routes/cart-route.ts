import { Router } from "express";
import { getCartController, addToCartController, removeFromCartController } from "@/controllers/cart-controller";
import { authenticateToken } from "@/middleware/authenticateToken";
import { authorizeRole } from "@/middleware/authorizeRole";

const cartRouter = Router();

cartRouter.get("/cart", 
    authenticateToken, 
    authorizeRole("USER", "ADMIN", "FARMER"), 
    getCartController
);

cartRouter.post("/cart/add", 
    authenticateToken, 
    authorizeRole("USER", "ADMIN", "FARMER"), 
    addToCartController
);

cartRouter.delete("/cart/remove/:productId", 
    authenticateToken, 
    authorizeRole("USER", "ADMIN", "FARMER"), 
    removeFromCartController
);

export default cartRouter;