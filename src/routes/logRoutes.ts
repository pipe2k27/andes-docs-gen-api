import { Router } from "express";
import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_DEFAULT_REGION,
});

const bucket = getBucketByEnv();

const LOG_FILE_KEY = "logs/requests.log";

// Ruta para mostrar el log como texto
router.get("/api-calls", async (req, res) => {
  try {
    const { Body } = await s3
      .getObject({ Bucket: bucket, Key: LOG_FILE_KEY })
      .promise();

    const logContent = Body?.toString("utf-8") || "";
    res.setHeader("Content-Type", "text/plain");
    res.send(logContent);
  } catch (error) {
    console.error("❌ Error al obtener los logs:", error);
    res.status(500).json({ message: "Error al obtener los logs" });
  }
});

export default router;
