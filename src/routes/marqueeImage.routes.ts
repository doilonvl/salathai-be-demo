import { Router } from "express";
import { marqueeImageController } from "../controllers/marqueeImage.controller";
import { authAdmin } from "../middlewares/authAdmin";

const router = Router();

router.get("/", marqueeImageController.list);
router.get("/admin", authAdmin, marqueeImageController.adminList);
router.get("/:id", marqueeImageController.getById);
router.post("/", authAdmin, marqueeImageController.create);
router.put("/:id", authAdmin, marqueeImageController.update);
router.delete("/:id", authAdmin, marqueeImageController.remove);

export default router;
