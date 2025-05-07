import { Locale } from './settings';
import enDictionary from './dictionaries/en.json';
import itDictionary from './dictionaries/it.json';

// Tipo per i dizionari
type Dictionary = typeof enDictionary;

// Mappa dei dizionari per lingua
const dictionaries: Record<Locale, Dictionary> = {
  en: enDictionary,
  it: itDictionary,
};

// Funzione per ottenere il dizionario per la lingua corrente
export const getDictionary = (locale: Locale): Dictionary => {
  return dictionaries[locale];
};

// Funzione per ottenere una traduzione specifica
export const getTranslation = (locale: Locale, key: string): string => {
  const keys = key.split('.');
  let value: unknown = dictionaries[locale];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in (value as Record<string, unknown>)) {
      value = (value as Record<string, unknown>)[k];
    } else {
      // Fallback alla lingua predefinita se la chiave non esiste
      value = null;
      break;
    }
  }
  
  // Se non troviamo la traduzione nella lingua richiesta, proviamo con l'inglese
  if (value === null && locale !== 'en') {
    return getTranslation('en', key);
  }
  
  // Assicuriamoci di restituire sempre una stringa
  return typeof value === 'string' ? value : key;
};
