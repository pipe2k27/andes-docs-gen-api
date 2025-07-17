export type Option = {
  value: string;
  label: string;
};

export type Question = {
  key: string;
  question: string;
  options?: Option[];
  format?: "number" | "numberAndLetters" | "email" | "text" | "percentage";
};
