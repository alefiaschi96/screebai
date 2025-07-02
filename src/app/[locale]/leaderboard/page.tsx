"use client";

import { useAuth } from "@/contexts/AuthContext";
import Leaderboard from "@/components/leaderboard/Leaderboard";
import { Locale } from "@/i18n/settings";
import { use } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export default function LeaderboardPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = use(params);
  const { t } = useTranslation(locale);
  const { isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0f172a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6366f1]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 h-full flex flex-col bg-[#0f172a]">
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {t("leaderboard.title")}
        </h1>
        <p className="text-gray-400">
          {t("leaderboard.description")}
        </p>
      </div>
      <div className="flex-grow overflow-hidden rounded-lg">
        <Leaderboard locale={locale} maxEntries={20} />
      </div>
    </div>
  );
}
