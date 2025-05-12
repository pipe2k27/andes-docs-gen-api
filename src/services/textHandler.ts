import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { signatureService } from "../services/signatureService";
import { documentService } from "./documentService";
import { mainMenuService } from "./mainMenuService";
import { uploadService } from "./uploadService";

export async function handleTextMessage(from: string, text: string) {
  const trimmedText = text.trim();

  // Manejar cancelación global (en cualquier flujo)
  if (/^cancelar$/i.test(trimmedText)) {
    await handleGlobalCancel(from);
    return;
  }

  // Manejar cancelación
  if (trimmedText === "0" && uploadService.isUploadInProgress(from)) {
    await uploadService.cancelUpload(from);
    return;
  }

  // Check if in signature flow
  if (await signatureService.handleSignatureResponse(from, trimmedText)) {
    return;
  }

  // Check if in document generation flow
  if (
    await documentService.handleDocumentGenerationResponse(from, trimmedText)
  ) {
    return;
  }

  // Verificar subida en progreso
  if (uploadService.isUploadInProgress(from)) {
    await sendWhatsAppMessage(
      from,
      "⚠️ Estamos esperando tu documento. Por favor:\n" +
        "• Envía tu archivo (.docx o .pdf)\n" +
        "• O escribe '0' para cancelar"
    );
    return;
  }

  // Handle main menu options
  await mainMenuService.handleMainMenu(from, trimmedText);
}

async function handleGlobalCancel(from: string) {
  // Limpiar todos los estados posibles
  documentService.clearDocumentGeneration(from);
  uploadService.completeUpload(from);

  await sendWhatsAppMessage(
    from,
    "❌ Proceso cancelado. Escribe *menu* para iniciar de nuevo."
  );
}
