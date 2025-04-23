import { s3StoreFile } from "../utils/s3Uploader";
import {
  autorizacion_questions,
  Question,
  reserva_questions,
} from "../common/whatsapp-questions";
import { generateAndDownloadWord } from "../utils/generator/wordGeneration";
import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { getCompanyByPhone } from "../config/db";
import { registerDocumentInAndesDocs } from "./upload-document-reference-service";
import {
  handleSignatureFlow,
  signatureConversations,
} from "./esignature-service";
import { normalizeText } from "../utils/generator/normalizeText";
import NumeroALetras from "../utils/generator/numbersToLetters";
import {
  formatText,
  validateTextFormat,
} from "../utils/generator/validationsAndFormatting";

const validOptions = ["reserva", "autorizacion"];

export const conversations: Record<
  string,
  {
    step: number;
    data: any;
    documentType?: string;
    timeout?: NodeJS.Timeout;
  }
> = {};

const startTimeout = (from: string) => {
  if (!conversations[from]) return;

  conversations[from].timeout = setTimeout(async () => {
    console.log(
      `⌛ Usuario ${from} no ha respondido en 2 minuto. Enviando recordatorio...`
    );
    await sendWhatsAppMessage(from, "¿Estás ahí todavía?");

    // Segundo timeout: Si el usuario sigue sin responder en otros 2 minutos, finalizar conversación
    conversations[from].timeout = setTimeout(async () => {
      console.log(
        `🚫 Usuario ${from} no respondió en 4 minutos. Terminando conversación.`
      );
      await sendWhatsAppMessage(
        from,
        "Hemos finalizado la conversación. Para comenzar de nuevo, escribe 'Reserva' o 'Autorización'."
      );
      delete conversations[from]; // Finalizar conversación
    }, 120000); // Esperar otros 2 minutos
  }, 120000); // Esperar 2 minutos antes de preguntar si sigue ahí
};

