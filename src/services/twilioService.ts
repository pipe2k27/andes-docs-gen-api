import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const client = twilio(accountSid, authToken);

export const sendTwilioMessage = async (to: string, body: string) => {
  const message = await client.messages.create({
    from: "whatsapp:+14155238886", // Número del sandbox o número verificado
    to: `whatsapp:${to}`,
    body,
  });

  console.log("📤 Mensaje enviado por Twilio:", message.sid);
};
