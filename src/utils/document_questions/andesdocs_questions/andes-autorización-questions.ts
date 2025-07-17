import { Question } from "../../../types/questions";

export const andes_autorizacion_questions: Question[] = [
  {
    key: "ciudad",
    question:
      "¿En qué *ciudad* se encuentra el inmueble que se está autorizando?",
    options: [
      { value: "1", label: "CABA" },
      { value: "2", label: "Buenos Aires" },
      { value: "3", label: "Córdoba" },
      { value: "4", label: "Rosario" },
    ],
  },
  {
    key: "fecha",
    question:
      "¿Cuál es la *fecha* en la que se realiza la autorización? (Formato: AAAA-MM-DD)",
  },
  {
    key: "tipoInmueble",
    question:
      "¿Qué *tipo* de inmueble se está autorizando? (Ej: Departamento, Casa, etc.)",
    options: [
      { value: "1", label: "Departamento" },
      { value: "2", label: "Casa" },
      { value: "3", label: "Lote" },
      { value: "4", label: "Cochera" },
    ],
  },
  {
    key: "direccionInmueble",
    question:
      "¿Cuál es la *dirección exacta* del inmueble que se está autorizando?",
  },
  {
    key: "localidadInmueble",
    question: "¿En qué *localidad o barrio* se encuentra el inmueble?",
  },
  {
    key: "nombreAutorizante",
    question:
      "¿Cuál es el *nombre completo* de la persona que realiza la autorización?",
  },
  {
    key: "dniAutorizante",
    question:
      "¿Cuál es el número de Documento Nacional de Identidad (*DNI*) del autorizante? (Número sin puntos)",
  },
  {
    key: "cuitAutorizante",
    question:
      "¿Cuál es el *CUIT* (Clave Única de Identificación Tributaria) del autorizante? (Número sin puntos)",
  },
  {
    key: "direccionAutorizante",
    question: "¿Cuál es la *dirección particular* del autorizante?",
  },
  {
    key: "emailAutorizante",
    question: "¿Cuál es el *correo electrónico* del autorizante?",
  },
  {
    key: "montoAutorizacion",
    question:
      "¿Cuál es el *monto* que se ha pagado como autorización? (Escriba sólo números)",
  },
  {
    key: "diasValidezAutorizacion",
    question:
      "¿Por *cuántos días* es válida la autorización? (Escriba sólo números)",
  },
  {
    key: "valorInmueble",
    question: "¿Cuál es el *precio* total del inmueble? (Escriba sólo números)",
  },
  {
    key: "nombreVendedor",
    question:
      "¿Cuál es el *nombre completo* del vendedor o representante legal del inmueble?",
  },
  {
    key: "dniVendedor",
    question:
      "¿Cuál es el número de Documento Nacional de Identidad (*DNI*) del vendedor? (Escriba sólo números)",
  },
  {
    key: "nombreDocumento",
    question:
      "¿Con qué *nombre* te gustaría guardar este documento? (Ej: Reserva Casa Caballito, Autorización Depto CABA)",
  },
];
