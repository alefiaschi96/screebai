"use client";

import { usePathname, useRouter } from "next/navigation";
import { i18n, Locale } from "@/i18n/settings";
import { getPathWithNewLocale } from "@/i18n/navigation";
import { useState } from "react";

export default function LanguageSwitcher() {
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

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100"
        aria-expanded={isOpen}
      >
        <img src="/globe.svg" alt="Language" className="w-5 h-5" />
        <span className="text-sm text-gray-500 uppercase">{currentLocale}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 bg-white rounded shadow-lg z-50">
          <ul className="py-1">
            {i18n.locales.map((locale) => (
              <li key={locale}>
                <button
                  onClick={() => switchLanguage(locale)}
                  className={`block w-full text-sm text-gray-500 text-left px-4 py-2 hover:bg-gray-100 ${
                    locale === currentLocale ? "font-bold" : ""
                  }`}
                >
                  {locale === "en" ? "English" : "Italiano"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
