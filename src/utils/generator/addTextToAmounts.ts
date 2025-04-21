import NumeroALetras from "./numbersToLetters";

export const addTextToAmounts = (data: any) => {
  const result = { ...data };

  if (result.montoReserva) {
    const num = Number(result.montoReserva);
    if (!isNaN(num)) {
      result.montoReserva = `${num} ${NumeroALetras(num).toUpperCase()}`;
    }
  }

  if (result.valorInmueble) {
    const num = Number(result.valorInmueble);
    if (!isNaN(num)) {
      result.valorInmueble = `${num} ${NumeroALetras(num).toUpperCase()}`;
    }
  }

  return result;
};
