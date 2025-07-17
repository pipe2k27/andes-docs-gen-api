import { Question } from "../../../types/questions";

export const andes_reserva_questions: Question[] = [
  {
    key: "ciudad",
    question:
      "¿En qué *ciudad* se encuentra el inmueble que se está reservando?",
  },
  {
    key: "fecha",
    question:
      "¿Cuál es la *fecha* en la que se realiza la reserva? Ej: 4 de octubre del 2025",
  },
  {
    key: "tipoInmueble",
    question: "¿Qué *tipo de inmueble* se está reservando?",
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
      "¿Cuál es la *dirección exacta* del inmueble que se está reservando? Por ejemplo: Sargento Díaz 301, Piso 1, Unidad Funcional B, Partido Tigre",
  },
  {
    key: "localidadInmueble",
    question:
      "¿En qué *localidad o barrio* se encuentra el inmueble? (Ej: Caballito)",
  },
  {
    key: "nombreReservante",
    question:
      "¿Cuál es el *nombre completo* de la persona que realiza la reserva?",
  },
  {
    key: "dniReservante",
    question:
      "¿Cuál es el número de Documento Nacional de Identidad (*DNI*) del reservante? (Número sin puntos)",
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
    format: "email",
  },
  {
    key: "montoReserva",
    question:
      "¿Cuál es el *monto* en *dólares* que se ha pagado como reserva? (Escriba sólo números, sin puntos ni comas)",
    format: "numberAndLetters",
  },
  {
    key: "diasValidezReserva",
    question:
      "¿Por cuántos *días* es válida la reserva? (Escriba sólo números, sin puntos ni comas)",
    format: "numberAndLetters",
  },
  {
    key: "valorInmueble",
    question:
      "¿Cuál es el *precio* total del inmueble en *dólares*? (Escriba sólo números, sin puntos ni comas)",
    format: "numberAndLetters",
  },
  {
    key: "nombreVendedor",
    question:
      "¿Cuál es el *nombre completo* del vendedor o representante legal del inmueble?",
  },
  {
    key: "dniVendedor",
    question:
      "¿Cuál es el número de Documento Nacional de Identidad (*DNI*) del vendedor? (Sólo números)",
  },
  {
    key: "nombreDocumento",
    question:
      "¿Con qué *nombre* te gustaría guardar este documento? (Ej: Reserva Casa Caballito, Autorización Depto CABA)",
  },
];
