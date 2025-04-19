import axios from "axios";
import { getAuth0Token } from "./auth0";

interface Signer {
  name: string;
  email: string;
}

export type SignatureRequest = {
  documentUrl: string;
  firmantes: {
    name: string;
    email: string;
  }[];
};

export const sendDocReferenceToAndesDocs = async (docData: any) => {
  try {
    const token = await getAuth0Token();

    const response = await axios.post(
      "https://andes-docs-develop-api.onrender.com/doc-ref/external-create-doc-ref",
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

export const signatureDocument = async (payload: SignatureRequest) => {
  try {
    const token = await getAuth0Token();

    const response = await axios.post(
      `https://andes-docs-develop-api.onrender.com/electronic-signature/external-request-new-signature`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("❌ Error enviando documento a firma:", error);
    return {
      success: false,
      error,
    };
  }
};
