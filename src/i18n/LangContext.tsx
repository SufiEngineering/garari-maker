// ============================================================================
// Language Context — Provides bilingual support across the app
// ============================================================================

import { createContext, useContext, useState, type ReactNode } from "react";
import { translations, type Lang, type Translations } from "./translations";

interface LangContextValue {
  lang: Lang;
  t: Translations;
  toggleLang: () => void;
  isUrdu: boolean;
}

const LangContext = createContext<LangContextValue>({
  lang: "en",
  t: translations.en,
  toggleLang: () => {},
  isUrdu: false,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  const toggleLang = () => setLang((prev) => (prev === "en" ? "ur" : "en"));

  return (
    <LangContext.Provider
      value={{
        lang,
        t: translations[lang],
        toggleLang,
        isUrdu: lang === "ur",
      }}
    >
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
