import { Router } from "express";
import { landingMenuController } from "../controllers/landingMenu.controller";
import { authAdmin } from "../middlewares/authAdmin";

const router = Router();

router.get("/", landingMenuController.list);
router.get("/admin", authAdmin, landingMenuController.adminList);
router.get("/:id", landingMenuController.getById);
router.post("/", authAdmin, landingMenuController.create);
router.put("/:id", authAdmin, landingMenuController.update);
router.delete("/:id", authAdmin, landingMenuController.remove);

export default router;
