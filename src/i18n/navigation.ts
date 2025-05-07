import { Locale, i18n } from './settings';

// Funzione per ottenere il percorso localizzato
export function getLocalizedPath(path: string, locale: Locale) {
  return `/${locale}${path}`;
}

// Funzione per ottenere il percorso con la lingua corrente
export function getPathWithLocale(path: string, locale: Locale) {
  // Rimuovi la locale dal percorso se presente
  const pathWithoutLocale = path.replace(new RegExp(`^/(${i18n.locales.join('|')})`), '');
  return getLocalizedPath(pathWithoutLocale, locale);
}

// Funzione per cambiare la lingua mantenendo lo stesso percorso
export function getPathWithNewLocale(path: string, newLocale: Locale) {
  // Estrai il percorso senza la locale
  const pathWithoutLocale = path.replace(new RegExp(`^/(${i18n.locales.join('|')})`), '');
  return getLocalizedPath(pathWithoutLocale, newLocale);
}
