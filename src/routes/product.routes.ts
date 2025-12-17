import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { authAdmin } from "../middlewares/authAdmin";

const router = Router();

router.get("/", productController.list);
router.get("/:id", productController.getById);
router.post("/", authAdmin, productController.create);
router.put("/:id", authAdmin, productController.update);
router.delete("/:id", authAdmin, productController.remove);

export default router;
