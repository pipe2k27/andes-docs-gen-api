import fs from "fs";
import path from "path";

export const logRequest = (endpoint: string, ip: string | undefined) => {
  const logPath = path.join(__dirname, "../logs/requests.log");
  const logEntry = `[${new Date().toISOString()}] ${endpoint} fue llamado desde IP: ${ip}\n`;

  fs.appendFile(logPath, logEntry, (err) => {
    if (err) console.error("Error escribiendo en el log", err);
  });
};
