import dotenv from "dotenv";
import axios from "axios";
import { getAuth0Token } from "./auth0";

dotenv.config();

const ANDES_API = process.env.ANDES_DOCS_API;
export interface Signer {
  name: string;
  email: string;
}

export type SignatureRequest = {
  phoneNumber: string;
  documentId: string;
  documentKind: string;
  filePath: string;
  signers: Signer[];
};

export const sendDocReferenceToAndesDocs = async (docData: any) => {
  try {
    const token = await getAuth0Token();

    const response = await axios.post(
      `${ANDES_API}/doc-ref/external-create-doc-ref`,
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

export const sendToSignDocumentWithAndesDocs = async (
  payload: SignatureRequest
) => {
  try {
    const token = await getAuth0Token();

    const response = await axios.post(
      `${ANDES_API}/electronic-signature/external-request-new-signature`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("data response:", response.data);

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
