"use client";

import { usePathname, useRouter } from "next/navigation";
import { i18n, Locale } from "@/i18n/settings";
import { getPathWithNewLocale } from "@/i18n/navigation";
import { useState } from "react";

type LanguageSwitcherProps = {
  isMobile?: boolean;
};

export default function LanguageSwitcher({ isMobile = false }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Determina la lingua corrente dal pathname
  const currentLocale = pathname.split("/")[1] as Locale;

  // Cambia la lingua e naviga alla stessa pagina con la nuova lingua
  const switchLanguage = (newLocale: Locale) => {
    if (newLocale === currentLocale) {
      setIsOpen(false);
      return;
    }

    const newPath = getPathWithNewLocale(pathname, newLocale);
    router.push(newPath);
    setIsOpen(false);
  };

  // Bandiere per le lingue
  const flags = {
    en: "🇺🇸",
    it: "🇮🇹"
  };

  // Nomi completi delle lingue
  const languageNames = {
    en: "English",
    it: "Italiano"
  };

  if (isMobile) {
    return (
      <div className="w-full">
        <div className="flex space-x-2">
          {i18n.locales.map((locale) => (
            <button
              key={locale}
              onClick={() => switchLanguage(locale)}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-all ${locale === currentLocale 
                ? "bg-gradient-to-r from-[#6366f1] to-[#f59e0b] text-white font-medium" 
                : "bg-[#1e293b] text-gray-300 hover:bg-[#2d3748]"}`}
            >
              <span className="text-lg">{flags[locale]}</span>
              <span className="text-sm">{languageNames[locale]}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1e293b] text-white"
        aria-expanded={isOpen}
      >
        <span className="text-lg mr-1">{flags[currentLocale as keyof typeof flags]}</span>
        <span className="text-sm uppercase">{currentLocale}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 bg-[#1e293b] rounded-lg shadow-lg z-50 border border-[#334155] overflow-hidden">
          <ul className="py-1">
            {i18n.locales.map((locale) => (
              <li key={locale}>
                <button
                  onClick={() => switchLanguage(locale)}
                  className={`block w-full text-sm text-left px-4 py-2 ${locale === currentLocale 
                    ? "bg-[#2d3748] text-white font-medium" 
                    : "text-gray-300 hover:bg-[#2d3748]"}`}
                >
                  <div className="flex items-center">
                    <span className="mr-2">{flags[locale]}</span>
                    <span>{languageNames[locale]}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
