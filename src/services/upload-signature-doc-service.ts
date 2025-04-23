import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { s3StoreFile } from "../utils/s3Uploader";
import { registerDocumentInAndesDocs } from "./upload-document-reference-service";
import { signatureConversations } from "./esignature-service";
import { getCompanyByPhone } from "../config/db";
import { downloadWhatsAppMedia } from "../utils/downloadWhatsappMedia";

export const uploadConversations: Record<string, { step: number }> = {};

export const handleUploadFlow = async (
  from: string,
  messageText: string,
  documentId?: string // <- este nuevo parámetro
) => {
  const state = uploadConversations[from];

  if (state.step === 0) {
    await sendWhatsAppMessage(
      from,
      "📎 Por favor, envía el archivo `.docx` que deseas subir y firmar."
    );
    state.step++;
    return;
  }

  if (state.step === 1 && documentId) {
    const mediaId = documentId.trim();

    try {
      const fileBuffer = await downloadWhatsAppMedia(mediaId);
      const docName = `documento-${Date.now()}`;
      const fileKey = `${docName}.docx`;
      const fileUrl = await s3StoreFile("wa-generation", fileKey, fileBuffer);

      console.log("fileUrl generado:", fileUrl);

      const company = getCompanyByPhone(from);
      if (!company) {
        throw new Error(
          "No se encontró la empresa asociada al número de WhatsApp."
        );
      }

      const now = Date.now();

      const documentId = String(now);

      await registerDocumentInAndesDocs(
        from,
        "Whatsapp Document",
        documentId,
        fileKey,
        fileUrl,
        fileBuffer,
        docName
      );

      if (typeof fileUrl !== "string") {
        console.error("fileUrl no es una cadena válida:", fileUrl);
        return await sendWhatsAppMessage(
          from,
          "❌ Ocurrió un error al procesar el archivo. Intenta nuevamente."
        );
      }

      await sendWhatsAppMessage(
        from,
        `✅ Tu documento fue cargado con éxito y está listo para enviarse a firma. Puedes verlo aquí:\n${fileUrl}`
      );

      // Iniciar flujo de firma electrónica
      signatureConversations[from] = {
        from,
        filePath: fileKey, // Aquí estás usando `fileKey` como path en S3
        documentId,
        documentKind: "Whatsapp Document",
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
