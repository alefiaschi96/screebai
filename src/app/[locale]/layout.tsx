// Questo file è un componente client
"use client";

import { useEffect } from 'react';
import { use } from 'react';
import { Locale } from "@/i18n/settings";

export default function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}>) {
  // Utilizziamo React.use() per accedere ai parametri
  const { locale } = use(params);
  
  // Impostiamo la lingua del documento HTML usando useEffect
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  
  // Passiamo i children al layout principale
  return children;
}
