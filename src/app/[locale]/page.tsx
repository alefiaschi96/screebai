"use client";

import GamesPage from "@/components/games/page";
import { useAuth } from "@/contexts/AuthContext";
import React, { use, useEffect, useState } from "react";
import { Locale } from "@/i18n/settings";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Leaderboard from "@/components/leaderboard/Leaderboard";

// Componente semplice per il loader
const LoadingIndicator = () => (
  <div className="flex justify-center items-center h-full w-full py-20">
    <div className="w-12 h-12 border-4 border-[#8257e6] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function LocalizedHome({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  // Utilizziamo React.use() per accedere ai parametri
  const { locale } = use(params);
  const { userScore, isLoading, isAuthenticated } = useAuth();
  // Utilizziamo l'hook per le traduzioni
  const { t } = useTranslation(locale);
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  // Reindirizza alla pagina di login se l'utente non è autenticato
  useEffect(() => {
    // Esegui il controllo solo quando lo stato di autenticazione è noto
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log("Redirecting to login");
        router.replace(`/${locale}/login`);
      } else {
        // Se l'utente è autenticato, segna il controllo come completato
        setAuthChecked(true);
      }
    }
  }, [isLoading, isAuthenticated, locale, router]);

  // Mostra un loader durante il caricamento o prima della redirezione
  if (isLoading || !authChecked) {
    return (
      <div className="flex flex-col flex-grow w-full h-full">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow w-full h-full">
      <div className="block absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        {/* Immagine principale di sfondo */}
        <Image
          src="/images/08-min.png"
          alt="Background"
          width={1200}
          height={800}
          className="absolute top-[43%] right-[0%] w-[200px] h-[200px] opacity-35 rotate-15"
          priority
        />

        {/* Immagini aggiuntive disposte casualmente - senza sovrapposizioni */}
        <Image
          src="/images/05-min.png"
          alt="Background element"
          width={300}
          height={300}
          className="absolute top-[15%] left-[5%] w-[200px] h-[200px] opacity-15"
        />

        <Image
          src="/images/10-min.png"
          alt="Background element"
          width={320}
          height={320}
          className="absolute bottom-[5%] left-[5%] w-[240px] h-[240px] opacity-20 -rotate-9"
        />
      </div>
      <div className="container mx-auto px-4 py-8 z-1">
        <div className="mb-8 text-center py-0 px-4 md:py-3">
          <h1 className="mb-5 text-6xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8257e6] via-[#c026d3] to-[#f59e0b]">
              {t("home.hello")} {userScore?.user_nick}!
            </span>
          </h1>
          {userScore && (
            <p className="text-[#94a3b8] text-xl">
              {t("home.welcome1")}{" "}
              <span className="font-semibold text-white">
                {userScore.score} {t("home.points")}
              </span>{" "}
              {t("home.welcome2")}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="hidden lg:block bg-[#1e293b] rounded-lg border border-[#334155] p-4">
            <Leaderboard locale={locale} maxEntries={5} />
          </div>
          <div className="bg-[#1e293b] rounded-lg border border-[#334155] p-4">
            <GamesPage params={params} />
          </div>

          {/* Messaggio per i gadget - visibile solo se l'utente ha giocato almeno una volta */}
          {userScore && userScore.score > 0 && (
            <div
              onClick={() =>
                window.open(
                  "https://tally.so/r/wMq66Y",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              className="z-10 col-span-1 lg:col-span-2 bg-[#1e293b] rounded-lg border border-[#334155] p-6 text-center cursor-pointer hover:bg-[#1a202c] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              role="button"
              aria-label={t("home.gadgetMessage")}
            >
              <span className="text-[#94a3b8] text-xl">
                {t("home.gadgetMessage1")}
                <br />
                {t("home.gadgetMessage2")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
