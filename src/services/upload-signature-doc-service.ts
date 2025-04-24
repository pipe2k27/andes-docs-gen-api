import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { restartConversation } from "./conversations-service";
import { Signer } from "../utils/andes-api";

export interface UploadConversationState {
  from: string;
  filePath: string;
  documentId: string;
  documentKind: string;
  step: number;
  signers: Signer[];
}

export const uploadConversations: Record<string, UploadConversationState> = {};

export const handleUploadFlow = async (from: string, messageText: string) => {
  const state = uploadConversations[from];

  await restartConversation(from, messageText);

  if (state.step === 0) {
    await sendWhatsAppMessage(
      from,
      "📎 Por favor, envía el archivo `.docx` que deseas subir y firmar."
    );
    state.step++;
    return;
  }

  return await sendWhatsAppMessage(
    from,
    "⚠️ Esperamos un archivo `.docx`. Por favor, intenta de nuevo."
  );
};
