import { sendWhatsAppMessage } from "../controllers/whatsappController";
import { documentService } from "./documentService";
import { uploadService } from "./uploadService";

class MainMenuService {
  async handleMainMenu(from: string, text: string) {
    const trimmedText = text.trim();

    // Restart conversation if requested
    if (trimmedText === "0") {
      await this.sendRestartMessage(from);
      return;
    }

    // Validate input is a number
    if (!/^\d+$/.test(trimmedText)) {
      await sendWhatsAppMessage(
        from,
        "⚠️ Por favor escribe solo el *número* de la opción que deseas.\n" +
          "Ejemplo: escribe *1* para generar una Reserva"
      );
      await this.sendOptionsMessage(from);
      return;
    }

    // Handle menu options
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
      default:
        await sendWhatsAppMessage(
          from,
          "❌ Opción inválida. Por favor elige una de las siguientes opciones:"
        );
        await this.sendOptionsMessage(from);
    }
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
      "¿Qué documento necesitas gestionar hoy?\n\n" +
        "1. Generar Reserva\n" +
        "2. Generar Autorización (Beta)\n" +
        "3. Enviar documento a firmar\n\n" +
        "Escribe solo el *número* de la opción que deseas."
    );
  }

  async sendRestartMessage(from: string) {
    await sendWhatsAppMessage(from, "🔄 Has reiniciado el proceso.");
    await this.sendWelcomeMessage(from);
  }
}

export const mainMenuService = new MainMenuService();
