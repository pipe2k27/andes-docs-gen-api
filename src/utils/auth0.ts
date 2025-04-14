import axios from "axios";

export const getAuth0Token = async (): Promise<string> => {
  try {
    const response = await axios.post(
      `https://${process.env.DOMAIN}/oauth/token`,
      {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        audience: process.env.AUDIENCE || "https://andesdocs/api",
        grant_type: "client_credentials",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.access_token) {
      throw new Error("No se recibió token de acceso");
    }

    console.log("RESPONSE DEL getAuth0Token", response);

    return response.data.access_token;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error obteniendo token de Auth0:", error.message);
    } else if (axios.isAxiosError(error)) {
      console.error("Error de Axios:", error.response?.data);
    } else {
      console.error("Error desconocido:", error);
    }
    throw new Error("No se pudo obtener el token de autenticación");
  }
};
