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

export default function Leaderboard({ locale }: { locale: Locale }) {
  const { t } = useTranslation(locale);
  const { userScore } = useAuth();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("scores")
        .select("id, user_id, user_nick, score")
        .order("score", { ascending: false });

      if (error) throw error;

      const leaderboardData: LeaderboardEntry[] = data.map((entry, index) => ({
        ...entry,
        position: index + 1,
      }));

      let displayedData;

      if (!userScore) {
        displayedData = leaderboardData.slice(0, 5);
      } else {
        const userPosition = leaderboardData.findIndex((e) => e.user_id === userScore.user_id);

        if (userPosition === -1 || userPosition < 2) {
          displayedData = leaderboardData.slice(0, 5);
        } else {
          const start = Math.max(0, userPosition - 1);
          const end = Math.min(leaderboardData.length, userPosition + 2);
          displayedData = [
            ...leaderboardData.slice(0, 2),
            ...leaderboardData.slice(start, end),
          ];
          displayedData = Array.from(new Set(displayedData));
        }
      }

      setLeaderboard(displayedData);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError(t("leaderboard.fetchError"));
    } finally {
      setLoading(false);
    }
  }, [userScore, t]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center mb-4">
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8257e6] via-[#c026d3] to-[#f59e0b]">
          {t("common.leaderboard")}
        </span>
      </div>

      {error && (
        <div className="bg-red-900 bg-opacity-20 border-l-4 border-red-600 p-4 mb-4 rounded">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

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
            <div className="flex-shrink-0 font-bold text-xl" style={{ color: "#64748b" }}>
              {entry.score}
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6366f1]"></div>
        </div>
      )}

      {!loading && leaderboard.length === 0 && !error && (
        <div className="text-center py-4 text-gray-400">
          {t("leaderboard.noData")}
        </div>
      )}
    </div>
  );
}