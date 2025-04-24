import { handleDocumentUpload } from "../utils/downloadWhatsappMedia";
import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { registerDocumentInAndesDocs } from "./registerDocumentInAndesDocs";
import { signatureService } from "./signatureService";
import { uploadService } from "./uploadService";

export async function handleDocumentMessage(from: string, message: any) {
  const state = uploadService.getState(from); // Necesitarías implementar este método
  const docName =
    state?.docName || message.document.filename.replace(".docx", "");
  const doc = message.document;
  const fileName = doc.filename || "documento.docx";

  // Validate file type
  if (!fileName.endsWith(".docx")) {
    await sendWhatsAppMessage(
      from,
      "⚠️ Por favor envía un archivo Word (.docx). " +
        "Otros formatos no son compatibles."
    );
    return;
  }

  // Download and upload to S3
  const { fileUrl, fileKey, fileBuffer } = await handleDocumentUpload(
    doc.id,
    fileName
  );

  const timestamp = Date.now();
  const documentId = String(timestamp);
  const documentKind = "documento_subido";

  // Register in Andes Docs
  await registerDocumentInAndesDocs(
    from,
    documentKind,
    documentId,
    fileKey,
    fileUrl,
    fileBuffer,
    fileName.replace(".docx", "")
  );

  // Ask if they want to sign
  await signatureService.initSignatureFlow(
    from,
    fileKey,
    documentId,
    documentKind
  );
}
