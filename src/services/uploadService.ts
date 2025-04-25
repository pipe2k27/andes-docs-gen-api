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
      "📤 Por favor envía el archivo .docx\n\n" +
        "Asegúrate de que:\n" +
        "• Es un documento Word (.docx)\n" +
        "• Tiene menos de 5MB\n"
    );
  }
}

export const uploadService = new UploadService();
