export const normalizeText = (text: string) => {
  return text
    .toLowerCase() // Convertir a minúsculas
    .normalize("NFD") // Normalizar caracteres Unicode
    .replace(/[\u0300-\u036f]/g, ""); // Eliminar tildes
};
