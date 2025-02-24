import { Request, Response } from "express";
import { generateAndDownloadWord } from "../utils/wordGeneration";
import { reserva_template } from "../utils/reserva_template";

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

    const file = await generateAndDownloadWord(reserva_template, answers);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", "attachment; filename=reserva.docx");
    console.log("file", file);

    res.send(file);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al generar el documento" });
  }
};
