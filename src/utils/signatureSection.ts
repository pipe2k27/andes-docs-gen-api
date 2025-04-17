// services/signatureSection.ts
import { signature_questions } from "../common/whatsapp-questions";
import { signatureDocument } from "./andes-api";

export const handleSignatureStep = async (
  from: string,
  text: string,
  conversation: any
) => {
  const step = conversation.signatureStep ?? 0;
  const question = signature_questions[step];

  // Guardar respuesta
  if (question.type === "dynamicGroup") {
    const groupData = conversation.signatureData?.[question.key] || [];
    const groupSize =
      parseInt(conversation.signatureData?.[question.groupSizeKey]) || 0;

    // lógica para recolectar los datos de cada firmante
    // ...
  } else {
    conversation.signatureData = {
      ...conversation.signatureData,
      [question.key]: text,
    };
  }

  if (step < signature_questions.length - 1) {
    conversation.signatureStep = step + 1;
    return question.question; // o usa tu función de formateo si la necesitas
  } else {
    // enviar a firmar
    const result = await signatureDocument({
      phone: from,
      ...conversation.signatureData,
    });

    delete conversation.signatureStep;
    delete conversation.signatureData;

    return result.success
      ? "✅ El documento ha sido enviado a firma electrónica."
      : "❌ Hubo un error al enviar el documento a firma.";
  }
};
