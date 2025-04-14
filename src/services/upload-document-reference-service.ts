import { getCompanyByPhone } from "../config/db";
import { sendDocReferenceToAndesDocs } from "../utils/andes-api";

export const registerDocumentInAndesDocs = async (
  from: string,
  documentType: string,
  fileKey: string,
  fileUrl: string,
  fileBuffer: Buffer
) => {
  console.log(`📩 Iniciando registro en Andes Docs para ${from}`);

  try {
    // Obtener la información de la empresa asociada al número de WhatsApp
    const company = getCompanyByPhone(from);
    if (!company) {
      throw new Error(
        "No se encontró la empresa asociada al número de WhatsApp."
      );
    }

    const now = Date.now();
    const fileName = fileKey.replace(".docx", "");

    // Simulación de usuario autenticado (si se tiene info real, usarla)
    const userId = `wa|${from}`; // Se puede usar el número de teléfono como ID
    const createdBy = "Usuario WhatsApp"; // Ajustar si hay datos reales

    console.log(`🏢 Empresa identificada: ${company.companyName}`);

    const docData = {
      companyId: company.companyId,
      companyName: company.companyName,
      documentType: "Word", // Andes Docs usa "Word" en vez de "docx"
      fileName,
      filePath: `wa-generation/${fileKey}`,
      fileUrl,
      createdBy,
      userId,
      creatorPhotoUrl: "", // Se puede obtener si está disponible en la DB
      versionId: `${now}`,
      versionNumber: "1", // Andes Docs usa un string aquí
      date: `${now}`, // Guardar timestamp como string
      size: `${fileBuffer.length}`, // Guardar tamaño como string
      updateDate: `${now}`,
      format: "word", // Andes Docs usa "word" en vez de "docx"
      andesDockerDoc: false, // Mantener en false
      expirationDate: null, // Mantener null a menos que aplique
      documentKind:
        documentType === "reserva"
          ? "Reserva de Servicio"
          : "Autorización de Venta",
    };

    // Enviar referencia del documento a Andes Docs
    await sendDocReferenceToAndesDocs(docData);

    console.log("📂 Documento registrado en Andes Docs:", docData);
  } catch (error) {
    console.error("💥 ERROR en registro Andes Docs:");
    if (error instanceof Error) {
      console.error("- Mensaje:", error.message);
      console.error("- Stack:", error.stack);
    }
    throw error; // Propaga el error para manejarlo arriba
  }
};
