"use client";

import { use, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { generateNickname } from "@/data/nicknames";
import { useRouter } from "next/navigation";
import { Locale } from "@/i18n/settings";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";

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
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);
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
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Verifica che l'utente abbia accettato l'informativa privacy se sta registrandosi
    if (!isLogin && !privacyAccepted) {
      setError(t("login.error.privacyRequired"));
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Handle login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Redirect immediato
        router.push(`/${locale}`);
      } else {
        // Handle registration
        const uniqueUsername = await generateUniqueNickname();

        // Registra l'utente con il nickname generato
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              consent_service: privacyAccepted,
              consent_marketing: marketingAccepted,
            },
          },
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
              console.error(t("errors.scoreCreation") + ":", scoreError);
            }
          }
        }

        // Redirect immediato
        router.push(`/${locale}`);
      }
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : t("login.error.generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-2 sm:p-6 lg:p-8 relative" style={{ zIndex: 1 }}>
      {/* Immagine di sfondo visibile solo su desktop */}
      <div className="block absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <Image
          src="/images/08-min.png"
          alt="Background"
          width={1200}
          height={800}
          className="object-contain w-full h-full opacity-20 -translate-y-10"
          priority
        />
      </div>
      {/* Contenitore principale diviso in due colonne */}
      <div className="w-full max-w-7xl flex flex-col sm:flex-row md:shadow-xl rounded-xl overflow-hidden my-auto relative z-10">
        {/* Colonna sinistra con il testo promozionale - visibile solo su desktop */}
        <div className="hidden sm:flex w-1/2 bg-indigo-600 text-white p-8 sm:p-10 lg:p-12 items-center justify-center">
          <div className="text-center space-y-6 lg:space-y-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {t("login.promo.title")}
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl">
              {t("login.promo.description").split(" ").length > 8 ? (
                <>
                  {t("login.promo.description")
                    .split(" ")
                    .slice(0, 5)
                    .join(" ")}
                  <br />
                  {t("login.promo.description")
                    .split(" ")
                    .slice(5, 11)
                    .join(" ")}
                  <br />
                  {t("login.promo.description").split(" ").slice(11).join(" ")}
                </>
              ) : (
                t("login.promo.description")
              )}
            </p>
          </div>
        </div>

        {/* Colonna destra con il form di login/registrazione */}
        <div className="w-full sm:w-1/2 p-6 sm:p-8 lg:p-10">
          {/* Solo per mobile: testo promozionale in cima */}
          <div className="sm:hidden text-center space-y-3 mb-10">
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-indigo-600 leading-tight">
              {t("login.promo.title")}
            </h3>
            <p className="text-base text-gray-600 px-4">
              {t("login.promo.description")}
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-6">
            <div>
              <h3 className="text-center text-xl sm:text-3xl font-extrabold text-gray-900 mb-2 text-black">
                {isLogin ? t("login.title") : t("login.register")}
              </h3>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
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
                    className={`appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                      isLogin ? "rounded-t-md" : ""
                    } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base sm:text-sm`}
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
                    className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base sm:text-sm"
                    placeholder={t("login.password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Checkbox per l'informativa privacy (mostrata solo durante la registrazione) */}
              {!isLogin && (
                <>
                  <div className="flex items-start mt-4">
                    <div className="flex items-center h-5">
                      <input
                        id="privacy-policy"
                        name="privacy-policy"
                        type="checkbox"
                        checked={privacyAccepted}
                        onChange={(e) => setPrivacyAccepted(e.target.checked)}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="privacy-policy"
                        className="font-medium text-gray-700"
                      >
                        {t("login.privacyConsent")}{" "}
                        <Link
                          href="https://dma3sqtfdohvv.cloudfront.net/pdf/Informativa_privacy_CoGames.pdf"
                          target="_blank"
                          className="text-indigo-600 hover:text-indigo-500"
                        >
                          {t("login.privacyPolicy")}
                        </Link>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-start mt-4">
                    <div className="flex items-center h-5">
                      <input
                        id="privacy-policy"
                        name="privacy-policy"
                        type="checkbox"
                        checked={marketingAccepted}
                        onChange={(e) => setMarketingAccepted(e.target.checked)}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="privacy-policy"
                        className="font-medium text-gray-700"
                      >
                        {t("login.marketingConsent")}{" "}
                        <Link
                          href="https://dma3sqtfdohvv.cloudfront.net/pdf/Informativa_privacy_CoGames.pdf"
                          target="_blank"
                          className="text-indigo-600 hover:text-indigo-500"
                        >
                          {t("login.privacyPolicy")}
                        </Link>
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading
                    ? t("login.loading")
                    : isLogin
                    ? t("login.login")
                    : t("login.register")}
                </button>
              </div>

              <div className="text-base sm:text-sm text-center text-gray-600 mt-4">
                {isLogin ? (
                  <p>
                    {t("navbar.needAccount")}{" "}
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
                    {t("navbar.alreadyAccount")}{" "}
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
      </div>
    </div>
  );
}
