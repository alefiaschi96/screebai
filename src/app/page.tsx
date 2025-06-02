"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { i18n, Locale } from '@/i18n/settings';

/**
 * Componente di redirect automatico dalla rotta root "/" alla rotta con locale corretto
 * Rileva la preferenza di lingua dell'utente e reindirizza alla versione localizzata appropriata
 */
export default function LocaleRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Funzione per ottenere la lingua preferita dell'utente
    const getUserPreferredLocale = () => {
      // 1. Controlla se esiste una preferenza salvata nel localStorage
      try {
        const savedLocale = localStorage.getItem('user-locale');
        if (savedLocale && i18n.locales.includes(savedLocale as Locale)) {
          return savedLocale;
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }

      // 2. Controlla la lingua del browser
      if (typeof navigator !== 'undefined') {
        const browserLang = navigator.language.split('-')[0];
        if (i18n.locales.includes(browserLang as Locale)) {
          return browserLang;
        }
      }

      // 3. Usa la lingua predefinita come fallback
      return i18n.defaultLocale;
    };

    // Ottieni la lingua preferita e reindirizza
    const preferredLocale = getUserPreferredLocale();
    router.replace(`/${preferredLocale}`);
  }, [router]);

  // Mostra un loader o nulla mentre avviene il redirect
  return null;
}
