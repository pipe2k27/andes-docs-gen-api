import { Router } from "express";
import { handleUserResponse } from "../services/conversations-service";
import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { validatePhoneMiddleware } from "../middlewares/validatePhoneMiddleware";
import { registerDocumentInAndesDocs } from "../services/upload-document-reference-service";
import { uploadConversations } from "../services/upload-signature-doc-service";
import { handleDocumentUpload } from "../utils/downloadWhatsappMedia";

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

// Route que administra los mensajes enviados a la API de Whatsapp
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

    // 📎 Si es un documento, procesarlo
    if (message.type === "document") {
      const doc = message.document;
      const mediaId = doc.id;
      const fileName = doc.filename || "documento.docx";
      const mimeType = doc.mime_type;

      console.log("📎 Documento recibido:", fileName, mimeType);

      // ⚠️ Validar tipo
      if (!fileName.endsWith(".docx")) {
        await sendWhatsAppMessage(from, "Por favor, envía un archivo `.docx`.");
        res.sendStatus(200);
      }

      // ✅ Descarga desde WhatsApp + subida a S3
      const { fileUrl, fileKey, fileBuffer } = await handleDocumentUpload(
        mediaId,
        fileName
      );

      const timestamp = Date.now();
      const documentId = String(timestamp);
      const documentKind = "documento_subido";

      // 📝 Registrarlo en Andes Docs
      await registerDocumentInAndesDocs(
        from,
        documentKind,
        documentId,
        fileKey,
        fileUrl,
        fileBuffer,
        fileName.replace(".docx", "")
      );

      // 🚀 Iniciar flujo de firma
      uploadConversations[from] = {
        from,
        filePath: fileKey,
        documentId,
        documentKind,
        step: 0,
        signers: [],
      };

      await sendWhatsAppMessage(
        from,
        `✅ Recibimos tu archivo *${fileName}*. ¿Deseas enviarlo a firma electrónica?\n\n1. Sí\n2. No`
      );

      res.sendStatus(200);
    }

    // ✉️ Si es texto, sigue flujo normal
    const text = message.text?.body || "";
    console.log(`📥 Mensaje de ${from}: ${text}`);
    const replyMessage = await handleUserResponse(from, text);
    if (replyMessage) await sendWhatsAppMessage(from, replyMessage);
    res.sendStatus(200);
  } catch (error) {
    console.error("❌ Error procesando el mensaje:", error);
    res.sendStatus(500);
  }
});

export default router;
