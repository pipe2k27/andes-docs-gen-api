import { Request, Response, NextFunction } from "express";

import { Company } from "../models/Company";
import { companies } from "../config/db";
import { sendWhatsAppMessage } from "../controllers/whatsappController";

export const validatePhoneMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];

  if (!message) {
    res.sendStatus(400);
    return;
  }

  const from = message.from;

  console.log(`📞 Número recibido en el webhook: ${from}`);

  // Buscar si el número pertenece a alguna empresa autorizada
  const isAuthorized = companies.some((company: Company) =>
    company.whatsappNumbers.includes(from)
  );

  if (!isAuthorized) {
    console.log(`⛔ Número no autorizado: ${from}`);
    await sendWhatsAppMessage(from, "Lo siento, usted no tiene poder aquí.");
    res.sendStatus(403);
    return;
  }

  next();
};
