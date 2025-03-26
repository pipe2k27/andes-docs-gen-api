export type Option = {
  value: string;
  label: string;
};

export type Question = {
  key: string;
  question: string;
  options?: Option[];
};

export const reserva_questions: Question[] = [
  {
    key: "ciudad",
    question: "¿En qué ciudad se encuentra el inmueble que se está reservando?",
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
      "¿Cuál es la fecha en la que se realiza la reserva? Ej: 25-12-2025 (Formato: DD-MM-AAAA)",
  },
  {
    key: "tipoInmueble",
    question: "¿Qué tipo de inmueble se está reservando?",
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
      "¿Cuál es la dirección exacta del inmueble que se está reservando? Por ejemplo: Sargento Díaz 301, Piso 1, Unidad Funcional B, Partido Tigre",
  },
  {
    key: "localidadInmueble",
    question:
      "¿En qué localidad o barrio se encuentra el inmueble? (Ej: Caballito)",
  },
  {
    key: "nombreReservante",
    question:
      "¿Cuál es el nombre completo de la persona que realiza la reserva?",
  },
  {
    key: "dniReservante",
    question:
      "¿Cuál es el número de Documento Nacional de Identidad (DNI) del reservante? (Número sin puntos)",
  },
  {
    key: "cuitReservante",
    question:
      "¿Cuál es el *CUIT* (Clave Única de Identificación Tributaria) del reservante? (Número sin puntos)",
  },
  {
    key: "direccionReservante",
    question: "¿Cuál es la *dirección* particular del reservante?",
  },
  {
    key: "emailReservante",
    question: "¿Cuál es el *correo electrónico* del reservante?",
  },
  {
    key: "montoReserva",
    question:
      "¿Cuál es el monto en *dólares* que se ha pagado como reserva? (Escriba sólo números)",
  },
  {
    key: "diasValidezReserva",
    question: "¿Por cuántos días es válida la reserva? (Escriba sólo números)",
  },
  {
    key: "valorInmueble",
    question:
      "¿Cuál es el valor total del inmueble en *dólares*? (Escriba sólo números)",
  },
  {
    key: "nombreVendedor",
    question:
      "¿Cuál es el nombre completo del vendedor o representante legal del inmueble?",
  },
  {
    key: "dniVendedor",
    question:
      "¿Cuál es el número de Documento Nacional de Identidad (DNI) del vendedor? (Sólo números)",
  },
];

export const autorizacion_questions = [
  {
    key: "ciudad",
    question:
      "¿En qué ciudad se encuentra el inmueble que se está autorizando?",
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
      "¿Cuál es la fecha en la que se realiza la autorización? (Formato: AAAA-MM-DD)",
  },
  {
    key: "tipoInmueble",
    question:
      "¿Qué tipo de inmueble se está autorizando? (Ej: Departamento, Casa, etc.)",
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
      "¿Cuál es la dirección exacta del inmueble que se está autorizando?",
  },
  {
    key: "localidadInmueble",
    question: "¿En qué localidad o barrio se encuentra el inmueble?",
  },
  {
    key: "nombreAutorizante",
    question:
      "¿Cuál es el nombre completo de la persona que realiza la autorización?",
  },
  {
    key: "dniAutorizante",
    question:
      "¿Cuál es el número de Documento Nacional de Identidad (DNI) del autorizante? (Número sin puntos)",
  },
  {
    key: "cuitAutorizante",
    question:
      "¿Cuál es el CUIT (Clave Única de Identificación Tributaria) del autorizante? (Número sin puntos)",
  },
  {
    key: "direccionAutorizante",
    question: "¿Cuál es la dirección particular del autorizante?",
  },
  {
    key: "emailAutorizante",
    question: "¿Cuál es el correo electrónico del autorizante?",
  },
  {
    key: "montoAutorizacion",
    question:
      "¿Cuál es el monto que se ha pagado como autorización? (Escriba sólo números)",
  },
  {
    key: "diasValidezAutorizacion",
    question:
      "¿Por cuántos días es válida la autorización? (Escriba sólo números)",
  },
  {
    key: "valorInmueble",
    question: "¿Cuál es el valor total del inmueble? (Escriba sólo números)",
  },
  {
    key: "nombreVendedor",
    question:
      "¿Cuál es el nombre completo del vendedor o representante legal del inmueble?",
  },
  {
    key: "dniVendedor",
    question:
      "¿Cuál es el número de Documento Nacional de Identidad (DNI) del vendedor? (Escriba sólo números)",
  },
];
