import { Company } from "../models/Company";
import { styles_fabian_achaval } from "../utils/document_styles/fabian-achaval";
import { fa_reserva_template } from "../utils/document_templates/fa-reserva-template";
import { fa_autorizacion_template } from "../utils/document_templates/fa-autorización-template";

export const companies: Company[] = [
  {
    companyId: "12392",
    companyName: "FabianAchaval",
    whatsappNumbers: ["54111522775850", "5491122775850"],
    styles: styles_fabian_achaval,
    templates: {
      reserva: fa_reserva_template,
      autorizacion: fa_autorizacion_template,
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
  },
  {
    companyId: "78901",
    companyName: "Soldati",
    whatsappNumbers: ["5491145678901", "5491132109876"], // numeros falsos
    styles: null, // Aún no definido
    templates: {
      reserva: null, // Aún no definido
      autorizacion: null,
    },
  },
];

export const getCompanyByPhone = (phone: string) => {
  return companies.find((company) => company.whatsappNumbers.includes(phone));
};
