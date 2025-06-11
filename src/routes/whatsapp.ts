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

router.post("/", (req, res) => {
  console.log("📥 Webhook received body:", req.body);
  res.sendStatus(200);
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
