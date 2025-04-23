// services/upload-signature-service.ts
import { s3StoreFile } from "../utils/s3Uploader";
import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { getCompanyByPhone } from "../config/db";
import { registerDocumentInAndesDocs } from "./upload-document-reference-service";
import { signatureConversations } from "./esignature-service";

type UploadConversation = {
  step: number;
  fileName?: string;
};

export const uploadConversations: Record<string, UploadConversation> = {};

export const handleUploadFlow = async (
  from: string,
  message: string,
  mediaUrl?: string,
  mimeType?: string
) => {
  const convo = uploadConversations[from] || { step: 0 };

  if (convo.step === 0) {
    await sendWhatsAppMessage(
      from,
      "📄 Por favor, envíanos el archivo .docx que deseas enviar a firmar."
    );
    uploadConversations[from] = { step: 1 };
    return;
  }

  if (convo.step === 1) {
    if (
      !mediaUrl ||
      !mimeType ||
      !mimeType.includes(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    ) {
      return "❌ El archivo debe ser un documento Word (.docx). Intenta nuevamente.";
    }

    const fileName = `upload-${Date.now()}.docx`;
    const fileBuffer = await fetch(mediaUrl).then((res) => res.arrayBuffer());

    const fileUrl = await s3StoreFile(
      "wa-generation",
      fileName,
      Buffer.from(fileBuffer)
    );

    const company = getCompanyByPhone(from);
    if (!company) {
      delete uploadConversations[from];
      return "❌ No se encontró la empresa asociada a este número.";
    }

    const documentId = Date.now().toString();
    const docName = `Documento Subido ${from}`;

    await registerDocumentInAndesDocs(
      from,
      "documento_subido",
      documentId,
      fileName,
      fileUrl,
      Buffer.from(fileBuffer),
      docName
    );

    signatureConversations[from] = {
      from,
      filePath: fileName,
      documentId,
      documentKind: "documento_subido",
      signers: [],
      step: 0,
    };

    delete uploadConversations[from];
    return "✅ Documento subido correctamente. Ahora procederemos a la firma...\n\n1. Sí\n2. No";
  }
};
