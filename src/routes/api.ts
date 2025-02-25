import { Router } from "express";
import { apiController } from "../controllers/apiController";
import { apiKeyMiddleware } from "../middlewares/authMiddleware";
import { reservaDto } from "../dtos/reservaDto";

const router = Router();

router.post("/reserva", apiKeyMiddleware, reservaDto, apiController);

export default router;
