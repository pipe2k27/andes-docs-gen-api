import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { generateAndDownloadWord } from "../utils/generator/wordGeneration";
import { getCompanyByPhone } from "../config/db";
import { s3StoreFile } from "../utils/s3Uploader";
import {
  reserva_questions,
  autorizacion_questions,
} from "../common/whatsapp-questions";
import { registerDocumentInAndesDocs } from "./registerDocumentInAndesDocs";
import { signatureService } from "./signatureService";

type DocumentGenerationState = {
  step: number;
  data: any;
  documentType: string;
  timeout?: NodeJS.Timeout;
};

const documentGenerations: Record<string, DocumentGenerationState> = {};

class DocumentService {
  async initDocumentGeneration(from: string, documentType: string) {
    documentGenerations[from] = {
      step: 0,
      data: {},
      documentType,
    };

    this.startTimeout(from);
    await this.sendNextQuestion(from);
  }

  async handleDocumentGenerationResponse(
    from: string,
    text: string
  ): Promise<boolean> {
    const generation = documentGenerations[from];
    if (!generation) return false;

    const questions =
      generation.documentType === "reserva"
        ? reserva_questions
        : autorizacion_questions;
    const currentStep = generation.step;
    const currentQuestion = questions[currentStep];

    // Validate response
    const validationResult = this.validateResponse(text, currentQuestion);
    if (validationResult !== true) {
      await sendWhatsAppMessage(from, validationResult);
      return true;
    }

    // Store response
    generation.data[currentQuestion.key] = this.formatResponse(
      text,
      currentQuestion
    );

    // Clear timeout and setup new one
    this.clearTimeout(from);
    this.startTimeout(from);

    // Check if we have more questions
    if (currentStep < questions.length - 1) {
      generation.step++;
      await this.sendNextQuestion(from);
      return true;
    }

    // All questions answered - generate document
    await this.generateAndRegisterDocument(from);
    return true;
  }

  private async generateAndRegisterDocument(from: string) {
    const generation = documentGenerations[from];
    if (!generation) return;

    try {
      const company = getCompanyByPhone(from);
      if (!company) throw new Error("Empresa no encontrada");
      if (!company.styles)
        throw new Error("Estilos no definidos para esta empresa");
      if (!company.templates.reserva || !company.templates.autorizacion) {
        throw new Error("Plantillas no definidas para esta empresa");
      }

      const template =
        generation.documentType === "reserva"
          ? company.templates.reserva
          : company.templates.autorizacion;

      if (!template)
        throw new Error(
          `Plantilla para ${generation.documentType} no encontrada`
        );

      const docName =
        generation.data.nombreDocumento ||
        `${generation.documentType}_${new Date().toISOString()}`;

      // Generate Word document
      const fileBuffer = await generateAndDownloadWord(
        template,
        generation.data,
        company.styles
      );

      // Upload to S3
      const fileKey = `${docName}.docx`;
      const fileUrl = await s3StoreFile("wa-generation", fileKey, fileBuffer);

      // Register in Andes Docs
      await registerDocumentInAndesDocs(
        from,
        generation.documentType,
        Date.now().toString(),
        fileKey,
        fileUrl,
        fileBuffer,
        docName
      );

      // Clean up
      delete documentGenerations[from];

      // Ask about signing
      await signatureService.initSignatureFlow(
        from,
        fileKey,
        Date.now().toString(),
        generation.documentType
      );
    } catch (error) {
      console.error("Error generando documento:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado al generar el documento";

      await sendWhatsAppMessage(from, `❌ ${errorMessage}`);
      delete documentGenerations[from];
    }
  }

  // Helper methods...
  private validateResponse(text: string, question: any): string | true {
    const trimmedText = text.trim();

    // Validación básica para respuestas vacías
    if (!trimmedText) {
      return "❌ Por favor, ingresa una respuesta válida.";
    }

    // Validación para opciones con valores predefinidos
    if (question.options) {
      const validOptions = question.options.map((opt: any) => opt.value);
      if (!validOptions.includes(trimmedText)) {
        return `❌ Opción no válida. Por favor elige entre: ${validOptions.join(
          ", "
        )}`;
      }
    }

    // Validación para formatos específicos
    if (question.format === "number") {
      if (isNaN(Number(trimmedText))) {
        return "❌ Por favor, ingresa solo números.";
      }
    }

    if (question.format === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedText)) {
        return "❌ Por favor, ingresa un correo electrónico válido.";
      }
    }

    // Si pasa todas las validaciones
    return true;
  }

  private formatResponse(text: string, question: any): any {
    const trimmedText = text.trim();

    // Formateo para opciones predefinidas
    if (question.options) {
      const selectedOption = question.options.find(
        (opt: any) => opt.value === trimmedText
      );
      return selectedOption?.label || trimmedText;
    }

    // Formateo para números
    if (question.format === "number") {
      return Number(trimmedText);
    }

    // Por defecto, devolver el texto formateado
    return trimmedText;
  }

  private async sendNextQuestion(from: string) {
    const generation = documentGenerations[from];
    const questions =
      generation.documentType === "reserva"
        ? reserva_questions
        : autorizacion_questions;
    const nextQuestion = questions[generation.step];

    let message = nextQuestion.question;
    if (nextQuestion.options) {
      message +=
        "\n\n" +
        nextQuestion.options
          .map((opt) => `${opt.value}. ${opt.label}`)
          .join("\n");
    }

    await sendWhatsAppMessage(from, message);
  }

  private startTimeout(from: string) {
    if (!documentGenerations[from]) return;

    documentGenerations[from].timeout = setTimeout(async () => {
      await sendWhatsAppMessage(
        from,
        "¿Sigues ahí? Por favor responde para continuar."
      );

      // Segundo timeout para finalizar la conversación
      documentGenerations[from].timeout = setTimeout(async () => {
        await sendWhatsAppMessage(
          from,
          "Hemos finalizado la conversación por inactividad. Puedes comenzar de nuevo cuando lo desees."
        );
        delete documentGenerations[from];
      }, 120000); // 2 minutos adicionales
    }, 120000); // 2 minutos iniciales
  }

  private clearTimeout(from: string) {
    if (documentGenerations[from]?.timeout) {
      clearTimeout(documentGenerations[from].timeout);
      delete documentGenerations[from].timeout;
    }
  }
}

export const documentService = new DocumentService();
