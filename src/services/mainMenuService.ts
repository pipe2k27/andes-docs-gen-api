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
        await this.sendWelcomeMessage(from);
    }
  }

  async sendWelcomeMessage(from: string) {
    await sendWhatsAppMessage(from, "*¡Hola! Mi nombre es Andy 🤖*");
    await sendWhatsAppMessage(
      from,
      "*Gracias por trabajar con Andes Docs 🏔️⚡*"
    );
    await sendWhatsAppMessage(
      from,
      "¿Qué documento necesitas gestionar hoy?\n\n1. Generar Reserva\n2. Generar Autorización (Beta)\n3. Enviar documento a firmar\n"
    );
  }

  async sendRestartMessage(from: string) {
    await sendWhatsAppMessage(from, "🔄 Has reiniciado el proceso.");
    await this.sendWelcomeMessage(from);
  }
}

export const mainMenuService = new MainMenuService();
