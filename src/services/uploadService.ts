import { sendWhatsAppMessage } from "../controllers/whatsappController";

class UploadService {
  private uploadInProgress: Set<string> = new Set();

  isUploadInProgress(from: string): boolean {
    return this.uploadInProgress.has(from);
  }

  startUpload(from: string) {
    this.uploadInProgress.add(from);
  }

  completeUpload(from: string) {
    this.uploadInProgress.delete(from);
    console.log(`✅ Upload process completed for ${from}`);
  }

  async initUploadFlow(from: string) {
    if (this.isUploadInProgress(from)) {
      await sendWhatsAppMessage(
        from,
        "⚠️ Ya tienes un proceso de subida en curso. Por favor envía tu documento ahora o escribe '0' para cancelar."
      );
      return;
    }

    this.startUpload(from);

    await sendWhatsAppMessage(
      from,
      "📤 *Subir documento a Andes Docs*\n\n" +
        "Por favor envía el archivo en uno de estos formatos:\n" +
        "• Word (.docx)\n" +
        "• PDF (.pdf)\n\n" +
        "Requisitos:\n" +
        "• Tamaño máximo: 10MB\n" +
        "• Nombre claro (sin caracteres especiales)\n\n" +
        "O escribe '0' para cancelar"
    );
  }

  async cancelUpload(from: string) {
    this.completeUpload(from);
    await sendWhatsAppMessage(
      from,
      "❌ Proceso de subida cancelado. Escribe *menu* para comenzar de nuevo"
    );
  }
}

export const uploadService = new UploadService();
