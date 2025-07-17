import { Question } from "../../../types/questions";

export const soldati_autorizacion_questions: Question[] = [
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
    key: "oficina",
    question:
      "¿Qué oficina de GRUPO SOLDATI está a cargo de la presente Operación?",
    options: [
      {
        value: "1",
        label:
          "Av. Libertador 742 - Piso 5 (B1638ET), Vicente López (Sucursal Libertador)",
      },
      {
        value: "2",
        label:
          "Washington 2201 (C1430ETI), Ciudad Autónoma de Buenos Aires (Sucursal Belgrano R)",
      },
      {
        value: "3",
        label:
          "Rodriguez Peña 1431 (C1021ABE), Ciudad Autónoma de Buenos Aires (Sucursal Recoleta)",
      },
      {
        value: "4",
        label:
          "Los Crisantemos 475, Ayres Loft Módulo “C”, Of 114/115, Pilar, Buenos Aires (Sucursal Pilar)",
      },
      {
        value: "5",
        label:
          "Humboldt 1986 (C1414CTV), Ciudad Autónoma de Buenos Aires (Sucursal Palermo Hollywood)",
      },
      {
        value: "6",
        label:
          "Av. Las Heras 4073 (C1425ATE), Ciudad Autónoma de Buenos Aires (Sucursal Botánico)",
      },
      {
        value: "7",
        label:
          "Del Caminante 80 Of. 506, Edificio Vientos del Delta 2, Nordelta, Buenos Aires (Sucursal Nordelta)",
      },
      {
        value: "8",
        label: "Av. Argentina 197 Piso 3 Dpto. B, Neuquén (Sucursal Neuquén)",
      },
      {
        value: "9",
        label:
          "Av. Alvear 1883 - Posadas 1564 Piso 2, Oficina i, Ciudad Autónoma de Buenos Aires (Sucursal Posadas)",
      },
      {
        value: "10",
        label:
          "Juana Manso 1551, Puerto Madero, Ciudad Autónoma de Buenos Aires (Sucursal Puerto Madero)",
      },
      {
        value: "11",
        label:
          "Santa Rita 2731 - 2do Piso, Ofic. 21/22, Boulogne, Provincia de Buenos Aires ",
      },
    ],
  },
  {
    key: "direccionInmueble",
    question:
      "¿Cuál es la *dirección exacta* del inmueble objeto de la presente Autorización? Por ejemplo: Sargento Díaz 301, Piso 1, Unidad Funcional B, Partido Tigre, Provincia de Buenos Aires",
  },
  {
    key: "nombreAutorizante",
    question: "¿Cuál es el *nombre completo* del Autorizante?",
  },
  {
    key: "dniAutorizante",
    question:
      "¿Cuál es el número de Documento Nacional de Identidad (*DNI*) del Autorizante? (Número sin puntos)",
  },

  {
    key: "direccionAutorizante",
    question: "¿Cuál es la *dirección* particular del Autorizante?",
  },
  {
    key: "emailAutorizante",
    question: "¿Cuál es el *correo electrónico* del Autorizante?",
    format: "email",
  },
  {
    key: "valorInmueble",
    question:
      "¿Cuál es el *precio* total para la publicación del inmueble en *dólares*? (Escriba sólo números, sin puntos ni comas)",
    format: "numberAndLetters",
  },
  {
    key: "porcentaje",
    question:
      "Porcentaje de los honorarios inmobiliarios sobre el total del contrato. (Escriba números con decimales, ej: 1,5 para 1.5%)",
    format: "percentage",
  },
  {
    key: "fecha",
    question: "¿Cuál es la *fecha* de la operación?",
  },
  {
    key: "nombreDocumento",
    question:
      "¿Con qué *nombre* te gustaría guardar este documento? (Ej: Reserva Casa Caballito, Autorización Depto CABA)",
  },
];
