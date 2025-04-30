import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { sendToSignDocumentWithAndesDocs } from "../utils/andes-api";
import { documentService } from "./documentService";

type SignatureState = {
  from: string;
  filePath: string;
  documentId: string;
  documentKind: string;
  signers: any[];
  step: number;
  totalSigners?: number;
  currentSignerIndex?: number;
};

const signatureStates: Record<string, SignatureState> = {};

class SignatureService {
  private readonly MAX_SIGNERS = 10;
  private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async initSignatureFlow(
    from: string,
    filePath: string,
    documentId: string,
    documentKind: string
  ) {
    signatureStates[from] = {
      from,
      filePath,
      documentId,
      documentKind,
      signers: [],
      step: 0,
    };

    await sendWhatsAppMessage(
      from,
      "¿Desea enviar a *firmar* el documento?\n\n1. Sí\n2. No"
    );
  }

  async handleSignatureResponse(from: string, text: string): Promise<boolean> {
    const state = signatureStates[from];
    if (!state) return false;

    const trimmed = text.trim();

    // Step 0: Initial yes/no question
    if (state.step === 0) {
      if (trimmed === "1") {
        state.step = 1;
        await sendWhatsAppMessage(
          from,
          `¿Cuántas personas necesitan firmar este documento? (Máximo ${this.MAX_SIGNERS})`
        );
        return true;
      } else if (trimmed === "2") {
        await this.completeWithoutSignature(from);
        return true;
      }
      return false;
    }

    // Step 1: Get number of signers
    if (state.step === 1) {
      const n = parseInt(trimmed);
      if (isNaN(n) || n <= 0 || n > this.MAX_SIGNERS) {
        await sendWhatsAppMessage(
          from,
          `Por favor, ingrese un número válido entre 1 y ${this.MAX_SIGNERS}.`
        );
        return true;
      }
      state.totalSigners = n;
      state.currentSignerIndex = 0;
      state.step = 2;
      await this.requestSignerName(from, state.currentSignerIndex + 1);
      return true;
    }

    // Step 2: Get signer name
    if (state.step === 2) {
      const idx = state.currentSignerIndex!;
      if (!state.signers[idx]) state.signers[idx] = { name: "", email: "" };
      state.signers[idx].name = trimmed;
      state.step = 3;
      await sendWhatsAppMessage(
        from,
        `Ingrese el *correo electrónico* del firmante ${idx + 1}:\n\n` +
          "Ejemplo: nombre@empresa.com"
      );
      return true;
    }

    // Step 3: Get signer email
    if (state.step === 3) {
      const idx = state.currentSignerIndex!;

      if (!this.isValidEmail(text)) {
        await sendWhatsAppMessage(
          from,
          "⚠️ Formato de email inválido. Por favor ingrese un correo válido:\n\n" +
            "Ejemplo: nombre@empresa.com"
        );
        return true;
      }

      state.signers[idx].email = text.trim().toLowerCase();
      state.currentSignerIndex!++;

      if (state.currentSignerIndex! < state.totalSigners!) {
        state.step = 2;
        await this.requestSignerName(from, state.currentSignerIndex! + 1);
        return true;
      }

      // All signers collected - confirm before sending
      await this.confirmSigners(from);
      return true;
    }

    // Step 4: Confirmation before sending
    if (state.step === 4) {
      if (trimmed === "1") {
        await this.sendForSignature(from);
        return true;
      } else if (trimmed === "2") {
        state.step = 2;
        state.currentSignerIndex = 0;
        await this.requestSignerName(from, 1);
        return true;
      }
      return false;
    }

    return false;
  }

  private isValidEmail(email: string): boolean {
    return this.EMAIL_REGEX.test(email.trim());
  }

  private async requestSignerName(from: string, signerNumber: number) {
    await sendWhatsAppMessage(
      from,
      `Ingrese el *nombre completo* del firmante ${signerNumber}:`
    );
  }

  private async confirmSigners(from: string) {
    const state = signatureStates[from];
    if (!state) return;

    let message = "📝 *Resumen de firmantes:*\n\n";
    state.signers.forEach((signer, index) => {
      message +=
        `Firmante ${index + 1}:\n` +
        `• Nombre: ${signer.name}\n` +
        `• Email: ${signer.email}\n\n`;
    });

    message +=
      "¿Confirmar el envío para firma?\n\n1. Sí, enviar\n2. No, corregir";

    state.step = 4;
    await sendWhatsAppMessage(from, message);
  }

  private async completeWithoutSignature(from: string) {
    await sendWhatsAppMessage(
      from,
      "✅ Proceso completado. El documento ha sido registrado correctamente.\n\n" +
        "Puede visualizarlo en la plataforma de Andes Docs 🏔️"
    );
    delete signatureStates[from];
    documentService.clearDocumentGeneration(from);
  }

  private async sendForSignature(from: string) {
    const state = signatureStates[from];
    if (!state) return;

    try {
      if (!state.filePath || !state.documentId || state.signers.length === 0) {
        throw new Error("Faltan datos para enviar a firma");
      }

      const response = await sendToSignDocumentWithAndesDocs({
        phoneNumber: state.from,
        documentId: state.documentId,
        documentKind:
          state.documentKind === "reserva" ? "Reserva" : "Autorización",
        filePath: state.filePath,
        signers: state.signers,
      });

      // Mensaje inicial de confirmación
      await sendWhatsAppMessage(
        from,
        "✅ *Documento enviado para firma electrónica correctamente*"
      );

      // Enviamos los links de cada firmante en mensajes separados
      if (response?.success && response.data?.data) {
        for (const signerData of response.data.data) {
          const signerIndex = response.data.data.indexOf(signerData);
          const signerName =
            state.signers[signerIndex]?.name || `Firmante ${signerIndex + 1}`;

          await sendWhatsAppMessage(
            from,
            `🔗 Link para ${signerName}:\n${signerData.sign_url}`
          );

          // Pequeña pausa para evitar problemas con WhatsApp
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      // Mensaje final
      await sendWhatsAppMessage(
        from,
        "📩 Los firmantes también recibirán un email con el link para firmar.\n\n" +
          "Puedes verificar el estado en cualquier momento en Andes Docs."
      );
    } catch (error) {
      console.error("Error enviando a firmar:", error);
      await sendWhatsAppMessage(
        from,
        "❌ Error al enviar el documento para firma. Por favor:\n\n" +
          "1. Verifique los datos ingresados\n" +
          "2. Intente nuevamente\n\n" +
          "Si el problema persiste, contacte a soporte."
      );
    } finally {
      delete signatureStates[from];
      documentService.clearDocumentGeneration(from);

      await sendWhatsAppMessage(
        from,
        "🔹 ¿Necesita algo más? Escriba *menu* para ver las opciones disponibles."
      );
    }
  }
}

export const signatureService = new SignatureService();
