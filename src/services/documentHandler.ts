import { handleDocumentUpload } from "../utils/downloadWhatsappMedia";
import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { registerDocumentInAndesDocs } from "./registerDocumentInAndesDocs";
import { signatureService } from "./signatureService";
import { uploadService } from "./uploadService";

export async function handleDocumentMessage(from: string, message: any) {
  try {
    const doc = message.document;
    const fileName = doc.filename || "documento.docx";

    // Validar tipo de archivo primero
    if (!fileName.toLowerCase().endsWith(".docx")) {
      await sendWhatsAppMessage(
        from,
        "⚠️ Por favor envía un archivo Word (.docx)\n" +
          "Otros formatos no son compatibles."
      );
      return;
    }

    // Procesar documento
    const { fileUrl, fileKey, fileBuffer } = await handleDocumentUpload(
      doc.id,
      fileName
    );

    // Obtener nombre del documento si está en flujo de subida
    const uploadState = uploadService.getState(from);
    const docName = uploadState?.docName || fileName.replace(".docx", "");

    // Registrar en Andes Docs
    await registerDocumentInAndesDocs(
      from,
      "documento_subido",
      Date.now().toString(),
      fileKey,
      fileUrl,
      fileBuffer,
      docName
    );

    // Limpiar estado de subida si existe
    uploadService.clearState(from);

    // Preguntar por firma
    await signatureService.initSignatureFlow(
      from,
      fileKey,
      Date.now().toString(),
      "documento_subido"
    );
  } catch (error) {
    console.error("Error en handleDocumentMessage:", error);

    await sendWhatsAppMessage(
      from,
      error instanceof Error
        ? error.message
        : "❌ Error al procesar el documento. Por favor, inténtalo de nuevo."
    );

    // Reintentar flujo de subida si estaba en progreso
    if (uploadService.getState(from)) {
      await sendWhatsAppMessage(
        from,
        "🔄 Por favor, envía el documento .docx nuevamente"
      );
    }
  }
}
