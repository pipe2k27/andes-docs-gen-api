import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { sendToSignDocumentWithAndesDocs } from "../utils/andes-api";

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
      "¿Desea enviar a *firmar* el documento generado?\n\n1. Sí\n2. No"
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
          "¿Cuántas personas necesitan firmar este documento? (Máximo 10)"
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
      if (isNaN(n) || n <= 0 || n > 10) {
        await sendWhatsAppMessage(
          from,
          "Por favor, ingrese un número válido entre 1 y 10."
        );
        return true;
      }
      state.totalSigners = n;
      state.currentSignerIndex = 0;
      state.step = 2;
      await sendWhatsAppMessage(
        from,
        `Escriba el nombre completo del firmante 1:`
      );
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
        `Escriba el correo electrónico del firmante ${idx + 1}:`
      );
      return true;
    }

    // Step 3: Get signer email
    if (state.step === 3) {
      const idx = state.currentSignerIndex!;
      state.signers[idx].email = trimmed;
      state.currentSignerIndex!++;

      if (state.currentSignerIndex! < state.totalSigners!) {
        state.step = 2;
        await sendWhatsAppMessage(
          from,
          `Escriba el nombre completo del firmante ${
            state.currentSignerIndex! + 1
          }:`
        );
        return true;
      }

      // All signers collected - send for signature
      await this.sendForSignature(from);
      return true;
    }

    return false;
  }

  private async completeWithoutSignature(from: string) {
    await sendWhatsAppMessage(
      from,
      "Perfecto! el proceso ha finalizado, la información ha sido registrada con éxito.\nPuede visualizar el documento en la plataforma de Andes Docs 🏔️"
    );
    delete signatureStates[from];
  }

  private async sendForSignature(from: string) {
    const state = signatureStates[from];
    try {
      await sendToSignDocumentWithAndesDocs({
        phoneNumber: state.from,
        documentId: state.documentId,
        documentKind:
          state.documentKind === "reserva" ? "Reserva" : "Autorización",
        filePath: state.filePath,
        signers: state.signers,
      });

      await sendWhatsAppMessage(
        from,
        "✅ El documento ha sido enviado para firma electrónica."
      );
    } catch (error) {
      console.error("Error enviando a firmar:", error);
      await sendWhatsAppMessage(
        from,
        "❌ Hubo un error al enviar el documento para firma. Por favor, inténtalo de nuevo."
      );
    } finally {
      delete signatureStates[from];
    }
  }
}

export const signatureService = new SignatureService();
