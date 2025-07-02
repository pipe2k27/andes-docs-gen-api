import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import apiRoutes from "./routes/api";
import whatsappWebhookRoute from "./routes/whatsapp";
import logRoutes from "./routes/logRoutes";

import { swaggerSpec, swaggerUi } from "./config/swagger";

const ENV = process.env.ENV;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("¡Bienvenido a la API de Andes Docs!");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // Fabian Achaval API REST Documentation

app.use("/FA", apiRoutes); // Fabian Achaval API

app.use(logRoutes); // Logger for Fabian Achaval API

console.log("ENVIRONMENTTTT:", ENV);

app.use("/webhook", whatsappWebhookRoute); // Webhook for Andes Docs WhatsApp Bot

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
