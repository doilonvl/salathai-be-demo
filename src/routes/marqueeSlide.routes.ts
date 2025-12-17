import { Router } from "express";
import { marqueeSlideController } from "../controllers/marqueeSlide.controller";
import { authAdmin } from "../middlewares/authAdmin";

const router = Router();

router.get("/", marqueeSlideController.list);
router.get("/admin", authAdmin, marqueeSlideController.adminList);
router.get("/:id", marqueeSlideController.getById);
router.post("/", authAdmin, marqueeSlideController.create);
router.put("/:id", authAdmin, marqueeSlideController.update);
router.delete("/:id", authAdmin, marqueeSlideController.remove);

export default router;
