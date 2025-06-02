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
      router.push(`/${locale}/login`);
    }
  }, [isLoading, isAuthenticated, router, user, userScore, locale]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0f172a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6366f1]"></div>
      </div>
    );
  }

  // Show games page only if authenticated
  if (!isAuthenticated || !user || !userScore) {
    return null; // Will redirect to login via useEffect
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-4">
      <div className="flex items-center md:mb-6 mb-3">
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8257e6] via-[#c026d3] to-[#f59e0b]">
          {t("games.title")}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Gioco 1 - Disegno (già sviluppato) */}
        <div className="bg-[#2a3b52] rounded-2xl overflow-hidden transition-all hover:bg-[#334155]">
          <Link href={`/${locale}/screebai`} className="block">
            <div className="flex items-center p-4">
              <div
                className="hidden md:flex w-12 h-12 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: "#6366f1" }}
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
                <h3 className="font-bold text-lg mb-1 text-white">
                  {t("games.game1.title")}
                </h3>
                <p className="text-[#94a3b8] text-sm">
                  {t("games.game1.description")}
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* CoCatch */}
        <div className="bg-[#2a3b52] rounded-2xl overflow-hidden transition-all hover:bg-[#334155]">
          <Link href={`/${locale}/cocatch`} className="block">
            <div className="flex items-center p-4">
              <div
                className="hidden md:flex w-12 h-12 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: "#3b82f6" }}
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
                  <h3 className="font-bold text-lg mb-1 text-white">
                    {t("games.game2.title")}
                  </h3>
                </div>
                <p className="text-[#94a3b8] text-sm">
                  {t("games.game2.description")}
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Gioco 3 - In sviluppo */}
        {/* <div className="bg-[#2a3b52] rounded-2xl overflow-hidden opacity-70">
          <div className="flex items-center p-4">
            <div
                className="hidden md:flex w-12 h-12 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: "#3b82f6" }}
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
                  className="font-bold text-lg mb-1 text-white"
                >
                  Quiz di Conoscenza
                </h3>
              </div>
              <p className="text-[#94a3b8] text-sm">
                Metti alla prova la tua conoscenza con domande generate
                dall&apos;AI.
              </p>
            </div>
          </div>
        </div> */}

        {/* Gioco 4 - In sviluppo */}
        {/* <div className="bg-[#2a3b52] rounded-2xl overflow-hidden opacity-70">
          <div className="flex items-center p-4">
            <div
                className="hidden md:flex w-12 h-12 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: "#3b82f6" }}
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
                  className="font-bold text-lg mb-1 text-white"
                >
                  Sfida Creativa
                </h3>
              </div>
              <p className="text-[#94a3b8] text-sm">
                Crea storie e contenuti seguendo i suggerimenti dell&apos;AI.
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
