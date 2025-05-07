"use client";

import { useParams } from "next/navigation";
import { getTranslation } from "./dictionary";
import { Locale, i18n } from "./settings";

export function useTranslation() {
  // Ottieni la locale dai parametri dell'URL
  const params = useParams();
  const locale = (params?.locale as Locale) || i18n.defaultLocale;
  
  // Funzione per tradurre una chiave
  const t = (key: string): string => {
    return getTranslation(locale, key);
  };
  
  return {
    t,
    locale,
  };
}
