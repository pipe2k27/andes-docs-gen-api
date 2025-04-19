import { signature_questions } from "../common/whatsapp-questions";
import { Conversations } from "../services/conversations-service";
import { signatureDocument } from "./andes-api";

export async function handleSignatureQuestionsStep(
  phoneNumber: string,
  message: string,
  conversations: Conversations
): Promise<string> {
  const conversation = conversations[phoneNumber];

  // ✅ Aseguramos propiedades necesarias
  conversation.signatureStepIndex ??= 0;
  conversation.data ??= {};
  conversation.firmantes ??= [];
  conversation.currentFirmante ??= 0;
  conversation.expecting ??= "nombre";

  const index = conversation.signatureStepIndex;

  // ✅ Guardamos la respuesta anterior si no es la primera pregunta
  if (index > 0 && index <= signature_questions.length) {
    const previousQuestion = signature_questions[index - 1];
    conversation.data[previousQuestion.key] = message.trim();
  }

  // ✅ ¿Todavía hay preguntas en el array?
  if (index < signature_questions.length) {
    const currentQuestion = signature_questions[index];
    conversation.signatureStepIndex = index + 1;

    return (
      currentQuestion.question +
      (currentQuestion.options ? "\n" + currentQuestion.options.join("\n") : "")
    );
  }

  // ✅ Ya terminamos las preguntas básicas, manejamos firmantes
  const cantidadFirmantesRaw = conversation.data["cantidadFirmantes"];
  const totalFirmantes = parseInt(cantidadFirmantesRaw, 10);

  if (isNaN(totalFirmantes) || totalFirmantes < 1 || totalFirmantes > 10) {
    delete conversations[phoneNumber];
    return "Cantidad de firmantes inválida. Por favor, comenzá de nuevo.";
  }

  const current = conversation.currentFirmante;
  const expecting = conversation.expecting;

  if (expecting === "nombre") {
    conversation.firmantes[current] = {
      name: message.trim(),
      email: "",
    };
    conversation.expecting = "email";
    return `Ahora ingresá el correo electrónico de ${message.trim()}:`;
  }

  if (expecting === "email") {
    conversation.firmantes[current].email = message.trim();
    conversation.currentFirmante++;

    // ✅ Ya terminamos con todos los firmantes
    if (conversation.currentFirmante >= totalFirmantes) {
      const firmantes = conversation.firmantes;
      const documentUrl = conversation.documentUrl;

      if (!documentUrl) {
        delete conversations[phoneNumber];
        return "No se pudo encontrar el documento para enviar a firma. Por favor, intentá nuevamente.";
      }

      await signatureDocument({ documentUrl, firmantes });

      delete conversations[phoneNumber];
      return "El documento ha sido enviado para firma electrónica. ¡Gracias!";
    } else {
      conversation.expecting = "nombre";
      return `Firmante ${
        conversation.currentFirmante + 1
      }:\nPor favor, ingresá el nombre completo.`;
    }
  }

  return "Ocurrió un error inesperado. Por favor, intentá nuevamente.";
}
