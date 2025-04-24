import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { handleDocumentMessage } from "../services/documentHandler";
import { handleTextMessage } from "./textHandler";

export async function handleIncomingMessage(from: string, message: any) {
  try {
    // Handle document messages
    if (message.type === "document") {
      return await handleDocumentMessage(from, message);
    }

    // Handle text messages
    if (message.type === "text") {
      const text = message.text?.body || "";
      return await handleTextMessage(from, text);
    }

    // Unsupported message type
    console.log(`⚠️ Tipo de mensaje no soportado: ${message.type}`);
    await sendWhatsAppMessage(
      from,
      "Lo siento, solo puedo procesar mensajes de texto o documentos .docx"
    );
  } catch (error) {
    console.error("❌ Error en handleIncomingMessage:", error);
    await sendWhatsAppMessage(
      from,
      "Hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo."
    );
    throw error;
  }
}
