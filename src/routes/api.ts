import { Router } from "express";
import { apiController } from "../controllers/apiController";
import { apiKeyMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/generate", apiKeyMiddleware, apiController);

export default router;
