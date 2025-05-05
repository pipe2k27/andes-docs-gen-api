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
  }

  async initUploadFlow(from: string) {
    this.startUpload(from);

    await sendWhatsAppMessage(
      from,
      "Primero vamos a subir el documento a *Andes Docs*:"
    );
    await sendWhatsAppMessage(
      from,
      "📤 Por favor envía el archivo\n\n" +
        "En alguno de los siguientes formatos:\n" +
        "• Word (.docx)\n" +
        "• PDF (.pdf)\n\n" +
        "Requisitos:\n" +
        "• Tamaño máximo: 10MB\n"
    );
  }
}

export const uploadService = new UploadService();
