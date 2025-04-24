import { signatureService } from "../services/signatureService";
import { documentService } from "./documentService";
import { mainMenuService } from "./mainMenuService";

export async function handleTextMessage(from: string, text: string) {
  const trimmedText = text.trim();

  // Check if in signature flow
  if (await signatureService.handleSignatureResponse(from, trimmedText)) {
    return;
  }

  // Check if in document generation flow
  if (
    await documentService.handleDocumentGenerationResponse(from, trimmedText)
  ) {
    return;
  }

  // Handle main menu options
  await mainMenuService.handleMainMenu(from, trimmedText);
}
