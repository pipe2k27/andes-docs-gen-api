// main conversation service
import { s3StoreFile } from "../utils/s3Uploader";
import {
  autorizacion_questions,
  reserva_questions,
  signature_questions,
  Question,
} from "../common/whatsapp-questions";
import { generateAndDownloadWord } from "../utils/generator/wordGeneration";
import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { getCompanyByPhone } from "../config/db";
import { normalizeText } from "../utils/normalizeText";
import { registerDocumentInAndesDocs } from "./upload-document-reference-service";
import { handleSignatureQuestionsStep } from "../utils/signature_section";

export type Conversations = typeof conversations;

const conversations: Record<
  string,
  {
    step: number;
    data: any;
    documentType?: string;
    timeout?: NodeJS.Timeout;
    signatureStep?: number;
    signatureStepIndex?: number;
    documentUrl?: string;
    firmantes?: { name: string; email: string }[];
    currentFirmante?: number;
    expecting?: "nombre" | "email";
  }
> = {};

const startTimeout = (from: string) => {
  if (!conversations[from]) return;

  conversations[from].timeout = setTimeout(async () => {
    console.log(`⌛ Usuario ${from} no ha respondido en 2 minutos.`);
    await sendWhatsAppMessage(from, "¿Estás ahí todavía?");

    conversations[from].timeout = setTimeout(async () => {
      console.log(
        `🚫 Usuario ${from} no respondió en 4 minutos. Terminando conversación.`
      );
      await sendWhatsAppMessage(
        from,
        "Hemos finalizado la conversación. Para comenzar de nuevo, escribe 'Reserva' o 'Autorización'."
      );
      delete conversations[from];
    }, 120000);
  }, 120000);
};

export const handleUserResponse = async (from: string, messageText: string) => {
  let text = messageText.trim();
  const normalizedText = normalizeText(text);
  const validOptions = ["reserva", "autorizacion"];

  if (text === "0") {
    delete conversations[from];
    await sendWhatsAppMessage(from, "Reiniciaste el proceso.");
    await sendWhatsAppMessage(from, "¿Qué documento necesitas generar hoy?");
    return "1. Reserva\n2. Autorización";
  }

  const userConversation = conversations[from];

  if (
    userConversation?.step === undefined &&
    userConversation?.signatureStep === 0
  ) {
    if (text === "1") {
      conversations[from] = {
        ...userConversation,
        signatureStep: 1,
        signatureStepIndex: 0,
        documentUrl: await s3StoreFile(
          "wa-generation",
          `${userConversation.data.nombreDocumento}.docx`,
          Buffer.from("")
        ),
      };
      return optionsForSignatureSection(signature_questions[0]);
    } else {
      delete conversations[from];
      return "Perfecto. El proceso ha finalizado ✅";
    }
  }

  if (
    !userConversation &&
    !validOptions.includes(normalizedText) &&
    text !== "1" &&
    text !== "2"
  ) {
    await sendWhatsAppMessage(
      from,
      "*¡Hola! Gracias por trabajar con Andes Docs⚡!* ¿Qué documento necesita generar hoy?"
    );
    await sendWhatsAppMessage(
      from,
      "*Elegí una de las siguientes opciones para comenzar"
    );
    return "1. Reserva\n2. Autorización\n\n0. Para reiniciar el proceso";
  }

  if (!userConversation && (text === "1" || text === "2")) {
    conversations[from] = {
      step: 0,
      data: {},
      documentType: text === "1" ? "reserva" : "autorizacion",
    };
    startTimeout(from);
    return formatQuestionWithOptions(
      text === "1" ? reserva_questions[0] : autorizacion_questions[0]
    );
  }

  if (
    userConversation.signatureStep !== undefined &&
    userConversation.signatureStep >= 1
  ) {
    const response = await handleSignatureQuestionsStep(
      from,
      text,
      conversations
    );
    return response;
  }

  const currentStep = userConversation.step;
  const questions =
    userConversation.documentType === "reserva"
      ? reserva_questions
      : autorizacion_questions;
  const currentQuestion = questions[currentStep];

  if (currentQuestion.options) {
    const validOptionValues = currentQuestion.options
      .map((opt) => opt.value)
      .concat(["__________"]);
    if (!validOptionValues.includes(text)) {
      return `❌ Opción no válida...`;
    }
    if (text === "9") {
      userConversation.data[currentQuestion.key] = "__________";
    } else {
      const selectedOption = currentQuestion.options.find(
        (opt) => opt.value === text
      );
      userConversation.data[currentQuestion.key] =
        selectedOption?.label || text;
    }
  } else {
    userConversation.data[currentQuestion.key] = text;
  }

  clearTimeout(userConversation.timeout);
  delete userConversation.timeout;

  if (currentStep < questions.length - 1) {
    userConversation.step++;
    startTimeout(from);
    return formatQuestionWithOptions(questions[userConversation.step]);
  }

  try {
    const company = getCompanyByPhone(from);
    if (!company || !company.styles)
      throw new Error("Empresa o estilos no encontrados");

    const template =
      userConversation.documentType === "reserva"
        ? company.templates.reserva
        : company.templates.autorizacion;

    const fileBuffer = await generateAndDownloadWord(
      template,
      userConversation.data,
      company.styles
    );

    const fileKey = `${userConversation.data.nombreDocumento}.docx`;
    const fileUrl = await s3StoreFile("wa-generation", fileKey, fileBuffer);

    await sendWhatsAppMessage(
      from,
      `✅ Tu documento ${userConversation.data.nombreDocumento} ha sido generado con éxito. Puedes descargarlo aquí: ${fileUrl}`
    );

    const type = userConversation.data.documentType;

    if (!type || typeof type !== "string") {
      delete conversations[from];
      return "No se pudo encontrar el nombre del documento. Por favor, comenzá de nuevo.";
    }

    await registerDocumentInAndesDocs(
      from,
      type,
      fileKey,
      fileUrl,
      fileBuffer,
      userConversation.data.nombreDocumento
    );

    userConversation.signatureStep = 0;
    userConversation.signatureStepIndex = 0;
    return "¿Desea enviar este documento a firma electrónica?\n1. Sí\n2. No";
  } catch (error) {
    console.error("❌ Error al generar documento:", error);
    return "Hubo un error al generar tu documento. Inténtalo nuevamente más tarde.";
  }
};

const formatQuestionWithOptions = (question: Question) => {
  const optionsText =
    question.options?.map((opt) => `${opt.value}. ${opt.label}`).join("\n") ||
    "";
  const additionalOptions = question.options
    ? "\n9. Aún no tengo la respuesta\n0. Para reiniciar el proceso."
    : "\n0. Para reiniciar el proceso.";
  return `${question.question}${
    optionsText ? "\n" + optionsText : ""
  }${additionalOptions}`;
};

const optionsForSignatureSection = (question: Question) => {
  const optionsText =
    question.options?.map((opt) => `${opt.value}. ${opt.label}`).join("\n") ||
    "";
  return `${question.question}${optionsText ? "\n" + optionsText : ""}`;
};
