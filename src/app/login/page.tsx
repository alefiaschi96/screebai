"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { generateNickname } from "@/data/nicknames";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Funzione per generare un nickname unico che non sia già in uso
  const generateUniqueNickname = async (): Promise<string> => {
    let isUnique = false;
    let nickname = "";

    while (!isUnique) {
      nickname = generateNickname();

      const { data, error } = await supabase
        .from("scores")
        .select("user_nick")
        .eq("user_nick", nickname)
        .maybeSingle();

      if (error) {
        console.error("Errore durante la verifica del nickname:", error);
        continue;
      }

      if (!data) {
        isUnique = true;
      }
    }

    return nickname;
  };

  // Handle form submission for both login and signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Handle login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Redirect immediato
        router.push("/");
      } else {
        // Handle registration
        const uniqueUsername = await generateUniqueNickname();

        // Registra l'utente con il nickname generato
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        // Show success message or redirect
        if (data.user?.identities?.length === 0) {
          setError("An account with this email already exists.");
        } else {
          // Crea un nuovo record nella tabella scores
          if (data.user) {
            const { error: scoreError } = await supabase.from("scores").insert([
              {
                user_id: data.user.id,
                user_nick: uniqueUsername,
                score: 0,
              },
            ]);

            if (scoreError) {
              console.error(
                "Errore durante la creazione del record di punteggio:",
                scoreError
              );
            }
          }
        }

        // Redirect immediato
        router.push("/");
      }
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? "Sign in to your account" : "Create a new account"}
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                  isLogin ? "rounded-t-md" : ""
                } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? "Processing..." : isLogin ? "Sign in" : "Sign up"}
            </button>
          </div>

          <div className="text-sm text-center">
            <button
              type="button"
              className="font-medium text-indigo-600 hover:text-indigo-500"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Need an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
