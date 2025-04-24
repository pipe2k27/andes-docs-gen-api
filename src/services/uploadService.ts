import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { signatureService } from "./signatureService";

type UploadState = {
  from: string; // Campo requerido
  step: number;
  docName?: string;
};

class UploadService {
  private uploadStates: Record<string, UploadState> = {};

  getState(from: string): UploadState | undefined {
    return this.uploadStates[from];
  }

  clearState(from: string) {
    delete this.uploadStates[from];
  }

  async initUploadFlow(from: string) {
    this.clearState(from);
    this.uploadStates[from] = {
      from,
      step: 0,
    };

    await sendWhatsAppMessage(
      from,
      "📎 Por favor, ingresa el nombre para el documento:\n" +
        "(Ej: 'Contrato Arrendamiento Mayo 2025')"
    );
  }

  async handleUploadResponse(from: string, text: string): Promise<boolean> {
    const state = this.uploadStates[from];
    if (!state) return false;

    if (state.step === 0) {
      const docName = text.trim();

      if (docName.length < 3) {
        await sendWhatsAppMessage(
          from,
          "⚠️ El nombre debe tener al menos 3 caracteres\n" +
            "Por favor, ingrésalo nuevamente:"
        );
        return true;
      }

      state.docName = docName;
      state.step = 1;

      await sendWhatsAppMessage(
        from,
        "📤 Ahora por favor envía el archivo .docx\n\n" +
          "Asegúrate de que:\n" +
          "• Es un documento Word (.docx)\n" +
          "• Tiene menos de 5MB\n"
      );

      return true;
    }

    return false;
  }

  async handleUploadedDocument(from: string, fileName: string, fileId: string) {
    const state = this.uploadStates[from];
    if (!state?.docName) return;

    try {
      // Lógica para manejar el documento...
      await signatureService.initSignatureFlow(
        from,
        "path/to/uploaded/file",
        Date.now().toString(),
        "documento_subido"
      );

      delete this.uploadStates[from];
    } catch (error) {
      console.error("Error manejando documento subido:", error);
      await sendWhatsAppMessage(
        from,
        "❌ Hubo un error al procesar tu documento. Por favor, inténtalo de nuevo."
      );
      delete this.uploadStates[from];
    }
  }
}

export const uploadService = new UploadService();
