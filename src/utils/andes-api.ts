import axios from "axios";

export const sendDocReferenceToAndesDocs = async (docData: any) => {
  try {
    const response = await axios.post(
      "https://andes-docs-develop-api.onrender.com/doc-ref/create-doc-ref",
      {
        companyId: docData.companyId,
        companyName: docData.companyName,
        documentType: docData.documentType,
        fileNameNoExtension: docData.fileName,
        filePath: docData.filePath,
        fileUrl: docData.fileUrl,
        createdBy: docData.createdBy,
        userId: docData.userId,
        creatorPhotoUrl: docData.creatorPhotoUrl,
        versionId: docData.versionId,
        versionNumber: docData.versionNumber,
        date: docData.date,
        size: docData.size,
        updateDate: docData.updateDate,
        format: docData.format,
        andesDockerDoc: docData.andesDockerDoc,
        expirationDate: docData.expirationDate,
        documentKind: docData.documentKind,
      }
    );

    console.log("✅ Documento referenciado en Andes Docs:", response.data);
  } catch (error) {
    console.error("❌ Error al enviar la referencia del documento:", error);
  }
};
