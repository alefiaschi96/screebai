"use client";

import GamesPage from "@/components/games/page";
import Leaderboard from "@/components/leaderboard/Leaderboard";
import { useAuth } from "@/contexts/AuthContext";
import { use, useEffect } from "react";
import { Locale } from "@/i18n/settings";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "next/navigation";

export default function LocalizedHome({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  // Utilizziamo React.use() per accedere ai parametri
  const { locale } = use(params);
  const { user, userScore, isAuthenticated, isLoading } = useAuth();
  // Utilizziamo l'hook per le traduzioni
  const { t } = useTranslation(locale);

  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router, user, userScore]);

  // Non mostrare la classifica se l'utente non è autenticato o se è in caricamento
  if (!isAuthenticated || isLoading || !user || !userScore) {
    return (
      <div className="flex flex-col flex-grow w-full h-full">
        <GamesPage params={params} />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow w-full h-full">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center py-0 px-4 md:py-3">
          <h1 className="mb-5 text-6xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8257e6] via-[#c026d3] to-[#f59e0b]">
              {t("home.hello")} {userScore.user_nick}!
            </span>
          </h1>
          <p className="text-[#94a3b8] text-xl">
            {t("home.welcome1")}{" "}
            <span className="font-semibold text-white">
              {userScore.score} {t("home.points")}
            </span>{" "}
            {t("home.welcome2")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="hidden lg:block lg:col-span-1 bg-[#1e293b] rounded-lg border border-[#334155] p-4">
            <Leaderboard locale={locale} />
          </div>
          <div className="col-span-1 lg:col-span-2 bg-[#1e293b] rounded-lg border border-[#334155] p-4">
            <GamesPage params={params} />
          </div>
        </div>
      </div>
    </div>
  );
}
