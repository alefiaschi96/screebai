"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Leaderboard from "@/components/Leaderboard";

export default function LeaderboardPage() {
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
    <div className="container mx-auto px-4 py-8 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">Classifica Giocatori</h1>
      <Leaderboard />
    </div>
  );
}
