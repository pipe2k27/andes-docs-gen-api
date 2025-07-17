import { Question } from "../types/questions";

// Función para formatear preguntas con opciones
export const formatQuestionWithOptions = (question: Question) => {
  let options = question.options ? [...question.options] : [];

  // Verifica si la pregunta ya tiene opciones numéricas
  const hasNumericOptions = options.some((opt) => /^\d+$/.test(opt.value));

  // Detecta si la pregunta solicita solo números explícitamente
  const asksForNumbersOnly = question.question.includes("Escriba sólo números");

  // Formatear las opciones en texto
  const optionsText = options
    .map((opt) => `${opt.value}. ${opt.label}`)
    .join("\n");

  // Agregar opciones adicionales según corresponda
  let additionalOptions = "\n0. Para reiniciar el proceso.";

  // No agregar la opción 9 si la pregunta ya tiene números o si pide solo números
  if (!hasNumericOptions && !asksForNumbersOnly) {
    additionalOptions = "\n9. Aún no tengo la respuesta" + additionalOptions;
  }

  return `${question.question}\n${optionsText}${additionalOptions}`;
};
