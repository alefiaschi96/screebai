"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type LeaderboardEntry = {
  id: number;
  user_id: string;
  user_nick: string;
  score: number;
  position?: number; // Posizione reale nella classifica
};

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [, setHasMore] = useState(true);
  const { userScore } = useAuth();
  const [, setAllScoresData] = useState<{ id: number; position: number }[]>([]);

  const itemsPerPage = 10;

  // Funzione per caricare i dati della classifica con i primi 2 e quelli vicini all'utente
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      // Prima ottieni tutti i punteggi ordinati per avere la classifica completa
      const { data: allScores, error: rankError } = await supabase
        .from("scores")
        .select("id, user_id, score")
        .order("score", { ascending: false });

      if (rankError) throw rankError;

      // Salva le posizioni di tutti i giocatori
      const positionsMap = allScores.map((score, index) => ({
        id: score.id,
        position: index + 1,
      }));
      setAllScoresData(positionsMap);

      if (!userScore) {
        // Se non c'è un utente loggato, carica solo i primi 5
        const { data, error } = await supabase
          .from("scores")
          .select("*")
          .order("score", { ascending: false })
          .limit(5);

        if (error) throw error;

        // Aggiungi le posizioni reali
        const dataWithPositions = (data as LeaderboardEntry[]).map((entry) => {
          const posInfo = positionsMap.find((p) => p.id === entry.id);
          return {
            ...entry,
            position: posInfo ? posInfo.position : 0,
          };
        });

        setLeaderboardData(dataWithPositions);
        setHasMore(false);
        return;
      }

      // Trova l'indice dell'utente corrente
      const userIndex = allScores.findIndex(
        (score) => score.user_id === userScore.user_id
      );

      if (userIndex === -1) {
        throw new Error("Utente non trovato nella classifica");
      }

      // Ottieni i primi 2 della classifica
      const { data: topTwoData, error: topTwoError } = await supabase
        .from("scores")
        .select("*")
        .order("score", { ascending: false })
        .limit(2);

      if (topTwoError) throw topTwoError;

      // Se l'utente è tra i primi 2, mostra solo i primi 5
      if (userIndex < 2) {
        const { data: topFiveData, error: topFiveError } = await supabase
          .from("scores")
          .select("*")
          .order("score", { ascending: false })
          .limit(5);

        if (topFiveError) throw topFiveError;

        // Aggiungi le posizioni reali
        const dataWithPositions = (topFiveData as LeaderboardEntry[]).map(
          (entry) => {
            const posInfo = positionsMap.find((p) => p.id === entry.id);
            return {
              ...entry,
              position: posInfo ? posInfo.position : 0,
            };
          }
        );

        setLeaderboardData(dataWithPositions);
      } else {
        // Calcola l'intervallo di posizioni vicine all'utente
        const startIndex = Math.max(2, userIndex - 1); // Inizia da 2 per escludere i primi 2
        // Assicuriamoci di mostrare almeno 3 giocatori dopo i primi 2
        const minEndIndex = Math.max(4, userIndex + 1); // Almeno fino alla posizione 5
        const endIndex = Math.min(allScores.length - 1, minEndIndex);

        console.log("startIndex", startIndex, "minEndIndex", minEndIndex, "endIndex", endIndex);

        // Ottieni i dati completi per questo intervallo
        const { data: nearUserData, error: nearUserError } = await supabase
          .from("scores")
          .select("*")
          .order("score", { ascending: false })
          .range(startIndex, endIndex);

        if (nearUserError) throw nearUserError;

        // Combina i primi 2 con quelli vicini all'utente
        const combinedData = [
          ...(topTwoData as LeaderboardEntry[]),
          ...(nearUserData as LeaderboardEntry[]),
        ];

        // Rimuovi eventuali duplicati (nel caso l'utente sia tra i primi 2)
        const uniqueData = combinedData.filter(
          (entry, index, self) =>
            index === self.findIndex((e) => e.id === entry.id)
        );

        // Aggiungi le posizioni reali
        const dataWithPositions = uniqueData.map((entry) => {
          const posInfo = positionsMap.find((p) => p.id === entry.id);
          return {
            ...entry,
            position: posInfo ? posInfo.position : 0,
          };
        });

        setLeaderboardData(dataWithPositions);
      }

      // Non c'è più bisogno di caricare altre pagine
      setHasMore(false);
      // Salva la posizione iniziale per mostrare il numero corretto
      setPage(0);
    } catch (err) {
      setError("Errore nel caricamento della classifica");
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // Carica la classifica all'avvio
  useEffect(() => {
    fetchLeaderboard();
  }, [userScore]); // Ricarica quando cambia l'utente

  // Funzione per ricaricare la classifica
  const refreshLeaderboard = () => {
    fetchLeaderboard();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold">Classifica</h2>
        <button
          onClick={refreshLeaderboard}
          className="text-sm font-medium flex items-center rounded-full px-3 py-1"
          style={{ backgroundColor: "var(--secondary)", color: "white" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Aggiorna
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Layout a card per tutti i dispositivi */}
      <div className="space-y-2 overflow-y-auto flex-grow pb-2">
        {leaderboardData.map((entry, index) => {
          // Usa la posizione reale salvata nell'entry
          const position = entry.position || index + 1;

          // Determina se questa entry è uno dei primi 2 giocatori
          const isTopTwo = position <= 2;

          // Determina se dobbiamo mostrare un separatore dopo questa entry
          // (mostra il separatore dopo il secondo giocatore, ma solo se ci sono altri giocatori dopo)
          const showSeparator =
            position === 2 &&
            leaderboardData.length > 2 &&
            // Verifica che il prossimo giocatore non sia in posizione 3
            // (questo accade quando l'utente è in posizione 3 o vicino)
            Math.floor(page * itemsPerPage) + (index + 1) + 1 > 3;

          return (
            <React.Fragment key={entry.id}>
              <div
                className={`rounded-lg border p-2 flex items-center 
                  ${
                    userScore?.user_id === entry.user_id
                      ? "border-primary"
                      : "border-gray-200"
                  }
                  ${isTopTwo ? "border-primary" : ""}`}
                style={{
                  backgroundColor: userScore?.user_id === entry.user_id ? "rgba(44, 87, 112, 0.1)" : "white",
                }}
              >
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mr-2`}
                  style={{ 
                    backgroundColor: isTopTwo ? "var(--primary)" : "var(--secondary)",
                    color: "white"
                  }}
                >
                  <span className="font-bold text-sm">
                    {position}
                  </span>
                </div>
                <div className="flex-grow truncate">
                  <div
                    className="font-medium text-sm truncate"
                    style={{
                      color: userScore?.user_id === entry.user_id 
                        ? "var(--primary-dark)" 
                        : isTopTwo 
                        ? "var(--secondary-dark)" 
                        : "var(--secondary-dark)"
                    }}
                  >
                    {entry.user_nick}
                    {userScore?.user_id === entry.user_id && " (Tu)"}
                  </div>
                </div>
                <div
                  className="flex-shrink-0 px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: isTopTwo ? "var(--primary)" : "var(--secondary)",
                    color: "white"
                  }}
                >
                  <span className="font-medium text-sm">
                    {entry.score}
                  </span>
                </div>
              </div>

              {/* Separatore tra i top 2 e gli altri */}
              {showSeparator && (
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" style={{ borderColor: "var(--light-blue)" }}></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 text-xs font-medium rounded-full py-1" style={{ backgroundColor: "var(--secondary)", color: "white" }}>
                      La tua posizione
                    </span>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {loading && (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {/* Non mostriamo più il pulsante 'Carica altri' poiché ora mostriamo solo un intervallo specifico */}

      {!loading && leaderboardData.length === 0 && !error && (
        <div className="text-center py-4 text-gray-500">
          Nessun dato disponibile nella classifica
        </div>
      )}
    </div>
  );
}
