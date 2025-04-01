import { Request, Response } from "express";
import { generateAndDownloadWord } from "../utils/wordGeneration";
import { validationResult } from "express-validator";
import { reserva_template } from "../utils/document_templates";
import { logRequest } from "../utils/logger";

/**
 * @swagger
 * /FA/reserva:
 *   post:
 *     summary: Genera y descarga un archivo de reserva en formato .docx
 *     description: Recibe un JSON con datos y genera un documento de reserva en formato Word.
 *     tags:
 *       - Documentos
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: Clave API necesaria para autenticar la solicitud
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ciudad:
 *                 type: string
 *                 example: "Buenos Aires"
 *                 description: Opcional. Si no se envía, se verá un espacio vacío.
 *               fecha:
 *                 type: string
 *                 example: "2025-02-24"
 *                 description: Opcional. Si no se envía, se verá un espacio vacío.
 *               tipoInmueble:
 *                 type: string
 *                 example: "Departamento"
 *                 description: Opcional. Si no se envía, se verá un espacio vacío.
 *               direccionInmueble:
 *                 type: string
 *                 example: "Calle Falsa 123"
 *                 description: Opcional. Si no se envía, se verá un espacio vacío.
 *               localidadInmueble:
 *                 type: string
 *                 example: "Palermo"
 *                 description: Opcional. Si no se envía, se verá un espacio vacío.
 *               nombreReservante:
 *                 type: string
 *                 example: "Juan Pérez"
 *                 description: Opcional. Si no se envía, se verá un espacio vacío.
 *               dniReservante:
 *                 type: string
 *                 example: "12345678"
 *                 description: Opcional. Si no se envía, se verá un espacio vacío.
 *               cuitReservante:
 *                 type: string
 *                 example: "20-12345678-1"
 *                 description: Opcional. Si no se envía, se verá un espacio vacío.
 *               direccionReservante:
 *                 type: string
 *                 example: "Av. Siempre Viva 742"
 *                 description: Opcional. Si no se envía, se verá un espacio vacío.
 *               emailReservante:
 *                 type: string
 *                 example: "juan.perez@email.com"
 *                 description: Opcional. Si no se envía, se verá un espacio vacío.
 *               montoReserva:
 *                 type: number
 *                 example: 50000
 *                 description: |
 *                   Opcional. Monto de la reserva en formato numérico.
 *                   Si se envía como número (ej: 50000), aparecerá en letras y números (ej: "CINCUENTA MIL 50000").
 *                   Si se envía como string (ej: "50000"), aparecerá solo el número.
 *               diasValidezReserva:
 *                 type: string
 *                 example: "30"
 *                 description: |
 *                   Opcional. Días de validez de la reserva.
 *                   Se recomienda enviar como string para que aparezca solo el número.
 *                   Si se envía como número, aparecerá en letras y números (ej: "TREINTA 30").
 *               valorInmueble:
 *                 type: number
 *                 example: 150000
 *                 description: |
 *                   Opcional. Valor del inmueble en formato numérico.
 *                   Si se envía como número (ej: 150000), aparecerá en letras y números (ej: "CIENTO CINCUENTA MIL 150000").
 *                   Si se envía como string (ej: "150000"), aparecerá solo el número.
 *               nombreVendedor:
 *                 type: string
 *                 example: "María González"
 *                 description: Opcional. Si no se envía, se verá un espacio vacío.
 *               dniVendedor:
 *                 type: string
 *                 example: "87654321"
 *                 description: Opcional. Si no se envía, se verá un espacio vacío.
 *     responses:
 *       200:
 *         description: Documento generado exitosamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: No autorizado, falta la API Key o es inválida
 *       500:
 *         description: Error al generar el documento
 */

export const reservaController = async (req: Request, res: Response) => {
  logRequest("/FA/reserva", req.ip);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const {
      ciudad,
      fecha,
      tipoInmueble,
      direccionInmueble,
      localidadInmueble,
      nombreReservante,
      dniReservante,
      cuitReservante,
      direccionReservante,
      emailReservante,
      montoReserva,
      diasValidezReserva,
      valorInmueble,
      nombreVendedor,
      dniVendedor,
    } = req.body;

    const answers = {
      ciudad,
      fecha,
      tipoInmueble,
      direccionInmueble,
      localidadInmueble,
      nombreReservante,
      dniReservante,
      cuitReservante,
      direccionReservante,
      emailReservante,
      montoReserva,
      diasValidezReserva,
      valorInmueble,
      nombreVendedor,
      dniVendedor,
    };

    const fileBuffer = await generateAndDownloadWord(reserva_template, answers);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", "attachment; filename=reserva.docx");

    res.end(fileBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al generar el documento" });
  }
};
