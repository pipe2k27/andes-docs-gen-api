import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { handleDocumentUpload } from "../utils/downloadWhatsappMedia";
import { registerDocumentInAndesDocs } from "./registerDocumentInAndesDocs";
import { signatureService } from "./signatureService";
import { uploadService } from "./uploadService";

export async function handleDocumentMessage(from: string, message: any) {
  try {
    const doc = message.document;
    const fileName = doc.filename || "documento.docx";

    // Validate file type
    if (!fileName.toLowerCase().endsWith(".docx")) {
      await sendWhatsAppMessage(
        from,
        "⚠️ Por favor envía un archivo Word (.docx)\n" +
          "Otros formatos no son compatibles."
      );
      return;
    }

    // Process document upload to S3
    const uploadResult = await handleDocumentUpload(doc.id, fileName);
    const { fileUrl, fileKey, fileBuffer } = uploadResult;

    // Register in Andes Docs using the filename (without .docx) as docName
    const docName = fileName.replace(/\.docx$/i, "");
    await registerDocumentInAndesDocs(
      from,
      "documento_subido",
      Date.now().toString(),
      fileKey,
      fileUrl,
      fileBuffer,
      docName
    );

    // Send success message with document URL
    await sendWhatsAppMessage(
      from,
      `✅ El documento se generó y subió a Andes Docs correctamente!\n\n` +
        `Podes descargarlo, editarlo o simplemente verlo, también podes trabajar con él en la plataforma oficial.\n\n` +
        `Te comparto el link: ${fileUrl}`
    );

    // Ask about signature
    await signatureService.initSignatureFlow(
      from,
      fileKey,
      Date.now().toString(),
      "documento_subido"
    );

    // Complete the upload process
    uploadService.completeUpload(from);
  } catch (error) {
    console.error("Error en handleDocumentMessage:", error);
    await sendWhatsAppMessage(
      from,
      error instanceof Error
        ? error.message
        : "❌ Error al procesar el documento. Por favor, inténtalo de nuevo."
    );

    if (uploadService.isUploadInProgress(from)) {
      await sendWhatsAppMessage(
        from,
        "🔄 Por favor, envía el documento .docx nuevamente"
      );
    }
  }
}
