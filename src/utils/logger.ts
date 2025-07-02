import AWS from "aws-sdk";
import moment from "moment-timezone";
import dotenv from "dotenv";
import cron from "node-cron";

dotenv.config();

// Configurar S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_DEFAULT_REGION,
});

const ENV = process.env.ENV || "development";

// Determinar el nombre del bucket según el entorno
const bucket = getBucketByEnv();
const LOG_FILE_KEY = "logs/requests.log"; // Ruta dentro del bucket
const SUMMARY_FILE_KEY = "logs/daily_summary.log"; // Resumen diario

// Contador de llamadas por endpoint
const endpointCounts: Record<string, number> = {};

// Función para obtener la fecha y hora en formato argentino
const getFormattedDate = (): string => {
  return moment()
    .tz("America/Argentina/Buenos_Aires")
    .format("DD-MM-YY HH:mm:ss");
};

// Función para registrar logs y contar llamadas
export const logRequest = async (
  endpoint: string,
  ip: string = "Desconocida"
) => {
  const timestamp = getFormattedDate();
  const logEntry = `[${timestamp}] ${endpoint} fue llamado desde IP: ${ip}\n`;

  // Incrementar el contador
  endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;

  try {
    // Obtener el archivo de logs actual en S3 (si existe)
    let existingLogs = "";
    try {
      const { Body } = await s3
        .getObject({ Bucket: bucket, Key: LOG_FILE_KEY })
        .promise();
      existingLogs = Body?.toString() || "";
    } catch (error) {
      console.log(
        `No se encontró un log previo en S3 para el bucket ${bucket}, creando uno nuevo.`
      );
    }

    // Nuevo contenido del log (sobreescribe)
    const newLogContent = existingLogs + logEntry;

    // Subir el archivo actualizado a S3
    await s3
      .putObject({
        Bucket: bucket,
        Key: LOG_FILE_KEY,
        Body: newLogContent,
        ContentType: "text/plain",
      })
      .promise();

    // También imprimir el log en la terminal de Render
    console.log(`[${ENV.toUpperCase()}] ${logEntry}`);
  } catch (error) {
    console.error("Error al escribir en S3:", error);
  }
};

// Tarea programada: Generar resumen diario a las 3 AM de Argentina
cron.schedule("0 3 * * *", async () => {
  const date = moment().tz("America/Argentina/Buenos_Aires").format("DD-MM-YY");
  let summary = `📊 Resumen del día ${date}:\n`;

  Object.entries(endpointCounts).forEach(([endpoint, count]) => {
    summary += `- ${endpoint}: ${count} veces\n`;
  });

  // Reiniciar el contador
  Object.keys(endpointCounts).forEach((key) => (endpointCounts[key] = 0));

  console.log(summary); // Mostrar en la terminal de Render

  // Guardar en S3
  try {
    await s3
      .putObject({
        Bucket: bucket,
        Key: SUMMARY_FILE_KEY,
        Body: summary,
        ContentType: "text/plain",
      })
      .promise();
    console.log("📁 Resumen diario guardado en S3.");
  } catch (error) {
    console.error("❌ Error al guardar el resumen en S3:", error);
  }
});
