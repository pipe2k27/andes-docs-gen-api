import axios from "axios";
import dotenv from "dotenv";
import { formatPhoneNumber } from "../utils/phoneFormatter";

dotenv.config();

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATS_VERIFY_TOKEN;

export const sendWhatsAppMessage = async (to: string, text: string) => {
  try {
    const formattedTo = formatPhoneNumber(to);

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

    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error?.code === 131030) {
      console.error(
        `❌ Number ${to} not in allowed list. Add it to Meta's dashboard.`
      );
    }
    throw error;
  }
};
