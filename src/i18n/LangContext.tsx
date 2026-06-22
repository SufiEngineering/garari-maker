/* eslint-disable react-refresh/only-export-components -- context file intentionally exports its hook alongside the provider */
// ============================================================================
// Language Context — multilingual support (English, Urdu, Arabic)
// ============================================================================

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { translations, LANGS, type Lang, type Translations } from "./translations";

interface LangContextValue {
  lang: Lang;
  t: Translations;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  isUrdu: boolean;
  isRtl: boolean;
  langs: typeof LANGS;
}

const LangContext = createContext<LangContextValue>({
  lang: "en",
  t: translations.en,
  setLang: () => {},
  toggleLang: () => {},
  isUrdu: false,
  isRtl: false,
  langs: LANGS,
});

const RTL_LANGS: Lang[] = ["ur", "ar"];

function readStored(): Lang {
  try {
    const v = localStorage.getItem("gm_lang") as Lang | null;
    if (v && translations[v]) return v;
  } catch {
    /* ignore */
  }
  return "en";
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStored);

  useEffect(() => {
    try {
      localStorage.setItem("gm_lang", lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);
  const toggleLang = () =>
    setLangState((prev) => {
      const idx = LANGS.findIndex((l) => l.code === prev);
      return LANGS[(idx + 1) % LANGS.length].code;
    });

  return (
    <LangContext.Provider
      value={{
        lang,
        t: translations[lang],
        setLang,
        toggleLang,
        isUrdu: lang === "ur",
        isRtl: RTL_LANGS.includes(lang),
        langs: LANGS,
      }}
    >
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
