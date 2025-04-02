import fs from "fs";
import path from "path";

// Definir la ruta de la carpeta logs dentro de la carpeta dist (donde Render ejecuta el código)
const logDir = path.join(__dirname, "../../logs"); // Sube dos niveles para salir de "dist"
const logPath = path.join(logDir, "requests.log");

// Crear la carpeta logs si no existe
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Crear el archivo requests.log si no existe
if (!fs.existsSync(logPath)) {
  fs.writeFileSync(logPath, "", { flag: "wx" }); // "wx" evita sobrescribir si ya existe
}

export const logRequest = (endpoint: string, ip: string = "Desconocida") => {
  const logEntry = `[${new Date().toISOString()}] ${endpoint} fue llamado desde IP: ${ip}\n`;

  fs.appendFile(logPath, logEntry, (err) => {
    if (err) console.error("Error escribiendo en el log", err);
  });
};
