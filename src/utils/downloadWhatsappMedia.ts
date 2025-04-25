import axios from "axios";
import { s3StoreFile } from "./s3Uploader";

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const WHATSAPP_API_TOKEN = process.env.WHATS_VERIFY_TOKEN;

export const handleDocumentUpload = async (
  mediaId: string,
  fileName: string
): Promise<{ fileUrl: string; fileKey: string; fileBuffer: Buffer }> => {
  try {
    // 1. Obtener URL del media
    const mediaUrlRes = await axios.get(`${WHATSAPP_API_URL}/${mediaId}`, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
      },
      timeout: 10000, // 10 segundos timeout
    });

    if (!mediaUrlRes.data?.url) {
      throw new Error("No se pudo obtener URL del documento");
    }

    // 2. Descargar el archivo con manejo de errores mejorado
    const fileRes = await axios.get(mediaUrlRes.data.url, {
      responseType: "arraybuffer",
      headers: {
        Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
      },
      timeout: 15000,
      validateStatus: (status) => status >= 200 && status < 500,
    });

    if (fileRes.status !== 200) {
      throw new Error(`Error ${fileRes.status} al descargar archivo`);
    }

    // 3. Validar tipo de archivo
    if (!fileName.toLowerCase().endsWith(".docx")) {
      throw new Error("Solo se permiten archivos .docx");
    }

    // 4. Subir a S3
    const fileKey = `uploads/${fileName}.docx`;
    const fileBuffer = Buffer.from(fileRes.data);

    const s3Url = await s3StoreFile("wa-generation", fileKey, fileBuffer);

    return {
      fileUrl: s3Url,
      fileKey,
      fileBuffer,
    };
  } catch (error) {
    console.error("Error en handleDocumentUpload:", error);

    let errorMessage = "Error al procesar el documento";
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        errorMessage =
          "El documento ya no está disponible en WhatsApp. Por favor, envíalo nuevamente.";
      } else if (error.code === "ECONNABORTED") {
        errorMessage =
          "Tiempo de espera agotado. Por favor, intenta enviar el documento nuevamente.";
      }
    }

    throw new Error(errorMessage);
  }
};
