"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type LeaderboardEntry = {
  id: number;
  user_id: string;
  user_nick: string;
  score: number;
};

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { userScore } = useAuth();
  
  const itemsPerPage = 10;

  // Funzione per caricare i dati della classifica
  const fetchLeaderboard = async (pageNumber: number) => {
    try {
      setLoading(true);
      
      const from = pageNumber * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      const { data, error, count } = await supabase
        .from("scores")
        .select("*", { count: "exact" })
        .order("score", { ascending: false })
        .range(from, to);
      
      if (error) {
        throw error;
      }
      
      // Se è la prima pagina, sostituisci i dati
      // altrimenti aggiungi ai dati esistenti
      if (pageNumber === 0) {
        setLeaderboardData(data as LeaderboardEntry[]);
      } else {
        setLeaderboardData(prev => [...prev, ...(data as LeaderboardEntry[])]);
      }
      
      // Verifica se ci sono altre pagine
      setHasMore(count ? from + data.length < count : false);
      
    } catch (err) {
      setError("Errore nel caricamento della classifica");
      console.error("Error fetching leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // Carica la prima pagina all'avvio
  useEffect(() => {
    fetchLeaderboard(0);
  }, []);

  // Funzione per caricare più risultati
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchLeaderboard(page + 1);
      setPage(page + 1);
    }
  };

  // Funzione per ricaricare la classifica
  const refreshLeaderboard = () => {
    setPage(0);
    fetchLeaderboard(0);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Classifica Giocatori</h2>
        <button 
          onClick={refreshLeaderboard}
          className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Aggiorna
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posizione
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giocatore
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Punteggio
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboardData.map((entry, index) => (
              <tr 
                key={entry.id} 
                className={userScore?.user_id === entry.user_id ? "bg-indigo-50" : ""}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {index + 1 + page * itemsPerPage}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={userScore?.user_id === entry.user_id ? "font-semibold text-indigo-600" : ""}>
                    {entry.user_nick}
                    {userScore?.user_id === entry.user_id && " (Tu)"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="font-medium">{entry.score}</span> punti
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {loading && (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
        </div>
      )}
      
      {!loading && hasMore && (
        <div className="flex justify-center mt-4">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
          >
            Carica altri
          </button>
        </div>
      )}
      
      {!loading && leaderboardData.length === 0 && !error && (
        <div className="text-center py-4 text-gray-500">
          Nessun dato disponibile nella classifica
        </div>
      )}
    </div>
  );
}
