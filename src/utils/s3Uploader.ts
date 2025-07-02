import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_DEFAULT_REGION,
});

export const s3StoreFile = async (
  bucket: string,
  key: string,
  data: Buffer
): Promise<string> => {
  if (process.env.ENV === "development") {
    bucket += "-test";
  }

  console.log("INTENTANDO GUARDAR ARCHIVO EN EL BUCKET:", bucket);

  const params = {
    Bucket: bucket,
    Key: key,
    Body: data,
    ContentType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };

  const result = await s3.upload(params).promise();
  return result.Location; // URL pública del documento
};
