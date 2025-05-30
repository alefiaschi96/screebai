"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Locale, i18n } from '@/i18n/settings';
import { getPathWithNewLocale } from '@/i18n/navigation';

// Chiave per salvare la lingua nel localStorage
const LOCALE_STORAGE_KEY = 'user-locale';

export function useLocale() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Determina la lingua corrente dal pathname
  const pathLocale = pathname.split('/')[1] as Locale;
  const isValidLocale = i18n.locales.includes(pathLocale as Locale);
  
  // Stato per la lingua corrente
  const [currentLocale, setCurrentLocale] = useState<Locale>(
    isValidLocale ? pathLocale : i18n.defaultLocale as Locale
  );

  // Effetto per inizializzare la lingua dal localStorage o dal pathname
  useEffect(() => {
    // Funzione per ottenere la lingua salvata
    const getSavedLocale = (): Locale | null => {
      if (typeof window === 'undefined') return null;
      
      try {
        const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
        return savedLocale && i18n.locales.includes(savedLocale) ? savedLocale : null;
      } catch (error) {
        console.error('Error accessing localStorage:', error);
        return null;
      }
    };

    // Ottieni la lingua salvata
    const savedLocale = getSavedLocale();
    
    // Se c'è una lingua salvata e diversa da quella nel pathname, reindirizza
    if (savedLocale && savedLocale !== pathLocale && isValidLocale) {
      const newPath = getPathWithNewLocale(pathname, savedLocale);
      router.push(newPath);
    } 
    // Altrimenti, se il pathname contiene una lingua valida, usala e salvala
    else if (isValidLocale) {
      setCurrentLocale(pathLocale);
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, pathLocale);
      } catch (error) {
        console.error('Error saving locale to localStorage:', error);
      }
    }
  }, [pathname, pathLocale, router, isValidLocale]);

  // Funzione per cambiare lingua
  const changeLocale = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;
    
    // Salva la nuova lingua nel localStorage
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    } catch (error) {
      console.error('Error saving locale to localStorage:', error);
    }
    
    // Aggiorna lo stato
    setCurrentLocale(newLocale);
    
    // Reindirizza alla stessa pagina con la nuova lingua
    const newPath = getPathWithNewLocale(pathname, newLocale);
    router.push(newPath);
  };

  return {
    currentLocale,
    changeLocale
  };
}
