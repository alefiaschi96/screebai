import type { Metadata } from "next";
import { i18n } from "@/i18n/settings";

// Metadati per la pagina
export const metadata: Metadata = {
  title: "Screebai - Drawing App",
  description: "Application for drawing random words",
};

// Genera i parametri statici per le lingue supportate
export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}
