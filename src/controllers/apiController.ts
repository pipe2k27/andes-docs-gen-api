import { Request, Response } from "express";
import { generateAndDownloadWord } from "../utils/wordGeneration";
import { reserva_template } from "../utils/reserva_template";

/**
 * @swagger
 * /generate-doc:
 *   post:
 *     summary: Genera y descarga un archivo de reserva en formato .docx
 *     description: Recibe un JSON con datos y genera un documento de reserva en formato Word.
 *     security:
 *       - ApiKeyAuth: []
 *     tags:
 *       - Documentos
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
 *               fecha:
 *                 type: string
 *                 example: "2025-02-24"
 *               tipoInmueble:
 *                 type: string
 *                 example: "Departamento"
 *               direccionInmueble:
 *                 type: string
 *                 example: "Calle Falsa 123"
 *               localidadInmueble:
 *                 type: string
 *                 example: "Palermo"
 *               nombreReservante:
 *                 type: string
 *                 example: "Juan Pérez"
 *               dniReservante:
 *                 type: string
 *                 example: "12345678"
 *               cuitReservante:
 *                 type: string
 *                 example: "20-12345678-1"
 *               direccionReservante:
 *                 type: string
 *                 example: "Av. Siempre Viva 742"
 *               emailReservante:
 *                 type: string
 *                 example: "juan.perez@email.com"
 *               montoReserva:
 *                 type: number
 *                 example: 50000
 *               diasValidezReserva:
 *                 type: number
 *                 example: 30
 *               valorInmueble:
 *                 type: number
 *                 example: 150000
 *               nombreVendedor:
 *                 type: string
 *                 example: "María González"
 *               dniVendedor:
 *                 type: string
 *                 example: "87654321"
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

export const apiController = async (req: Request, res: Response) => {
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
