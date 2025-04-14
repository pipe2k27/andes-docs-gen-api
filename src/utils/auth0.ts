import axios from "axios";

export const getAuth0Token = async (): Promise<string> => {
  console.log("🔍 Obteniendo token de Auth0...");
  console.log("Configuración:", {
    domain: process.env.DOMAIN,
    clientId: process.env.CLIENT_ID?.substring(0, 5) + "...", // Muestra solo parte por seguridad
    audience: process.env.AUDIENCE,
  });

  try {
    const auth0Url = `https://${process.env.DOMAIN}/oauth/token`;
    console.log("🌍 URL:", auth0Url);

    const response = await axios.post<{ access_token: string }>(
      auth0Url,
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

    console.log("🔑 Token recibido. Status:", response.status);
    return response.data.access_token;
  } catch (error) {
    console.error("💥 Error obteniendo token:");

    if (axios.isAxiosError(error)) {
      console.error("Detalles Axios:", {
        status: error.response?.status,
        error: error.response?.data?.error,
        description: error.response?.data?.error_description,
        url: error.config?.url,
      });
    }

    throw new Error("Fallo en autenticación con Auth0");
  }
};
