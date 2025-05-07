"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { Locale } from "@/i18n/settings";
import { use } from "react";

export default function GamesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = use(params);
  const { user, userScore, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation(locale);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router, user, userScore]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Show games page only if authenticated
  if (!isAuthenticated || !user || !userScore) {
    return null; // Will redirect to login via useEffect
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-4">
      <h2
        className="text-lg font-bold mb-3"
        style={{ color: "var(--secondary)" }}
      >
        {t("games.title")}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-3">
        {/* Gioco 1 - Disegno (già sviluppato) */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md">
          <Link href="/screebai" className="block">
            <div className="flex items-center p-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mr-3"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
              <div className="flex-grow">
                <h3
                  className="font-bold text-base mb-1"
                  style={{ color: "var(--secondary)" }}
                >
                  {t("games.game1.title")}
                </h3>
                <p className="text-gray-600 text-xs">
                  {t("games.game1.description")}
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Gioco 2 - In sviluppo */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden opacity-70">
          <div className="flex items-center p-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mr-3"
              style={{ backgroundColor: "var(--light-blue)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <h3
                  className="font-bold text-base mb-1"
                  style={{ color: "var(--secondary)" }}
                >
                  Indovina la Parola
                </h3>
              </div>
              <p className="text-gray-600 text-xs">
                Indovina la parola dalle immagini generate dall&apos;AI.
              </p>
            </div>
          </div>
        </div>

        {/* Gioco 3 - In sviluppo */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden opacity-70">
          <div className="flex items-center p-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mr-3"
              style={{ backgroundColor: "var(--light-blue)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <h3
                  className="font-bold text-base mb-1"
                  style={{ color: "var(--secondary)" }}
                >
                  Quiz di Conoscenza
                </h3>
              </div>
              <p className="text-gray-600 text-xs">
                Metti alla prova la tua conoscenza con domande generate
                dall&apos;AI.
              </p>
            </div>
          </div>
        </div>

        {/* Gioco 4 - In sviluppo */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden opacity-70">
          <div className="flex items-center p-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mr-3"
              style={{ backgroundColor: "var(--light-blue)" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <h3
                  className="font-bold text-base mb-1"
                  style={{ color: "var(--secondary)" }}
                >
                  Sfida Creativa
                </h3>
              </div>
              <p className="text-gray-600 text-xs">
                Crea storie e contenuti seguendo i suggerimenti dell&apos;AI.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
