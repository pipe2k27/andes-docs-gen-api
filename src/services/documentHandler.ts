import { handleDocumentUpload } from "../utils/downloadWhatsappMedia";
import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { registerDocumentInAndesDocs } from "./registerDocumentInAndesDocs";
import { signatureService } from "./signatureService";
import { uploadService } from "./uploadService";

export async function handleDocumentMessage(from: string, message: any) {
  try {
    const doc = message.document;
    const fileName = doc.filename;

    // 1. Validate file type
    if (!fileName.toLowerCase().endsWith(".docx")) {
      await sendWhatsAppMessage(
        from,
        "⚠️ Por favor envía un archivo Word (.docx)\n" +
          "Otros formatos no son compatibles."
      );
      return;
    }

    // 2. Process document upload to S3
    let uploadResult;
    try {
      uploadResult = await handleDocumentUpload(doc.id, fileName);
    } catch (uploadError) {
      console.error("Error uploading to S3:", uploadError);
      throw new Error(
        "❌ Falló la subida del documento a S3. Por favor, inténtalo de nuevo."
      );
    }

    const { fileUrl, fileKey, fileBuffer } = uploadResult;

    // 3. Get document name from upload state or filename
    const uploadState = uploadService.getState(from);
    const docName = uploadState?.docName || fileName.replace(".docx", "");

    // 4. Register in Andes Docs
    try {
      await registerDocumentInAndesDocs(
        from,
        "Whatsapp Document",
        Date.now().toString(),
        fileKey,
        fileUrl,
        fileBuffer,
        docName
      );
    } catch (registrationError) {
      console.error("Error registering in Andes Docs:", registrationError);
      throw new Error(
        "❌ Falló el registro en Andes Docs. El documento se subió pero no se registró."
      );
    }

    // 5. Clear upload state if exists
    uploadService.clearState(from);

    // 6. Ask about signature
    try {
      await signatureService.initSignatureFlow(
        from,
        fileKey,
        Date.now().toString(),
        "Whatsapp Document"
      );
    } catch (signatureError) {
      console.error("Error initiating signature flow:", signatureError);
      await sendWhatsAppMessage(
        from,
        "✅ Documento subido y registrado correctamente, pero hubo un error al preparar la firma.\n\n" +
          "Puedes gestionar la firma directamente en la plataforma de Andes Docs."
      );
    }
  } catch (error) {
    console.error("Error en handleDocumentMessage:", error);

    await sendWhatsAppMessage(
      from,
      error instanceof Error
        ? error.message
        : "❌ Error al procesar el documento. Por favor, inténtalo de nuevo."
    );

    // Retry upload flow if it was in progress
    if (uploadService.getState(from)) {
      await sendWhatsAppMessage(
        from,
        "🔄 Por favor, envía el documento .docx nuevamente"
      );
    }
  }
}
