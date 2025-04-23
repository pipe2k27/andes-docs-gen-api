import { Question } from "../../common/whatsapp-questions";
import NumeroALetras from "./numbersToLetters";

// export const addTextToAmounts = (data: any) => {
//   const result = { ...data };

//   if (result.montoReserva) {
//     const num = Number(result.montoReserva);
//     if (!isNaN(num)) {
//       result.montoReserva = `${num} ${NumeroALetras(num).toUpperCase()}`;
//     }
//   }

//   if (result.valorInmueble) {
//     const num = Number(result.valorInmueble);
//     if (!isNaN(num)) {
//       result.valorInmueble = `${num} ${NumeroALetras(num).toUpperCase()}`;
//     }
//   }

//   return result;
// };

export const validateTextFormat = (
  value: string,
  question: Question
): true | string => {
  if (question.format === "number" || question.format === "numberWithLetters") {
    if (!/^\d+$/.test(value)) {
      return "❗ Esperamos una respuesta numérica, por favor responde un número sin letras ni símbolos.";
    }
  }

  // Otras validaciones. Tipo que sea un email. lo que sea

  return true;
};

export const formatText = (value: string, question: Question) => {
  let formatted: string = value;

  if (question.format === "number" || question.format === "numberWithLetters") {
    const num = Number(value);
    if (!isNaN(num)) {
      formatted = `${num.toLocaleString("es")} (${NumeroALetras(
        num
      ).toUpperCase()}`;
    }
  }

  // aca podes manejar otros formteos ()

  return formatted;
};
