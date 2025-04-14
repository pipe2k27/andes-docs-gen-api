import axios from "axios";
import { getAuth0Token } from "./auth0";

export const sendDocReferenceToAndesDocs = async (docData: any) => {
  try {
    const token = await getAuth0Token();

    console.log("🔑 TOKEN:", token);

    const response = await axios.post(
      "https://andes-docs-develop-api.onrender.com/doc-ref/create-doc-ref",
      docData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Documento referenciado en Andes Docs:", response.data);
  } catch (error) {
    console.error("❌ Error al enviar la referencia del documento:", error);
  }
};
