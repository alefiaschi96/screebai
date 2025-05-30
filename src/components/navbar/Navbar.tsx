"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocale } from "@/hooks/useLocale";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const { user, signOut, isLoading, userScore } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { currentLocale: locale } = useLocale();

  const pendingHref = useRef<string | null>(null);

  useEffect(() => {
    if (isNavigating && pendingHref.current && pathname === pendingHref.current) {
      setIsMenuOpen(false);
      setIsNavigating(false);
      pendingHref.current = null;
    }
  }, [pathname, isNavigating]);

  const handleNav = (href: string) => {
    if (href !== pathname) {
      setIsNavigating(true);
      pendingHref.current = href;
      
      // Assicuriamoci che l'href contenga sempre la lingua corrente
      if (!href.startsWith(`/${locale}`)) {
        href = `/${locale}${href.startsWith('/') ? href : `/${href}`}`;
      }
      
      router.push(href);
    } else {
      setIsMenuOpen(false);
    }
  };

  const { t } = useTranslation(locale);

  return (
    <nav className="bg-[#0f172a] border-b border-[#334155]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <button
                onClick={() => handleNav(`/${locale}`)}
                className="flex items-center focus:outline-none"
              >
                <span className="text-xl sm:text-2xl font-bold text-[#f59e0b]">
                  <span className="text-[#6366f1]">Co</span>games
                </span>
              </button>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {!isLoading && (
              <>
                {user && userScore ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-white font-bold">
                      {userScore.user_nick || user.email}
                    </span>
                    <span className="text-sm text-[#94a3b8] font-bold">
                      {t("navbar.points")}:{" "}
                      <span className="text-[#f59e0b]">{userScore.score}</span>
                    </span>
                    {/* Language Switcher */}
                    <div className="mr-4">
                      <LanguageSwitcher />
                    </div>
                    <button
                      onClick={signOut}
                      className="btn-primary inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white"
                      style={{ backgroundColor: "#6366f1" }}
                    >
                      {t("navbar.logout")}
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Language Switcher */}
                    <div className="mr-4">
                      <LanguageSwitcher />
                    </div>
                    <button
                      onClick={() => handleNav(`/${locale}/login`)}
                      className="btn-primary inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white"
                      style={{ backgroundColor: "#6366f1" }}
                    >
                      {t("navbar.login")}
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile menu */}
          <div className="flex items-center sm:hidden space-x-2">
            {!isLoading && user && (
              <button
                onClick={() => handleNav(`/${locale}/leaderboard`)}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md hover:bg-[#1e293b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f172a] focus:ring-[#6366f1]"
                style={{ color: "#6366f1" }}
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                {t("navbar.leaderboard")}
              </button>
            )}

            {/* Menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-[#1e293b] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#6366f1]"
              aria-expanded={isMenuOpen ? "true" : "false"}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">{t("navbar.menu")}</span>
              {/* Icon when menu is closed */}
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden bg-[#0f172a]">
          <div className="flex flex-col h-full">
            {/* Menu header with close button */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#334155]">
              <div className="font-bold text-xl" onClick={() => handleNav(`/${locale}`)}>
                <span className="text-[#6366f1]">Co</span>
                <span className="text-[#f59e0b]">games</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-[#1e293b]"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Menu content */}
            <div className="flex-grow overflow-y-auto">
              {!isLoading && (
                <div className="p-6">
                  {user && userScore ? (
                    <div className="space-y-6">
                      {/* User info */}
                      <div className="bg-[#1e293b] rounded-lg p-4 text-center border border-[#334155]">
                        <div className="text-lg font-bold mb-1 text-white">
                          {userScore.user_nick || user.email}
                        </div>
                        <div className="text-[#94a3b8]">
                          {t("navbar.points")}{" "}
                          <span className="font-bold text-[#f59e0b]">
                            {userScore.score}
                          </span>
                        </div>
                      </div>

                      {/* Navigation links */}
                      <div className="space-y-3">
                        <button
                          onClick={() => handleNav(`/${locale}`)}
                          className="flex items-center justify-between w-full p-3 bg-[#1e293b] border border-[#334155] rounded-lg hover:bg-[#2d3748] text-left"
                        >
                          <span className="text-white font-medium">
                            {t("navbar.games")}
                          </span>
                          <svg
                            className="h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleNav(`/${locale}/leaderboard`)}
                          className="flex items-center justify-between w-full p-3 bg-[#1e293b] border border-[#334155] rounded-lg hover:bg-[#2d3748] text-left"
                        >
                          <span className="text-white font-medium">
                            {t("navbar.leaderboard")}
                          </span>
                          <svg
                            className="h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>

                        {/* Language switcher */}
                        <div className="bg-[#1e293b] rounded-lg p-3 border border-[#334155]">
                          <div className="flex flex-col space-y-2">
                            <span className="text-white font-medium text-center mb-2">
                              {t("navbar.language")}
                            </span>
                            <LanguageSwitcher isMobile={true} />
                          </div>
                        </div>
                      </div>

                      {/* Logout button */}
                      <button
                        onClick={() => {
                          signOut();
                          setIsMenuOpen(false);
                        }}
                        className="w-full p-3 text-white rounded-lg font-medium hover:opacity-90 transition-colors"
                        style={{ backgroundColor: "#6366f1" }}
                      >
                        {t("navbar.logout")}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Language switcher */}
                      <div className="bg-[#1e293b] rounded-lg p-4 border border-[#334155]">
                        <div className="flex flex-col space-y-2">
                          <span className="text-white font-medium text-center mb-2">
                            {t("navbar.language")}
                          </span>
                          <LanguageSwitcher isMobile={true} />
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <button
                          onClick={() => handleNav(`/${locale}/login`)}
                          className="p-3 text-white rounded-lg font-medium hover:opacity-90 transition-colors w-full"
                          style={{ backgroundColor: "#6366f1" }}
                        >
                          {t("navbar.login")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
