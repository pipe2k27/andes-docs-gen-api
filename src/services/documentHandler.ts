import { handleDocumentUpload } from "../utils/downloadWhatsappMedia";
import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { registerDocumentInAndesDocs } from "./registerDocumentInAndesDocs";
import { signatureService } from "./signatureService";

export async function handleDocumentMessage(from: string, message: any) {
  const doc = message.document;
  const fileName = doc.filename || "documento.docx";

  // Validate file type
  if (!fileName.endsWith(".docx")) {
    await sendWhatsAppMessage(from, "Por favor, envía un archivo `.docx`.");
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
