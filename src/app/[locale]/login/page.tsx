"use client";

import { use, useState } from "react";
import { supabase } from "@/lib/supabase";
import { generateNickname } from "@/data/nicknames";
import { useRouter } from "next/navigation";
import { Locale } from "@/i18n/settings";
import { useTranslation } from "@/hooks/useTranslation";

export default function LoginPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = use(params);
  const { t } = useTranslation(locale);
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
        console.error(t("errors.nicknameVerification") + ":", error);
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
          setError(t("login.error.emailExists"));
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
                t("errors.scoreCreation") + ":",
                scoreError
              );
            }
          }
        }

        // Redirect immediato
        router.push("/");
      }
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : t("login.error.generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? t("login.title") : t("login.register")}
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
                {t("login.email")}
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
                placeholder={t("login.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                {t("login.password")}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t("login.password")}
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
              {loading
                ? t("login.loading")
                : isLogin
                ? t("login.login")
                : t("login.register")}
            </button>
          </div>

          <div className="text-sm text-center text-gray-600">
            {isLogin ? (
              <p>
                {t("navbar.needAccount")}
                <button
                  type="button"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                  onClick={() => setIsLogin(false)}
                >
                  {t("navbar.registerCTA")}
                </button>
              </p>
            ) : (
              <p>
                {t("navbar.alreadyAccount")}
                <button
                  type="button"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                  onClick={() => setIsLogin(true)}
                >
                  {t("navbar.loginCTA")}
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
