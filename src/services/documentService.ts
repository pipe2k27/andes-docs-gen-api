import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { generateAndDownloadWord } from "../utils/generator/wordGeneration";
import { getCompanyByPhone } from "../config/db";
import { s3StoreFile } from "../utils/s3Uploader";
import {
  reserva_questions,
  autorizacion_questions,
  Question,
} from "../common/whatsapp-questions";
import { registerDocumentInAndesDocs } from "./registerDocumentInAndesDocs";
import { signatureService } from "./signatureService";
import NumeroALetras from "../utils/generator/numbersToLetters";

type DocumentGenerationState = {
  step: number;
  data: Record<string, any>;
  documentType: string;
  timeout?: NodeJS.Timeout;
};

class DocumentService {
  private documentGenerations: Record<string, DocumentGenerationState> = {};

  public clearDocumentGeneration(from: string) {
    this.clearTimeout(from);
    delete this.documentGenerations[from];
  }

  async initDocumentGeneration(from: string, documentType: string) {
    this.clearDocumentGeneration(from); // Limpiar estado previo

    this.documentGenerations[from] = {
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
    const generation = this.documentGenerations[from];
    if (!generation) return false;

    if (/^cancelar$/i.test(text.trim())) {
      this.clearDocumentGeneration(from);
      await sendWhatsAppMessage(
        from,
        "❌ Generación de documento cancelada. Escribe *menu* para iniciar de nuevo."
      );
      return true;
    }

    const questions = this.getQuestionsForType(generation.documentType);
    const currentQuestion = questions[generation.step];

    // Validación mejorada
    const validation = this.validateResponse(text, currentQuestion);
    if (validation !== true) {
      await sendWhatsAppMessage(from, validation);
      return true;
    }

    // Almacenamiento seguro de la respuesta
    generation.data[currentQuestion.key] = this.formatResponse(
      text,
      currentQuestion
    );
    this.clearTimeout(from);

    // Avanzar o finalizar
    if (generation.step < questions.length - 1) {
      generation.step++;
      this.startTimeout(from);
      await this.sendNextQuestion(from);
    } else {
      await this.finalizeDocumentGeneration(from);
    }

    return true;
  }

  private async finalizeDocumentGeneration(from: string) {
    const generation = this.documentGenerations[from];
    if (!generation) return;

    try {
      const company = getCompanyByPhone(from);
      if (!company) throw new Error("⚠️ Empresa no registrada");

      // Validación completa de recursos
      if (!company.styles) throw new Error("❌ Estilos no configurados");
      const template = this.getDocumentTemplate(
        company,
        generation.documentType
      );

      // Generación del documento
      const docName =
        generation.data.nombreDocumento ||
        `${generation.documentType}_${new Date().toISOString()}`;

      const fileBuffer = await generateAndDownloadWord(
        template,
        generation.data,
        company.styles
      );

      // Subida a S3
      const fileKey = `${docName}.docx`;
      const bucket = getBucketByEnv();

      const fileUrl = await s3StoreFile(bucket, fileKey, fileBuffer);

      // Registro en Andes Docs
      await registerDocumentInAndesDocs(
        from,
        generation.documentType,
        Date.now().toString(),
        fileKey,
        fileUrl,
        fileBuffer,
        docName,
        "docx"
      );

      // Send success message with document URL
      await sendWhatsAppMessage(
        from,
        `✅ El documento se generó y subió a Andes Docs correctamente!\n\n` +
          `Podes descargarlo, editarlo o simplemente verlo, también podes trabajar con él en la plataforma oficial.\n\n` +
          `Te comparto el link: ${fileUrl}`
      );

      // Iniciar flujo de firma (sin limpiar aún el estado)
      await signatureService.initSignatureFlow(
        from,
        fileKey,
        Date.now().toString(),
        generation.documentType
      );
    } catch (error) {
      console.error("Error en generación de documento:", error);
      await sendWhatsAppMessage(
        from,
        error instanceof Error ? error.message : "❌ Error al generar documento"
      );
      this.clearDocumentGeneration(from);
    }
  }

  // Helper methods
  private getQuestionsForType(documentType: string) {
    return documentType === "reserva"
      ? reserva_questions
      : autorizacion_questions;
  }

  private getDocumentTemplate(company: any, documentType: string) {
    const template =
      documentType === "reserva"
        ? company.templates.reserva
        : company.templates.autorizacion;

    if (!template)
      throw new Error(`Plantilla para ${documentType} no configurada`);
    return template;
  }

  private validateResponse(text: string, question: Question): string | true {
    const trimmedText = text.trim();

    // Special handling for the document name question
    if (question.key === "nombreDocumento") {
      if (trimmedText === "9") {
        return "❌ Por favor ingresa un nombre descriptivo para el documento (Ej: Reserva Casa Caballito, Autorización Depto CABA)";
      }
      if (trimmedText.length === 0) {
        return "❌ El nombre del documento no puede estar vacío";
      }
      return true;
    }

    // Original validation for other questions
    if (!question.options && trimmedText === "9") return true;

    if (question.format?.includes("number")) {
      if (!/^\d+$/.test(trimmedText)) {
        return "🔢 Solo se permiten números enteros (ej: 150000)\nEscribe 9 si no tienes el dato";
      }
    }

    if (
      question.options &&
      !question.options.some((opt) => opt.value === trimmedText)
    ) {
      const optionsText = question.options
        .map((opt) => `${opt.value}. ${opt.label}`)
        .join("\n");
      return `❌ Escribe solo el número de la opción:\n${optionsText}`;
    }

    return true;
  }

  private formatResponse(text: string, question: Question): any {
    const trimmedText = text.trim();

    if (trimmedText === "9") return "__________";
    if (question.options)
      return (
        question.options.find((opt) => opt.value === trimmedText)?.label || text
      );
    if (question.format === "number") return Number(trimmedText);
    if (question.format === "numberAndLetters") {
      const number = Number(trimmedText);
      return `${number} (${NumeroALetras(number).toUpperCase()})`;
    }

    return trimmedText;
  }

  private async sendNextQuestion(from: string) {
    const generation = this.documentGenerations[from];
    if (!generation) return;

    const questions = this.getQuestionsForType(generation.documentType);
    const question = questions[generation.step];

    let message = question.question;

    // Special handling for document name question
    if (question.key === "nombreDocumento") {
      message +=
        "\n\nPor favor ingresa un nombre descriptivo para el documento";
    }
    // Original handling for other questions
    else if (!question.options) {
      message += "\n\nEscribe *9* si no tienes esta información";
    } else {
      message +=
        "\n\n" +
        question.options.map((opt) => `${opt.value}. ${opt.label}`).join("\n");
    }

    await sendWhatsAppMessage(from, message);
  }

  private startTimeout(from: string) {
    this.clearTimeout(from);

    const generation = this.documentGenerations[from];
    if (!generation) return;

    generation.timeout = setTimeout(async () => {
      if (!this.documentGenerations[from]) return;

      await sendWhatsAppMessage(
        from,
        "⏳ ¿Sigues ahí? Responde para continuar..."
      );

      generation.timeout = setTimeout(async () => {
        await sendWhatsAppMessage(
          from,
          "⌛️ Conversación finalizada por inactividad"
        );
        this.clearDocumentGeneration(from);
      }, 120000); // 2 minutos adicionales
    }, 120000); // 2 minutos iniciales
  }

  private clearTimeout(from: string) {
    const generation = this.documentGenerations[from];
    if (generation?.timeout) {
      clearTimeout(generation.timeout);
      delete generation.timeout;
    }
  }
}

export const documentService = new DocumentService();
