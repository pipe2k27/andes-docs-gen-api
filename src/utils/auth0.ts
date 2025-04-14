import axios from "axios";

export const getAuth0Token = async (): Promise<string> => {
  const response = await axios.post(
    `https://${process.env.DOMAIN}/oauth/token`,
    {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      audience: "https://andesdocs/api",
      grant_type: "client_credentials",
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.access_token;
};
