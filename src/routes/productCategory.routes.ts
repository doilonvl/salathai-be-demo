import { Router } from "express";
import { productCategoryController } from "../controllers/productCategory.controller";
import { authAdmin } from "../middlewares/authAdmin";

const router = Router();

router.get("/", productCategoryController.list);
router.get("/:id", productCategoryController.getById);
router.post("/", authAdmin, productCategoryController.create);
router.put("/:id", authAdmin, productCategoryController.update);
router.delete("/:id", authAdmin, productCategoryController.remove);

export default router;
