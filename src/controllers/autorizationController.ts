import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { generateAndDownloadWord } from "../utils/wordGeneration";
import { autorizacion_template } from "../utils/document_templates";

/**
 * @swagger
 * /FA/autorizacion:
 *   post:
 *     summary: Genera y descarga un archivo de autorización en formato .docx
 *     description: Recibe un JSON con datos y genera un documento de autorización en formato Word.
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
 *               fecha:
 *                 type: string
 *                 format: date
 *                 example: "2025-02-24"
 *               nombreCliente:
 *                 type: string
 *                 example: "Juan Pérez"
 *               dniCliente:
 *                 type: integer
 *                 example: 12345678
 *               domicilioCliente:
 *                 type: string
 *                 example: "Calle Falsa 123"
 *               emailCliente:
 *                 type: string
 *                 format: email
 *                 example: "juan.perez@email.com"
 *               exclusividad:
 *                 type: string
 *                 enum: [exclusiva, no exclusiva]
 *                 example: "exclusiva"
 *               direccionInmueble:
 *                 type: string
 *                 example: "Av. Siempre Viva 742"
 *               precioInmueble:
 *                 type: integer
 *                 example: 150000
 *               tiempoAutorizacion:
 *                 type: integer
 *                 example: 90
 *               porcentajeHonorarios:
 *                 type: number
 *                 format: float
 *                 example: 2.5
 *     responses:
 *       200:
 *         description: Documento generado exitosamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Error de validación en los datos de entrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *                       location:
 *                         type: string
 *       403:
 *         description: No autorizado, falta la API Key o es inválida
 *       500:
 *         description: Error al generar el documento
 */

export const autorizationController = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  try {
    const {
      ciudad,
      fecha,
      nombreCliente,
      dniCliente,
      domicilioCliente,
      emailCliente,
      exclusividad,
      direccionInmueble,
      precioInmueble,
      tiempoAutorizacion,
      porcentajeHonorarios,
    } = req.body;

    const answers = {
      ciudad,
      fecha,
      nombreCliente,
      dniCliente,
      domicilioCliente,
      emailCliente,
      exclusividad,
      direccionInmueble,
      precioInmueble,
      tiempoAutorizacion,
      porcentajeHonorarios,
    };

    const fileBuffer = await generateAndDownloadWord(
      autorizacion_template,
      answers
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=autorización.docx"
    );

    res.end(fileBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al generar el documento" });
  }
};
