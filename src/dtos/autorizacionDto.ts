import { body } from "express-validator";

export const autorizacionDto = [
  body("ciudad")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("La ciudad debe tener entre 2 y 50 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("La ciudad solo puede contener letras y espacios"),

  body("fecha")
    .optional()
    .isISO8601()
    .withMessage("La fecha debe estar en formato YYYY-MM-DD"),

  body("nombreCliente")
    .optional()
    .trim()
    .isString()
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre del cliente solo puede contener letras y espacios"),

  body("dniCliente")
    .optional()
    .trim()
    .isString()
    .withMessage("El DNI del cliente debe tener entre 7 y 8 dígitos"),

  body("domicilioCliente")
    .optional()
    .trim()
    .isString()
    .isLength({ min: 5, max: 100 })
    .withMessage(
      "El domicilio del cliente debe tener entre 5 y 100 caracteres"
    ),

  body("emailCliente")
    .optional()
    .trim()
    .isString()
    .withMessage("El email del cliente no es válido"),

  body("exclusividad")
    .optional()
    .isIn(["exclusiva", "no exclusiva"])
    .withMessage("La exclusividad debe ser 'exclusiva' o 'no exclusiva'"),

  body("direccionInmueble")
    .optional()
    .trim()
    .isString()
    .isLength({ min: 5, max: 100 })
    .withMessage(
      "La dirección del inmueble debe tener entre 5 y 100 caracteres"
    ),

  body("precioInmueble")
    .optional()
    .trim()
    .isString()
    .isLength({ min: 1 })
    .withMessage("El precio del inmueble debe ser un número entero positivo"),

  body("tiempoAutorizacion")
    .optional()
    .trim()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage("El tiempo de autorización debe estar entre 1 y 100 días"),

  body("porcentajeHonorarios")
    .optional()
    .trim()
    .isString()
    .withMessage(
      "El porcentaje de honorarios debe ser un número entero entre 0 y 50"
    ),
];
