import { Router } from "express";
import { validatePhoneMiddleware } from "../middlewares/validatePhoneMiddleware";
import { handleIncomingMessage } from "../services/messageHandler";

const router = Router();
const VERIFY_TOKEN = process.env.WHATS_VERIFY_TOKEN;

// Route to connect Bot to WhatsApp API
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
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    // Structured logging of the relevant message data
    console.log("📩 WhatsApp Message Received:", {
      metadata: {
        phoneNumberId: changes?.value?.metadata?.phone_number_id,
        displayNumber: changes?.value?.metadata?.display_phone_number,
        timestamp: new Date().toISOString(),
      },
      contact: {
        waId: changes?.value?.contacts?.[0]?.wa_id,
        profileName: changes?.value?.contacts?.[0]?.profile?.name,
      },
      message: message
        ? {
            from: message.from,
            messageId: message.id,
            timestamp: message.timestamp,
            type: message.type,
            content:
              message.text?.body ||
              message.document?.filename ||
              message.image?.caption ||
              "[media content]",
          }
        : null,
    });

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
