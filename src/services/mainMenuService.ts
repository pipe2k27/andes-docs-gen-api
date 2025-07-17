import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { documentService } from "./documentService";
import { uploadService } from "./uploadService";

class MainMenuService {
  private inMenuSelection: Set<string> = new Set();

  async handleMainMenu(from: string, text: string) {
    const trimmedText = text.trim().toLowerCase();

    // Si es el primer mensaje o un saludo
    if (
      !this.inMenuSelection.has(from) ||
      ["hola", "hi", "buenas", "hello"].includes(trimmedText)
    ) {
      this.inMenuSelection.add(from);
      await this.sendWelcomeMessage(from);
      return;
    }

    // Reiniciar conversación si se solicita
    if (trimmedText === "0") {
      await this.sendRestartMessage(from);
      return;
    }

    // Validar solo después de haber mostrado las opciones
    if (!/^[1-3]$/.test(trimmedText)) {
      await sendWhatsAppMessage(
        from,
        "❌ Opción no válida. Por favor responde con el *número* de una de estas opciones:"
      );
      await this.sendOptionsMessage(from);
      return;
    }

    // Manejar opciones válidas
    switch (trimmedText) {
      case "1":
        await documentService.initDocumentGeneration(from, "reserva");
        break;
      case "2":
        await documentService.initDocumentGeneration(from, "autorizacion");
        break;
      case "3":
        await uploadService.initUploadFlow(from);
        break;
    }

    // Salir del modo selección de menú
    this.inMenuSelection.delete(from);
  }

  async sendWelcomeMessage(from: string) {
    await sendWhatsAppMessage(from, "*¡Hola! Mi nombre es Andy 🤖*");
    await sendWhatsAppMessage(
      from,
      "*Gracias por trabajar con Andes Docs 🏔️⚡*"
    );
    await this.sendOptionsMessage(from);
  }

  async sendOptionsMessage(from: string) {
    await sendWhatsAppMessage(
      from,
      "¿Con qué te puedo ayudar hoy?\n\n" +
        "1. Generar Reserva\n" +
        "2. Generar Autorización\n" +
        "3. Enviar documento a firmar\n\n" +
        "Escribe solo el *número* de la opción (ej: 1)"
    );

    await sendWhatsAppMessage(
      from,
      "Escribe *cancelar* en cualquier momento del proceso para empezar de nuevo."
    );
  }

  async sendRestartMessage(from: string) {
    await sendWhatsAppMessage(from, "🔄 Reiniciando el menú principal...");
    await this.sendWelcomeMessage(from);
  }
}

export const mainMenuService = new MainMenuService();
