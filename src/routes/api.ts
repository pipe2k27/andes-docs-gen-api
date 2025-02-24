import { Router } from "express";
import { apiController } from "../controllers/apiController";
import { apiKeyMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/reserva", apiKeyMiddleware, apiController);

export default router;
