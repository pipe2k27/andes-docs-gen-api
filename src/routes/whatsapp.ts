import { Router } from "express";
import { validatePhoneMiddleware } from "../middlewares/validatePhoneMiddleware";
import { handleIncomingMessage } from "../services/messageHandler";

const router = Router();
const VERIFY_TOKEN = process.env.WHATS_VERIFY_TOKEN;

// Route para conectarse a la API de Whatsapp
router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verificado correctamente");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Message handling
router.post("/", validatePhoneMiddleware, async (req, res) => {
  console.log("📩 Mensaje recibido:", JSON.stringify(req.body, null, 2));

  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];
    const from = message?.from;

    if (!message) {
      console.log("🔍 No se encontró un mensaje en la solicitud.");
      res.sendStatus(400);
    }

    await handleIncomingMessage(from, message);
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error procesando el mensaje:", error);
    res.sendStatus(500);
  }
});

export default router;
