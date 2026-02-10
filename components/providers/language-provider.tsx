"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { translations, Language } from "@/lib/translations";
import { useProfile } from "@/hooks/use-finance-data";

type TranslationKeys<T> = T extends object
    ? { [K in keyof T]: T[K] extends object ? `${K & string}.${TranslationKeys<T[K]>}` : K & string }[keyof T]
    : never;

type TFunction = (key: TranslationKeys<typeof translations["pt-BR"]>) => string;

interface LanguageContextType {
    language: Language;
    t: TFunction;
    setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const { data: profile } = useProfile();
    const [language, setLanguageState] = useState<Language>("pt-BR");

    useEffect(() => {
        if (profile?.language) {
            setLanguageState(profile.language as Language);
        }
    }, [profile]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const t: TFunction = (keyPath) => {
        const keys = keyPath.split(".");
        let current: any = translations[language];

        for (const key of keys) {
            if (current && typeof current === "object" && key in current) {
                current = current[key];
            } else {
                return keyPath; // fallback to key path if not found
            }
        }

        return typeof current === "string" ? current : keyPath;
    };

    return (
        <LanguageContext.Provider value={{ language, t, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
