import axios from "axios";
import dotenv from "dotenv";
import { formatPhoneNumber } from "../utils/phoneFormatter";

dotenv.config();

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATS_VERIFY_TOKEN;

// controllers/whatsappController.ts
export const sendWhatsAppMessage = async (to: string, text: string) => {
  try {
    const formattedTo = formatPhoneNumber(to);

    // Meta requires numbers without '+' prefix in the API call
    const apiReadyNumber = formattedTo.startsWith("+")
      ? formattedTo.substring(1)
      : formattedTo;

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: apiReadyNumber,
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
    const errorData = error.response?.data?.error || {};
    console.error("WhatsApp API Error:", {
      code: errorData.code,
      message: errorData.message,
      details: errorData.error_data?.details,
    });

    if (errorData.code === 131030) {
      console.error(`ℹ️ Please add ${to} to your allowed list at:
      https://business.facebook.com/settings/whatsapp-business/account`);
    }
    throw error;
  }
};