export const handleUserResponse = async (from: string, messageText: string) => {
  if (signatureConversations[from]) {
    return await handleSignatureFlow(from, messageText);
  }

  let text = messageText.trim();
  console.log(`🔍 Texto recibido: ${text}`);

  let normalizedText = normalizeText(text);

  // Reiniciar el proceso si el usuario envía "0"
  if (text === "0") {
    delete conversations[from];
    await sendWhatsAppMessage(from, "Reiniciaste el proceso.");
    await sendWhatsAppMessage(
      from,
      "Por favor, sigue las instrucciones para continuar."
    );
    return "🔄 Has reiniciado el proceso. ¿Qué documento necesita generar hoy?\n 1. Reserva\n 2. Autorización";
  }

  // Si no hay una conversación activa y el mensaje no es una opción válida
  if (
    !conversations[from] &&
    !validOptions.includes(normalizedText) &&
    text !== "1" &&
    text !== "2"
  ) {
    // Enviar mensaje de bienvenida solo si no hay una conversación activa
    await sendWhatsAppMessage(
      from,
      "*¡Hola! Gracias por trabajar con Andes Docs🏔️⚡!* ¿Qué documento necesita generar hoy?"
    );
    await sendWhatsAppMessage(
      from,
      "Por favor, elegí una opción para continuar."
    );
    return "1. Reserva\n2. Autorización\n\n0. Para reiniciar el proceso";
  }

  // Si no hay una conversación activa y el usuario elige una opción (1 o 2)
  if (!conversations[from] && (text === "1" || text === "2")) {
    normalizedText = text === "1" ? "reserva" : "autorizacion";
  }

  // Si no hay una conversación activa y el usuario elige una opción válida
  if (!conversations[from] && validOptions.includes(normalizedText)) {
    conversations[from] = { step: 0, data: {}, documentType: normalizedText };
    startTimeout(from);
    const questions =
      normalizedText === "reserva" ? reserva_questions : autorizacion_questions;
    return formatQuestionWithOptions(questions[0]);
  }

  // Si hay una conversación activa, continuar con el flujo
  const userConversation = conversations[from];
  const currentStep = userConversation.step;
  const questions =
    userConversation.documentType === "reserva"
      ? reserva_questions
      : autorizacion_questions;
  const currentQuestion = questions[currentStep];

  // Validar si la pregunta tiene opciones y si la respuesta es válida
  if (currentQuestion.options) {
    const validOptionValues = currentQuestion.options
      .map((opt) => opt.value)
      .concat(["__________"]); // Asegúrate de usar 10 guiones

    if (!validOptionValues.includes(text)) {
      return `❌ Opción no válida...`;
    }

    if (!validateTextFormat(text, currentQuestion)) {
      return `❌ Opción no válida...`;
    }

    if (text === "9") {
      userConversation.data[currentQuestion.key] = "__________"; // Guardamos 10 guiones
    } else {
      const selectedOption = currentQuestion.options.find(
        (opt) => opt.value === text
      );
      userConversation.data[currentQuestion.key] =
        selectedOption?.label || text;
    }
  } else {
    userConversation.data[currentQuestion.key] = formatText(
      text,
      currentQuestion
    );
  }

  clearTimeout(userConversation.timeout);
  delete userConversation.timeout;

  if (currentStep < questions.length - 1) {
    userConversation.step++;
    startTimeout(from);
    return formatQuestionWithOptions(questions[userConversation.step]);
  } else {
    console.log(
      `✅ Formulario completado por: ${from}\n`,
      JSON.stringify(userConversation.data, null, 2)
    );
    try {
      const company = getCompanyByPhone(from);
      if (!company)
        throw new Error(
          "No se encontró la empresa asociada al número de WhatsApp."
        );
      if (!company.styles)
        throw new Error("No se encontraron estilos definidos para la empresa.");
      const template =
        userConversation.documentType === "reserva"
          ? company.templates.reserva
          : company.templates.autorizacion;

      if (!template)
        throw new Error(
          `No se encontró un template para ${userConversation.documentType}`
        );

      // const formattedData = addTextToAmounts(userConversation.data);

      const fileBuffer = await generateAndDownloadWord(
        template,
        userConversation.data,
        company.styles
      );
      const now = Date.now();
      const fileKey = `${userConversation.data.nombreDocumento}.docx`;
      const fileUrl = await s3StoreFile("wa-generation", fileKey, fileBuffer);
      await sendWhatsAppMessage(
        from,
        `✅ Tu documento *${userConversation.data.nombreDocumento}* ha sido generado con éxito. Puedes descargarlo aquí: ${fileUrl}`
      );

      await sendWhatsAppMessage(
        from,
        "¿Desea enviar a *firmar* el documento generado?"
      );
      await sendWhatsAppMessage(from, "1. Sí\n2. No");

      if (!userConversation.documentType) {
        throw new Error("El tipo de documento es indefinido.");
      }

      console.log("📄 Preparando para registrar documento en Andes Docs...");

      const userDocName = userConversation.data.nombreDocumento?.trim();
      const docName =
        userDocName || `WA-${now}-${userConversation.documentType}`;

      const date = Date.now();

      await registerDocumentInAndesDocs(
        from,
        userConversation.documentType,
        String(date),
        fileKey,
        fileUrl,
        fileBuffer,
        docName
      );
      console.log("✅ Documento registrado exitosamente en Andes Docs");

      signatureConversations[from] = {
        from,
        filePath: fileKey, // o la URL si eso requiere el endpoint
        documentId: String(date),
        documentKind: userConversation.documentType,
        signers: [],
        step: 0,
      };

      return;
    } catch (error) {
      console.error("❌ Error al generar documento:", error);
      return "Hubo un error al generar tu documento. Inténtalo nuevamente más tarde.";
    }
  }
};

// Función para formatear preguntas con opciones
const formatQuestionWithOptions = (question: Question) => {
  let options = question.options ? [...question.options] : [];

  // Verifica si la pregunta ya tiene opciones numéricas
  const hasNumericOptions = options.some((opt) => /^\d+$/.test(opt.value));

  // Detecta si la pregunta solicita solo números explícitamente
  const asksForNumbersOnly = question.question.includes("Escriba sólo números");

  // Formatear las opciones en texto
  const optionsText = options
    .map((opt) => `${opt.value}. ${opt.label}`)
    .join("\n");

  // Agregar opciones adicionales según corresponda
  let additionalOptions = "\n0. Para reiniciar el proceso.";

  // No agregar la opción 9 si la pregunta ya tiene números o si pide solo números
  if (!hasNumericOptions && !asksForNumbersOnly) {
    additionalOptions = "\n9. Aún no tengo la respuesta" + additionalOptions;
  }

  return `${question.question}\n${optionsText}${additionalOptions}`;
};
