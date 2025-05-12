"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getRandomWord } from "@/data/words";
import { analyzeDrawing } from "../../services/openaiService";
import ScreebaiCanvas from "./ScreebaiCanvas";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { Locale } from "@/i18n/settings";

const ScreebAi = () => {
  const params = useParams();
  const locale = (params?.locale as Locale) || "it";
  const { t } = useTranslation(locale);
  const { user, userScore, updateScore } = useAuth();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubmittedRef = useRef(false);
  const scoreRef = useRef(0);
  const wordRef = useRef("");

  const MAX_ATTEMPTS = parseInt(process.env.NEXT_PUBLIC_MAX_ATTEMPTS || "5");
  const MAX_TIME_PER_ATTEMPT = parseInt(
    process.env.NEXT_PUBLIC_TIME_PER_ATTEMPT || "60"
  );
  const WAIT_AFTER_RESULT =
    parseInt(process.env.NEXT_PUBLIC_TIME_PER_WAITING || "3") * 1000;
  const POINTS_PER_ATTEMPT = parseInt(
    process.env.NEXT_PUBLIC_POINTS_PER_ATTEMPT || "1"
  );

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = useCallback(() => {
    setTimeLeft(MAX_TIME_PER_ATTEMPT);
    stopTimer();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (!isAnalyzing && !hasSubmittedRef.current) {
            hasSubmittedRef.current = true;
            const canvas = document.querySelector(
              "canvas"
            ) as HTMLCanvasElement;
            if (canvas) handleSubmit(canvas.toDataURL("image/png"));
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isAnalyzing]);

  const updateUserScore = async (points: number) => {
    if (!user || !userScore) return;
    try {
      const { data: current, error: fetchError } = await supabase
        .from("scores")
        .select("score")
        .eq("user_id", user.id)
        .single();

      if (fetchError) throw fetchError;

      const newScore = (current?.score || 0) + points;
      const { error: updateError } = await supabase
        .from("scores")
        .update({ score: newScore })
        .eq("user_id", user.id);

      if (updateError) throw updateError;
      updateScore(newScore);
    } catch (err) {
      console.error("Errore aggiornamento punteggio:", err);
    }
  };

  const clearCanvas = () => {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const startNewRound = () => {
    clearCanvas();
    const word = getRandomWord(locale);
    wordRef.current = word;
    setShowResult(false);
    setAiResult(null);
    hasSubmittedRef.current = false;
    startTimer();
  };

  const resetGame = () => {
    setScore(0);
    scoreRef.current = 0;
    setAttempts(0);
    setGameOver(false);
    startNewRound();
  };

  const checkMatch = (a: string, b: string) =>
    a.toLowerCase() === b.toLowerCase();

  const handleSubmit = async (imageDataUrl: string) => {
    stopTimer();
    setIsAnalyzing(true);
    setShowResult(true);

    try {
      const result = await analyzeDrawing(imageDataUrl)
      setAiResult(result);

      const isCorrect = checkMatch(result, wordRef.current);
      if (isCorrect) {
        scoreRef.current += POINTS_PER_ATTEMPT;
        setScore(scoreRef.current);
      }

      setAttempts((prev) => {
        const newAttempts = prev + 1;
        const handleEndOrNext = () => {
          if (newAttempts >= MAX_ATTEMPTS) {
            updateUserScore(scoreRef.current);
            setGameOver(true);
          } else {
            startNewRound();
          }
        };
        setTimeout(handleEndOrNext, WAIT_AFTER_RESULT);
        return newAttempts;
      });
    } catch (error) {
      console.error("Errore analisi immagine:", error);
      alert("Errore durante l'analisi. Riprova.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    resetGame();
    return stopTimer;
  }, [locale]);

  return (
    <div className="flex flex-col h-full w-full p-1 sm:p-2 md:p-6">
      <div className="flex justify-between items-center mb-1 sm:mb-2 p-3 rounded-lg text-xs sm:text-sm bg-[#2a3b52] text-white">
        <div className="font-semibold">
          {t("screebai.attempts")} {attempts}/{MAX_ATTEMPTS}
        </div>
        <div className="font-semibold">
          {t("screebai.time")}{" "}
          <span className={timeLeft <= 10 ? "text-red-500 font-bold" : ""}>
            {timeLeft}
            {t("screebai.seconds")}
          </span>
        </div>
        <div className="font-semibold">
          {t("screebai.points")} {scoreRef.current}
        </div>
      </div>

      {gameOver ? (
        <div className="flex flex-col items-center justify-center flex-grow text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            {t("screebai.gameOver")}
          </h2>
          <p className="text-xl text-white mb-6">
            {t("screebai.finalScore")}: {scoreRef.current}
          </p>
          <button
            className="px-4 py-2 rounded-2xl font-semibold bg-gradient-to-r from-[#8257e6] via-[#c026d3] to-[#f59e0b] text-white hover:opacity-90 transition-opacity"
            onClick={resetGame}
          >
            {t("screebai.playAgain")}
          </button>
        </div>
      ) : (
        <>
          <div className="mb-1 sm:mb-6" style={{ height: "80px" }}>
            <div className="text-center p-2 sm:p-3 rounded-2xl h-full flex flex-col justify-center bg-[#2a3b52] overflow-hidden">
              {!showResult ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xl sm:text-3xl font-bold text-white">
                    {wordRef.current}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  {isAnalyzing ? (
                    <p className="text-base sm:text-xl text-white">
                      {t("screebai.analyzing")}
                    </p>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center flex-wrap text-center">
                        <span className="text-base sm:text-lg font-medium text-[#f59e0b] mr-1">
                          {t("screebai.aiRecognized")}
                        </span>
                        <span className="text-md sm:text-2xl font-bold text-white">
                          {aiResult || t("screebai.notRecognized")}
                        </span>
                      </div>
                      <span
                        className="font-bold text-xs sm:text-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full inline-block mt-1"
                        style={{
                          backgroundColor: checkMatch(aiResult || "", wordRef.current)
                            ? "#10b981"
                            : "#ef4444",
                          color: "white",
                        }}
                      >
                        {checkMatch(aiResult || "", wordRef.current)
                          ? t("screebai.correct", {
                              points: POINTS_PER_ATTEMPT.toString(),
                            })
                          : t("screebai.notMatching") + ' "' + wordRef.current + '"'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex-grow pb-14 sm:pb-12 md:pb-0 h-full">
            <ScreebaiCanvas onSubmit={handleSubmit} />
          </div>
        </>
      )}
    </div>
  );
};

export default ScreebAi;