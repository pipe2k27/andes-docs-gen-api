import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { signatureService } from "./signatureService";

type UploadState = {
  from: string;
  step: number;
  docName?: string;
};

const uploadStates: Record<string, UploadState> = {};

class UploadService {
  async initUploadFlow(from: string) {
    uploadStates[from] = { from, step: 0 };
    await sendWhatsAppMessage(
      from,
      "Por favor, ingresa el nombre con el que deseas guardar este documento:"
    );
  }

  async handleUploadResponse(from: string, text: string): Promise<boolean> {
    const state = uploadStates[from];
    if (!state) return false;

    if (state.step === 0) {
      state.docName = text.trim();
      state.step = 1;
      await sendWhatsAppMessage(
        from,
        "Ahora por favor envía el archivo .docx que deseas subir"
      );
      return true;
    }

    return false;
  }

  async handleUploadedDocument(from: string, fileName: string, fileId: string) {
    const state = uploadStates[from];
    if (!state || !state.docName) return;

    try {
      // Aquí iría la lógica para manejar el documento subido
      // Similar a handleDocumentMessage pero usando el nombre proporcionado

      // Después de manejar el documento, preguntar por firma
      await signatureService.initSignatureFlow(
        from,
        "path/to/uploaded/file",
        Date.now().toString(),
        "documento_subido"
      );

      delete uploadStates[from];
    } catch (error) {
      console.error("Error manejando documento subido:", error);
      await sendWhatsAppMessage(
        from,
        "❌ Hubo un error al procesar tu documento. Por favor, inténtalo de nuevo."
      );
      delete uploadStates[from];
    }
  }
}

export const uploadService = new UploadService();
