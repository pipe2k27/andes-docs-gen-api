import { Router } from "express";
import { reservaController } from "../controllers/reservaController";
import { autorizationController } from "../controllers/autorizationController";
import { apiKeyMiddleware } from "../middlewares/authMiddleware";
import { reservaDto } from "../dtos/reservaDto";
import { autorizacionDto } from "../dtos/autorizacionDto";

const router = Router();

router.post("/reserva", apiKeyMiddleware, reservaDto, reservaController);

router.post(
  "/autorizacion",
  apiKeyMiddleware,
  autorizacionDto,
  autorizationController
);

export default router;
