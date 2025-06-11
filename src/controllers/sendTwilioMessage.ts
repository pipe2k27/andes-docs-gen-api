import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const client = twilio(accountSid, authToken);

export const sendTwilioMessage = async (to: string, body: string) => {
  const message = await client.messages.create({
    from: "whatsapp:+14155238886", // o tu número verificado
    to: `whatsapp:${to}`,
    body,
  });

  console.log("📤 Twilio: mensaje enviado a:", to, "| SID:", message.sid);
  return message;
};
