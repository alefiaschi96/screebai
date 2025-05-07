"use client";

import { useCallback } from "react";
import { Locale } from "@/i18n/settings";
import { getTranslation } from "@/i18n/dictionary";

/**
 * Hook for using translations within components
 * @param locale The current language
 * @returns Function to get translations
 */
export function useTranslation(locale: Locale) {
  // Function to get a translation
  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      // Get the base translation
      let translation = getTranslation(locale, key);
      
      // If there are parameters, replace them in the translation
      if (params && translation) {
        Object.keys(params).forEach((param) => {
          translation = translation.replace(
            new RegExp(`{{${param}}}`, "g"),
            params[param]
          );
        });
      }
      
      return translation;
    },
    [locale]
  );

  return { t };
}
