"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function GamesPage() {
  const { user, userScore, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router, user, userScore]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Show games page only if authenticated
  if (!isAuthenticated || !user || !userScore) {
    return null; // Will redirect to login via useEffect
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-2">
          Ciao, <span className="text-indigo-600">{userScore.user_nick}</span>!
        </h1>
        <p className="text-gray-600 mb-4">
          Benvenuto nella tua dashboard di gioco. Attualmente hai{" "}
          <span className="font-semibold text-indigo-600">
            {userScore.score} punti
          </span>{" "}
          in classifica.
        </p>
      </div>

      <h2 className="text-xl font-bold mb-4">Giochi disponibili</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Gioco 1 - Disegno (già sviluppato) */}
        <Link href="/games/screebai" className="block">
          <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
            <div className="h-40 bg-indigo-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">Disegna la Parola</h3>
              <p className="text-gray-600 text-sm">
                Disegna la parola indicata e fai indovinare all&apos;AI cosa hai
                disegnato.
              </p>
            </div>
          </div>
        </Link>

        {/* Gioco 2 - In sviluppo */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden opacity-70">
          <div className="h-40 bg-gray-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg mb-1">Indovina la Parola</h3>
            <p className="text-gray-600 text-sm">
              In arrivo presto! Indovina la parola dalle immagini generate
              dall&apos;AI.
            </p>
            <span className="inline-block mt-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
              In arrivo
            </span>
          </div>
        </div>

        {/* Gioco 3 - In sviluppo */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden opacity-70">
          <div className="h-40 bg-gray-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg mb-1">Quiz di Conoscenza</h3>
            <p className="text-gray-600 text-sm">
              In arrivo presto! Metti alla prova la tua conoscenza con domande
              generate dall&apos;AI.
            </p>
            <span className="inline-block mt-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
              In arrivo
            </span>
          </div>
        </div>

        {/* Gioco 4 - In sviluppo */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden opacity-70">
          <div className="h-40 bg-gray-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-lg mb-1">Sfida Creativa</h3>
            <p className="text-gray-600 text-sm">
              In arrivo presto! Crea storie e contenuti seguendo i suggerimenti
              dell&apos;AI.
            </p>
            <span className="inline-block mt-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
              In arrivo
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
