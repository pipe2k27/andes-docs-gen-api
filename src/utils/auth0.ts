import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const getAuth0Token = async (): Promise<string> => {
  try {
    const response = await axios.post(
      `https://${process.env.DOMAIN}/oauth/token`,
      {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        audience: process.env.AUDIENCE,
        grant_type: "client_credentials",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Error getting Auth0 token:", error);
    throw new Error("Failed to retrieve Auth0 token");
  }
};
