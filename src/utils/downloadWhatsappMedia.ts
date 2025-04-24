import axios from "axios";
import { s3StoreFile } from "./s3Uploader";

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const WHATSAPP_API_TOKEN = process.env.WHATS_VERIFY_TOKEN;

export const handleDocumentUpload = async (
  mediaId: string,
  fileName: string
): Promise<{ fileUrl: string; fileKey: string; fileBuffer: Buffer }> => {
  try {
    const mediaUrlRes = await axios.get(`${WHATSAPP_API_URL}/${mediaId}`, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
      },
    });

    const fileUrl = mediaUrlRes.data.url;

    // Paso 2: Descargar el archivo
    const fileRes = await axios.get(fileUrl, {
      responseType: "arraybuffer",
      headers: { Authorization: `Bearer ${WHATSAPP_API_TOKEN}` },
    });

    const fileBuffer = fileRes.data;
    const fileKey = `${Date.now()}-${fileName}`;

    // Paso 3: Subir a S3
    const s3Url = await s3StoreFile("wa-generation", fileKey, fileBuffer);

    return { fileUrl: s3Url, fileKey, fileBuffer };
  } catch (error) {
    console.error("Error al descargar media de WhatsApp:", error);
    throw new Error("No se pudo descargar el archivo desde WhatsApp.");
  }
};
