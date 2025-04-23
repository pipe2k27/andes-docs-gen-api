import axios from "axios";

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const WHATSAPP_API_TOKEN = process.env.WHATS_VERIFY_TOKEN;

export const downloadWhatsAppMedia = async (
  mediaId: string
): Promise<Buffer> => {
  try {
    const mediaUrlRes = await axios.get(`${WHATSAPP_API_URL}/${mediaId}`, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
      },
    });

    const mediaUrl = mediaUrlRes.data.url;
    const mediaRes = await axios.get(mediaUrl, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
      },
      responseType: "arraybuffer",
    });

    return Buffer.from(mediaRes.data);
  } catch (error) {
    console.error("Error al descargar media de WhatsApp:", error);
    throw new Error("No se pudo descargar el archivo desde WhatsApp.");
  }
};
