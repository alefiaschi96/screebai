"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Locale } from "@/i18n/settings";
import { useTranslation } from "@/hooks/useTranslation";

export type LeaderboardEntry = {
  id: number;
  user_id: string;
  user_nick: string;
  score: number;
  position: number;
};

export default function Leaderboard({ locale, maxEntries = 10 }: { locale: Locale; maxEntries?: number }) {
  const { t } = useTranslation(locale);
  const { userScore } = useAuth();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  /**
   * Recupera la classifica completa da Supabase
   */
  const fetchFullLeaderboard = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("scores")
        .select("id, user_id, user_nick, score")
        .order("score", { ascending: false });

      if (error) throw error;
      
      // Mappa i dati e assegna le posizioni
      return data.map((entry, index) => ({
        ...entry,
        position: index + 1,
      }));
    } catch (err) {
      console.error("Error fetching full leaderboard:", err);
      throw err;
    }
  }, []);

  /**
   * Recupera la classifica da Supabase con possibilità di filtrare per nome
   * @param search Termine di ricerca opzionale per filtrare i risultati
   */
  const fetchLeaderboard = useCallback(async (search?: string) => {
    if (search) {
      setIsSearching(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      // Prima otteniamo la classifica completa per avere le posizioni corrette
      const fullLeaderboard = await fetchFullLeaderboard();
      
      // Se non c'è un termine di ricerca, mostriamo la classifica troncata in base a maxEntries
      if (!search || search.trim() === "") {
        setLeaderboard(fullLeaderboard.slice(0, maxEntries));
        return;
      }
      
      // Filtriamo la classifica completa per nome, mantenendo le posizioni originali
      const filteredData = fullLeaderboard.filter(entry => 
        entry.user_nick.toLowerCase().includes(search.trim().toLowerCase())
      );
      
      // Anche nei risultati di ricerca, rispettiamo il limite di maxEntries
      setLeaderboard(filteredData.slice(0, maxEntries));
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError(t("leaderboard.fetchError"));
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [t]);

  // Carica la classifica all'avvio
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);
  
  // Gestisce il cambiamento nel campo di ricerca con debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Utilizziamo un timeout per evitare troppe chiamate API mentre l'utente digita
    const debounceTimeout = setTimeout(() => {
      fetchLeaderboard(value);
    }, 500); // Aspetta 500ms dopo l'ultima digitazione
    
    // Pulizia del timeout se l'utente digita ancora prima che scada
    return () => clearTimeout(debounceTimeout);
  };
  
  // Gestisce il click sul pulsante di ricerca
  const handleSearchClick = () => {
    fetchLeaderboard(searchTerm);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center mb-4 gap-3 pt-3">
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8257e6] via-[#c026d3] to-[#f59e0b]">
          {t("common.leaderboard")}
        </span>
        
        <div className="flex-grow">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg 
                className="h-5 w-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
              placeholder={t("leaderboard.searchPlaceholder")}
              className="w-full pl-10 pr-4 py-2 border border-[#334155] rounded-md bg-[#1e293b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleSearchClick}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-[#1e293b] hover:bg-[#2d3748] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f172a] focus:ring-[#6366f1]"
            disabled={isSearching}
          >
            <svg
              className="mr-1 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {t("leaderboard.search")}
          </button>
          
          <button
            onClick={() => {
              setSearchTerm("");
              fetchLeaderboard();
            }}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-[#1e293b] hover:bg-[#2d3748] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f172a] focus:ring-[#6366f1]"
            disabled={loading}
          >
            <svg
              className="mr-1 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {t("leaderboard.refresh")}
          </button>
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto flex-grow pb-2 px-1">
        {leaderboard.map((entry) => (
          <div
            key={entry.id}
            className="rounded-2xl py-2.5 px-4 flex items-center"
            style={{
              background:
                userScore?.user_id === entry.user_id
                  ? "linear-gradient(90deg, rgba(131, 90, 207, 0.2) 0%, rgba(140, 121, 235, 0.1) 100%)"
                  : "#2a3852",
            }}
          >
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3"
              style={{
                background:
                  entry.position === 1
                    ? "#f59e0b"
                    : entry.position === 2
                    ? "#94a3b8"
                    : entry.position === 3
                    ? "#b45309"
                    : userScore?.user_id === entry.user_id
                    ? "rgba(195, 182, 70, 0.53)"
                    : "#334155",
                color: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              <span className="font-bold text-sm">{entry.position}</span>
            </div>
            <div className="flex-grow truncate text-white font-medium text-base">
              {entry.user_nick}
              {userScore?.user_id === entry.user_id && " (Tu)"}
            </div>
            <div
              className="flex-shrink-0 font-bold text-xl"
              style={{ color: "#64748b" }}
            >
              {entry.score}
            </div>
          </div>
        ))}
      </div>

      {(loading || isSearching) ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6366f1]"></div>
        </div>
      ) : error ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="text-red-500">{error}</div>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="flex-grow flex items-center justify-center">
          {searchTerm ? (
            <div className="text-gray-500">{t("leaderboard.noResults")}</div>
          ) : (
            <div className="text-gray-500">{t("leaderboard.noData")}</div>
          )}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
