import { ptBR } from "./pt-BR";
import { enUS } from "./en-US";

export const translations = {
    "pt-BR": ptBR,
    "en-US": enUS,
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof ptBR;
