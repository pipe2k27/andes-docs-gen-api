// @/types/bot.ts

export type QuestionType =
  | "text"
  | "number"
  | "email"
  | "confirm"
  | "options"
  | "dynamicGroup";

export interface BaseQuestion {
  type: QuestionType;
  key: string;
  question: string;
  errorMessage?: string;
  validate?: (input: string) => boolean;
}

export interface ConfirmQuestion extends BaseQuestion {
  type: "confirm";
  options: ["Sí", "No"];
}

export interface OptionsQuestion extends BaseQuestion {
  type: "options";
  options: string[];
}

export interface NumberQuestion extends BaseQuestion {
  type: "number";
}

export interface EmailQuestion extends BaseQuestion {
  type: "email";
}

export interface TextQuestion extends BaseQuestion {
  type: "text";
}

export interface DynamicGroupField {
  type: "text" | "email";
  key: string;
  question: string;
  errorMessage?: string;
}

export interface DynamicGroupQuestion extends BaseQuestion {
  type: "dynamicGroup";
  groupSizeKey: string; // ejemplo: "signerCount"
  fields: DynamicGroupField[];
}

export type BotQuestion =
  | ConfirmQuestion
  | OptionsQuestion
  | NumberQuestion
  | EmailQuestion
  | TextQuestion
  | DynamicGroupQuestion;
