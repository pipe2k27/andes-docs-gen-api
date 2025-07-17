import { Company } from "../models/Company";
import { andes_autorizacion_questions } from "../utils/document_questions/andesdocs_questions/andes-autorización-questions";
import { andes_reserva_questions } from "../utils/document_questions/andesdocs_questions/andes-reserva-questions";
import { soldati_autorizacion_questions } from "../utils/document_questions/soldati_questions/soldati-autorización-questions";
import { styles_andes } from "../utils/document_styles/andes-docs";
import { styles_soldati } from "../utils/document_styles/soldati";
import { andes_autorizacion_template } from "../utils/document_templates/andes-autorización-template";
import { andes_reserva_template } from "../utils/document_templates/andes-reserva-template";
import { soldati_autorización_template } from "../utils/document_templates/soldati-autorización-template";

export const companies: Company[] = [
  {
    companyId: "12348",
    companyName: "Demo",
    whatsappNumbers: [
      "54111522775850",
      "5491122775850",
      "54111531073107",
      "5491131073107",
      "5491163540008",
      "54111563540008",
      "5491168220080",
      "54111568220080",
    ],
    styles: styles_andes,
    templates: {
      reserva: andes_reserva_template,
      autorizacion: soldati_autorización_template,
    },
    questions: {
      reserva: andes_reserva_questions,
      autorizacion: soldati_autorizacion_questions,
    },
  },
  {
    companyId: "45678",
    companyName: "Keller Williams",
    whatsappNumbers: ["5491123456789", "5491198765432"], // Numeros falsos
    styles: null, // Aún no definido
    templates: {
      reserva: null, // Aún no definido
      autorizacion: null,
    },
    questions: {
      reserva: null,
      autorizacion: null,
    },
  },
  {
    companyId: "12346",
    companyName: "Soldati",
    whatsappNumbers: ["5491145678901", "5491132109876"], // numeros falsos
    styles: styles_soldati, // Aún no definido
    templates: {
      reserva: null, // Aún no definido
      autorizacion: soldati_autorización_template,
    },
    questions: {
      reserva: null,
      autorizacion: soldati_autorizacion_questions,
    },
  },
];

export const getCompanyByPhone = (phone: string) => {
  const company = companies.find((c) => c.whatsappNumbers.includes(phone));
  if (!company) return null;

  return {
    ...company,
    styles: company.styles || styles_andes,
  };
};
