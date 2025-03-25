import { body } from "express-validator";

export const reservaDto = [
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

  body("tipoInmueble")
    .optional()
    .trim()
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage("El tipo de inmueble debe tener entre 3 y 50 caracteres"),

  body("direccionInmueble")
    .optional()
    .trim()
    .isString()
    .isLength({ min: 5, max: 100 })
    .withMessage("La dirección debe tener entre 5 y 100 caracteres"),

  body("localidadInmueble")
    .optional()
    .trim()
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage("La localidad debe tener entre 3 y 50 caracteres"),

  body("nombreReservante")
    .optional()
    .trim()
    .isString()
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios"),

  body("dniReservante")
    .optional()
    .isInt({ min: 1000000, max: 99999999 })
    .withMessage("El DNI debe tener entre 7 y 8 dígitos"),

  body("cuitReservante")
    .optional()
    .matches(/^\d{2}-\d{8}-\d{1}$/)
    .withMessage("El CUIT debe tener el formato XX-XXXXXXXX-X"),

  body("emailReservante")
    .optional()
    .isEmail()
    .withMessage("El email no es válido"),

  body("montoReserva")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El monto de la reserva debe ser un número positivo"),

  body("diasValidezReserva")
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage("Los días de validez deben estar entre 1 y 365"),

  body("valorInmueble")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("El valor del inmueble debe ser un número positivo"),

  body("nombreVendedor")
    .optional()
    .trim()
    .isString()
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios"),

  body("dniVendedor")
    .optional()
    .isInt({ min: 1000000, max: 99999999 })
    .withMessage("El DNI del vendedor debe tener entre 7 y 8 dígitos"),
];
