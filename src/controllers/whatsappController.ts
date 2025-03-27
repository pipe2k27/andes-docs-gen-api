import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const WHATSAPP_API_URL = "https://graph.facebook.com/v22.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATS_VERIFY_TOKEN;

export const sendWhatsAppMessage = async (to: string, text: string) => {
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );

    console.log("📤 Mensaje enviado:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error al enviar mensaje:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data || error.message);
  }
};

export const sendWhatsAppVideo = async (to: string, videoUrl: string) => {
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: "54111522775850",
        type: "video",
        video: { link: videoUrl },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );

    console.log("📤 Imagen enviada:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error al enviar imagen:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data || error.message);
  }
};
