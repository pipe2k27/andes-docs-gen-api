import { Request, Response, NextFunction } from "express";

import { Company } from "../models/Company";
import { companies } from "../config/db";
import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { formatPhoneNumber } from "../utils/phoneFormatter";

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

  // Format number for comparison
  const formattedFrom = formatPhoneNumber(from);

  // Buscar si el número pertenece a alguna empresa autorizada
  const isAuthorized = companies.some((company: Company) =>
    company.whatsappNumbers.some(
      (companyNumber) => formatPhoneNumber(companyNumber) === formattedFrom
    )
  );

  if (!isAuthorized) {
    console.log(`⛔ Número no autorizado: ${from}`);
    await sendWhatsAppMessage(
      from,
      "Lo siento, usted no tiene acceso. Debe comunicarse con soporte. Disculpe las molestias"
    );
    res.sendStatus(403);
    return;
  }

  next();
};
