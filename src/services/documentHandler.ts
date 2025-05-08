import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { handleDocumentUpload } from "../utils/downloadWhatsappMedia";
import { registerDocumentInAndesDocs } from "./registerDocumentInAndesDocs";
import { signatureService } from "./signatureService";
import { uploadService } from "./uploadService";

export async function handleDocumentMessage(from: string, message: any) {
  try {
    const doc = message.document;
    const fileName = doc.filename || "documento.pdf";
    const fileExt = fileName.split(".").pop()?.toLowerCase();

    // Validate extention
    if (fileExt !== "pdf" && fileExt !== "docx") {
      await sendWhatsAppMessage(
        from,
        "⚠️ Por favor envía un archivo en formato:\n" +
          "• Word (.docx)\n" +
          "• PDF (.pdf)\n\n" +
          "Otros formatos no son compatibles."
      );
      return;
    }

    // Process document upload to S3
    const uploadResult = await handleDocumentUpload(doc.id, fileName);
    const { fileUrl, fileKey, fileBuffer } = uploadResult;

    // Register in Andes Docs using the filename (without .docx) as docName
    const docName = fileName.replace(/\.[^/.]+$/, "");
    await registerDocumentInAndesDocs(
      from,
      "WA Document",
      Date.now().toString(),
      fileKey,
      fileUrl,
      fileBuffer,
      docName,
      fileExt
    );

    // Ask about signature
    await signatureService.initSignatureFlow(
      from,
      fileKey,
      Date.now().toString(),
      "WA Document"
    );

    // Finalizar proceso
    uploadService.completeUpload(from);

    await sendWhatsAppMessage(
      from,
      "✅ Documento subido correctamente. ¿Necesitas algo más?"
    );
  } catch (error) {
    console.error("Error en handleDocumentMessage:", error);
    uploadService.completeUpload(from); // Asegurar limpieza en caso de error

    await sendWhatsAppMessage(
      from,
      error instanceof Error
        ? error.message
        : "❌ Error al procesar el documento. Por favor, inténtalo de nuevo."
    );
  }
}
