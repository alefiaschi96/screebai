"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Leaderboard from "@/components/leaderboard/Leaderboard";
import { Locale } from "@/i18n/settings";
import { use } from "react";

export default function LeaderboardPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = use(params);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Show page only if authenticated
  if (!isAuthenticated) {
    return null; // Will redirect to login via useEffect
  }

  return (
    <div className="container mx-auto px-4 py-4 h-full flex flex-col">
      <div className="flex-grow overflow-hidden">
        <Leaderboard locale={locale} />
      </div>
    </div>
  );
}
