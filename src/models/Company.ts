import { Question } from "../types/questions";
import { DocumentStyles } from "../utils/document_styles/Document";

export interface Company {
  companyId: string;
  companyName: string;
  whatsappNumbers: string[];
  styles: DocumentStyles | null;
  templates: {
    reserva: any;
    autorizacion: any;
  };
  questions: {
    reserva?: Question[] | null;
    autorizacion?: Question[] | null;
  };
}
