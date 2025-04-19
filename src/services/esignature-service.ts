import { sendToSignDocumentWithAndesDocs, Signer } from "../utils/andes-api";
import { conversations } from "./conversations-service";

type SignatureConversation = {
  from: string;
  filePath: string;
  documentId: string;
  documentKind: string;
  signers: Signer[];
  step: number;
  totalSigners?: number;
  currentSignerIndex?: number;
};

export const signatureConversations: Record<string, SignatureConversation> = {};

export const handleSignatureFlow = async (from: string, text: string) => {
  const sigConv = signatureConversations[from];

  // Si aún no existe, espera a que se cree en handleUserResponse
  if (!sigConv) return null;

  if (sigConv.step === 0) {
    if (text === "1") {
      delete conversations[from]; // 🔄 Solo borrar si elige sí
      sigConv.step++;
      return "¿Cuántos *firmantes* serán? (Máximo 10)";
    } else if (text === "2") {
      delete signatureConversations[from];
      return "Perfecto! el proceso ha finalizado, la información ha sido registrada con éxito.\nPuede visualizar el documento en la plataforma de *Andes Docs* 🏔️";
    } else {
      return "Opción no válida. Por favor, responde 1 para Sí o 2 para No.";
    }
  }

  if (sigConv.step === 1) {
    const n = parseInt(text);
    if (isNaN(n) || n <= 0 || n > 10) {
      return "Por favor, ingrese un número válido entre 1 y 10.";
    }
    sigConv.totalSigners = n;
    sigConv.currentSignerIndex = 0;
    sigConv.step++;
    return `Escriba el nombre completo del firmante 1:`;
  }

  if (sigConv.step === 2) {
    const idx = sigConv.currentSignerIndex!;
    if (!sigConv.signers[idx]) sigConv.signers[idx] = { name: "", email: "" };
    sigConv.signers[idx].name = text;
    sigConv.step++;
    return `Escriba el correo electrónico del firmante ${idx + 1}:`;
  }

  if (sigConv.step === 3) {
    const idx = sigConv.currentSignerIndex!;
    sigConv.signers[idx].email = text;
    sigConv.currentSignerIndex!++;
    if (sigConv.currentSignerIndex! < sigConv.totalSigners!) {
      sigConv.step = 2;
      return `Escriba el nombre completo del firmante ${
        sigConv.currentSignerIndex! + 1
      }:`;
    } else {
      console.log("DATA FOR ANDES DOCS ENDPOINT:", {
        phone: sigConv.from,
        documentId: sigConv.documentId,
        documentKind: sigConv.documentKind,
        filePath: sigConv.filePath,
        signers: sigConv.signers,
      });

      //   await sendToSignDocumentWithAndesDocs({
      //     phone: sigConv.from,
      //     filePath: sigConv.filePath,
      //     signers: sigConv.signers,
      //   });

      delete signatureConversations[from];
      return "✅ El documento ha sido enviado para firma electrónica.";
    }
  }

  return null;
};
