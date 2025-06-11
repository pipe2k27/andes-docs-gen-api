import { sendTwilioMessage } from "../services/twilioService";
import { sendMetaMessage } from "./sendMetaMessage";

export const sendWhatsAppMessage = async (
  to: string,
  text: string,
  source: "meta" | "twilio" = "meta"
) => {
  if (source === "twilio") {
    return await sendTwilioMessage(to, text);
  } else {
    return await sendMetaMessage(to, text);
  }
};
