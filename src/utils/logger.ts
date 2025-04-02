import fs from "fs";
import path from "path";
import moment from "moment-timezone";

const logDir = path.join(__dirname, "../logs");
const logPath = path.join(logDir, "requests.log");

// Crear la carpeta logs si no existe
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Crear el archivo requests.log si no existe
if (!fs.existsSync(logPath)) {
  fs.writeFileSync(logPath, "", { flag: "wx" });
}

// Función para obtener la fecha y hora en formato argentino
const getFormattedDate = (): string => {
  return moment()
    .tz("America/Argentina/Buenos_Aires")
    .format("DD-MM-YY HH:mm:ss");
};

export const logRequest = (endpoint: string, ip: string = "Desconocida") => {
  const timestamp = getFormattedDate();
  const logEntry = `[${timestamp}] ${endpoint} fue llamado desde IP: ${ip}`;

  // Escribir en el archivo de logs
  fs.appendFile(logPath, logEntry + "\n", (err) => {
    if (err) console.error("Error escribiendo en el log", err);
  });

  // Mostrar en la terminal de Render
  console.log(logEntry);
};
