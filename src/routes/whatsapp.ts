import { Router } from "express";
import { validatePhoneMiddleware } from "../middlewares/validatePhoneMiddleware";
import { handleIncomingMessage } from "../services/messageHandler";

const router = Router();
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// Route to connect Bot to WhatsApp API
router.get("/", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("mode", mode);

  console.log("token", token);

  if (mode && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verificado correctamente");
    res.status(200).send(challenge);
  } else {
    console.log("❌ Webhook no verificado");

    res.sendStatus(403);
  }
});

router.post("/", validatePhoneMiddleware, async (req, res) => {
  try {
    if (req.body.entry) {
      // 📦 Meta (WABA)
      const entry = req.body.entry?.[0];
      const changes = entry?.changes?.[0];
      const message = changes?.value?.messages?.[0];

      console.log("📩 Meta Message Received:", { message });

      const from = message?.from;
      if (!message) return void res.status(400).json({ error: "No message" });

      await handleIncomingMessage(from, message);
      return void res.sendStatus(200);
    } else if (req.body.Body && req.body.From) {
      // 📦 Twilio
      const from = req.body.From.replace("whatsapp:", "");
      const body = req.body.Body;
      const waId = req.body.WaId;
      const profileName = req.body.ProfileName;

      const message = {
        from,
        id: req.body.MessageSid,
        timestamp: Math.floor(Date.now() / 1000).toString(),
        type: "text",
        text: { body },
        waId,
        profileName,
        source: "twilio",
      };

      console.log("📩 Twilio Message:", message);

      await handleIncomingMessage(from, message);
      return void res.sendStatus(200);
    } else {
      console.warn("❌ Estructura desconocida:", req.body);
      return void res.sendStatus(400);
    }
  } catch (error) {
    console.error("❌ Error procesando el mensaje:", error);
    return void res.sendStatus(500);
  }
});

// Message handling
// router.post("/", validatePhoneMiddleware, async (req, res) => {
//   try {
//     const entry = req.body.entry?.[0];
//     const changes = entry?.changes?.[0];
//     const message = changes?.value?.messages?.[0];

//     // Log for received messages
//     console.log("📩 WhatsApp Message Received:", {
//       contact: {
//         waId: changes?.value?.contacts?.[0]?.wa_id,
//         profileName: changes?.value?.contacts?.[0]?.profile?.name,
//       },
//       message: message
//         ? {
//             from: message.from,
//             messageId: message.id,
//             timestamp: message.timestamp,
//             type: message.type,
//             content:
//               message.text?.body ||
//               message.document?.filename ||
//               message.image?.caption ||
//               "[media content]",
//           }
//         : null,
//     });

//     const from = message?.from;

//     if (!message) {
//       res.sendStatus(400).json({ error: "Message is not received on request" });
//     }

//     await handleIncomingMessage(from, message);
//     res.sendStatus(200);
//   } catch (error) {
//     console.error("❌ Error procesando el mensaje:", error);
//     res.sendStatus(500);
//   }
// });

export default router;
