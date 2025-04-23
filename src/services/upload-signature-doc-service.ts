import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { s3StoreFile } from "../utils/s3Uploader";
import { registerDocumentInAndesDocs } from "./upload-document-reference-service";
import { signatureConversations } from "./esignature-service";
import { v4 as uuidv4 } from "uuid";
import { getCompanyByPhone } from "../config/db";
import { downloadWhatsAppMedia } from "../utils/downloadWhatsappMedia";

export const uploadConversations: Record<string, { step: number }> = {};

export const handleUploadFlow = async (from: string, messageText: string) => {
  const state = uploadConversations[from];

  if (state.step === 0) {
    await sendWhatsAppMessage(
      from,
      "📎 Por favor, envía el archivo `.docx` que deseas subir y firmar."
    );
    state.step++;
    return;
  }

  if (state.step === 1 && messageText.startsWith("media:")) {
    const mediaId = messageText.replace("media:", "").trim();

    try {
      const fileBuffer = await downloadWhatsAppMedia(mediaId);
      const docName = `documento-${Date.now()}`;
      const fileKey = `${docName}.docx`;
      const fileUrl = await s3StoreFile("wa-generation", fileKey, fileBuffer);
      const documentId = uuidv4();

      const company = getCompanyByPhone(from);
      if (!company) {
        throw new Error(
          "No se encontró la empresa asociada al número de WhatsApp."
        );
      }

      await registerDocumentInAndesDocs(
        from,
        "reserva", // Puedes cambiar esto si deseas detectar otro tipo de documento
        documentId,
        fileKey,
        fileUrl,
        fileBuffer,
        docName
      );

      await sendWhatsAppMessage(
        from,
        `✅ Tu documento fue cargado con éxito y está listo para enviarse a firma. Puedes verlo aquí:\n${fileUrl}`
      );

      // Iniciar flujo de firma electrónica
      signatureConversations[from] = {
        from,
        filePath: fileKey, // Aquí estás usando `fileKey` como path en S3
        documentId,
        documentKind: "Whatsapp Document", // o el que corresponda
        signers: [],
        step: 0,
      };

      delete uploadConversations[from];
      return await sendWhatsAppMessage(
        from,
        "¿Deseas enviar este documento a firma electrónica?\n1. Sí\n2. No"
      );
    } catch (err) {
      console.error("Error al procesar el archivo:", err);
      return await sendWhatsAppMessage(
        from,
        "❌ Ocurrió un error al procesar el archivo. Asegúrate de enviar un archivo válido `.docx`."
      );
    }
  }

  return await sendWhatsAppMessage(
    from,
    "⚠️ Esperamos un archivo `.docx`. Por favor, intenta de nuevo."
  );
};
