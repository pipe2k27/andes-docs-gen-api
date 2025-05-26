import axios from "axios";
import dotenv from "dotenv";
import { formatPhoneNumber } from "../utils/phoneFormatter";

dotenv.config();

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export const sendWhatsAppMessage = async (to: string, text: string) => {
  const formattedTo = formatPhoneNumber(to);

  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        // to: "54111522775850",
        to: formattedTo,
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

    console.log(
      "📤 Message send from Andi Bot to:",
      response.data.contacts[0].wa_id
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Error al enviar mensaje:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data || error.message);
  }
};
