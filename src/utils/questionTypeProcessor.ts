import { addThousandSeparator } from "./numberMethods";
import NumeroALetras from "./numbersToLetters";

export const processMoney = (answer: {
  type: string;
  [key: string]: any;
}): string => {
  if (
    answer.currency === undefined ||
    answer.currency === "" ||
    answer.currency === null
  )
    return "";

  let currencyAbreviation = "";
  if (answer.currency === "Dólares Estadounidenses") {
    currencyAbreviation = "USD";
  }
  if (answer.currency === "Dólares Estadounidenses billete") {
    currencyAbreviation = "USD";
  }
  if (answer.currency === "Pesos Argentinos") {
    currencyAbreviation = "$";
  }

  const fullNumber = addThousandSeparator(Number(answer.number));

  if (
    answer.decimals === 0 ||
    answer.decimals === undefined ||
    answer.decimals === String(0) ||
    answer.decimals.trim() === ""
  ) {
    const processedString = ` ${answer.currency} ${NumeroALetras(
      Number(answer.number)
    ).toLowerCase()} (${currencyAbreviation}${fullNumber})`;
    return processedString;
  }
  const numberWithDecimals = answer.decimals
    ? Number(`${answer.number}.${answer.decimals}`)
    : Number(answer.number);
  const processedString = ` ${answer.currency} ${NumeroALetras(
    numberWithDecimals
  ).toLowerCase()} (${currencyAbreviation}${fullNumber},${answer.decimals}) `;
  return processedString;
};

export const processPercentage = (answer: {
  type: string;
  [key: string]: any;
}) => {
  if (
    answer.number === "" ||
    answer.number === null ||
    answer.number === undefined
  )
    return "";
  if (
    answer.decimals === "" ||
    answer.decimals === null ||
    answer.decimals === undefined
  ) {
    const fullNumber = addThousandSeparator(Number(answer.number));
    const processedString = `${fullNumber}%`;
    return processedString;
  }
  const fullNumber = addThousandSeparator(Number(answer.number));
  const processedString = `${fullNumber},${answer.decimals}%`;
  return processedString;
};

export const processSheetsDataBase = (answer: {
  type: string;
  [key: string]: any;
}) => {
  return answer.label;
};

export const processCatastro = (answer: {
  type: string;
  [key: string]: any;
}) => {
  return `Circunscripción: ${answer.cir}, Sección: ${answer.sec}, Manzana: ${answer.man}, Parcela: ${answer.par}`;
};
