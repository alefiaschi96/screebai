"use client";

import GamesPage from "@/app/games/page";
import Leaderboard from "@/components/Leaderboard";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  // Non mostrare la classifica se l'utente non è autenticato o se è in caricamento
  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex flex-col flex-grow w-full h-full">
        <GamesPage />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow w-full h-full">
      <div className="container mx-auto px-4 py-8 overflow-y-auto">
        {/* Layout a due colonne per schermi più grandi */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonna laterale con la classifica (visibile solo su desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <Leaderboard />
          </div>
          {/* Colonna principale con la dashboard dei giochi */}
          <div className="col-span-1 lg:col-span-2">
            <GamesPage />
          </div>
        </div>
      </div>
    </div>
  );
}
