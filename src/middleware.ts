import { NextRequest, NextResponse } from 'next/server';
import { i18n, Locale } from './i18n/settings';
import Negotiator from 'negotiator';

// Funzione per ottenere la lingua preferita dal browser
function getLocaleFromHeaders(request: NextRequest): string {
  // Simuliamo l'oggetto headers per Negotiator
  const headers = {
    'accept-language': request.headers.get('accept-language') || '',
  };
  
  // Utilizziamo Negotiator per ottenere la lingua preferita
  const languages = new Negotiator({ headers }).languages();
  
  // Troviamo la prima lingua supportata
  const locale = languages.find(
    (language) => i18n.locales.includes(language as Locale)
  );
  
  return locale || i18n.defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Verifica se il percorso ha già una locale valida
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  // Se il percorso ha già una locale, non fare nulla
  if (pathnameHasLocale) return;
  
  // Ignora le API e i file statici
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return;
  }
  
  // Ottieni la locale dal browser
  const locale = getLocaleFromHeaders(request);
  
  // Crea una nuova URL con la locale
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  newUrl.search = request.nextUrl.search;
  
  // Reindirizza alla nuova URL
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
