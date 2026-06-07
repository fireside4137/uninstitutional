"use client";

import { createContext, useContext, useState, useEffect } from "react";

type Lang = "en" | "hi";

type LangContextType = {
  lang: Lang;
  handleLangChange: (l: Lang) => void;
};

const LangContext = createContext<LangContextType>({
  lang: "en",
  handleLangChange: () => {},
});

export const useLang = () => useContext(LangContext);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("ui-lang") as Lang;
    if (saved === "en" || saved === "hi") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLang(saved);
    }
  }, []);

  const handleLangChange = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem("ui-lang", newLang);
  };

  return (
    <LangContext.Provider value={{ lang, handleLangChange }}>
      {children}
    </LangContext.Provider>
  );
}