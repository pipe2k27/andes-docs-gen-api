import { Request, Response, NextFunction } from "express";
import { Company } from "../models/Company";
import { companies } from "../config/db";
import { formatPhoneNumber } from "../utils/phoneFormatter";
import { sendWhatsAppMessage } from "../controllers/whatsappController";

// Cache para números no autorizados que ya recibieron el mensaje
const unauthorizedNotifiedNumbers = new Set<string>();

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
  const formattedFrom = formatPhoneNumber(from);

  // Verificar si el número ya está en caché como no autorizado
  if (unauthorizedNotifiedNumbers.has(formattedFrom)) {
    console.log(`⛔ Número no autorizado (ya notificado): ${from}`);
    res.sendStatus(403);
    return;
  }

  // Buscar si el número pertenece a alguna empresa autorizada
  const isAuthorized = companies.some((company: Company) =>
    company.whatsappNumbers.some(
      (companyNumber) => formatPhoneNumber(companyNumber) === formattedFrom
    )
  );

  if (!isAuthorized) {
    console.log(`⛔ Número no autorizado: ${from}`);
    unauthorizedNotifiedNumbers.add(formattedFrom);

    await sendWhatsAppMessage(
      from,
      "Lo siento, usted no tiene acceso. Debe comunicarse con soporte. Disculpe las molestias"
    );
    res.sendStatus(403);
    return;
  }

  next();
};
