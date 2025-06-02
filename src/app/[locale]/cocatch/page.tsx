"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CoCatch from "@/components/cocatch/CoCatch";
import { useLocale } from "@/hooks/useLocale";

export default function Cocatch() {
  const { user, userScore, isAuthenticated, isLoading } = useAuth();
  const { currentLocale: locale } = useLocale();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isLoading, isAuthenticated, router, locale]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0f172a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6366f1]"></div>
      </div>
    );
  }

  // Show games page only if authenticated
  if (!isAuthenticated || !user || !userScore) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0f172a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6366f1]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow w-full h-full bg-[#0f172a]">
      <CoCatch />
    </div>
  );
}
