"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const { user, signOut, isLoading, userScore } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold" style={{ color: "var(--secondary)" }}>
                  <span style={{ color: "var(--primary)" }}>Co</span>games
                </span>
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {!isLoading && (
              <>
                {user && userScore ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 font-bold">
                      {userScore.user_nick || user.email}
                    </span>
                    <span className="text-sm text-gray-500 font-bold">
                      Punti attuali: {userScore.score}
                    </span>
                    <button
                      onClick={signOut}
                      className="btn-primary inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white"
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="btn-primary inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    Login
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile menu */}
          <div className="flex items-center sm:hidden space-x-2">
            {!isLoading && user && (
              <Link
                href="/leaderboard"
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                Classifica
              </Link>
            )}
            
            {/* Menu button */}
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-expanded={isMenuOpen ? "true" : "false"}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
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
        <div className="fixed inset-0 z-50 sm:hidden bg-white">
          <div className="flex flex-col h-full">
            {/* Menu header with close button */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div className="font-bold text-xl text-indigo-600">Cogames</div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
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
                      <div className="bg-indigo-50 rounded-lg p-4 text-center">
                        <div className="text-lg font-bold text-indigo-700 mb-1">
                          {userScore.user_nick || user.email}
                        </div>
                        <div className="text-indigo-600">
                          Punti attuali: <span className="font-bold">{userScore.score}</span>
                        </div>
                      </div>
                      
                      {/* Navigation links */}
                      <div className="space-y-3">
                        <Link
                          href="/"
                          className="flex items-center justify-between w-full p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <span className="text-gray-800 font-medium">I miei giochi</span>
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </Link>
                        
                        <Link
                          href="/leaderboard"
                          className="flex items-center justify-between w-full p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <span className="text-gray-800 font-medium">Classifica</span>
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      </div>
                      
                      {/* Logout button */}
                      <button
                        onClick={() => {
                          signOut();
                          setIsMenuOpen(false);
                        }}
                        className="w-full p-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <Link
                        href="/login"
                        className="p-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </Link>
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
