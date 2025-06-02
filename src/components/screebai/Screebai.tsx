"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { Locale } from "@/i18n/settings";
import { supabase } from "@/lib/supabase";
import { getRandomWord } from "@/data/words";
import { analyzeDrawing } from "@/services/openaiService";
import { uploadDrawing, deleteDrawing } from "@/services/storageService";
import ScreebaiCanvas from "./ScreebaiCanvas";

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
  const [gameStarted, setGameStarted] = useState(false);
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

  // Riferimento al canvas per accedervi quando scade il timer
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);

  // Funzione per ottenere l'immagine con sfondo bianco dal canvas
  const getImageWithWhiteBackground = useCallback(
    (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Crea un canvas temporaneo con sfondo bianco
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext("2d");

        if (tempCtx) {
          // Riempi il canvas temporaneo con sfondo bianco
          tempCtx.fillStyle = "white";
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

          // Disegna l'immagine originale sopra lo sfondo bianco
          tempCtx.drawImage(canvas, 0, 0);

          // Ottieni l'URL dati dal canvas temporaneo
          return tempCanvas.toDataURL("image/png");
        }
      }

      // Fallback al metodo standard se qualcosa va storto
      return canvas.toDataURL("image/png");
    },
    []
  );

  const handleSubmit = async (imageDataUrl: string) => {
    stopTimer();
    setIsAnalyzing(true);
    setShowResult(true);

    try {
      let savedImageUrl = "";

      // Salva l'immagine su Supabase Storage
      try {
        // Salva solo se l'utente è autenticato
        if (user) {
          const bucketName =
            process.env.NEXT_PUBLIC_BUCKET_IMAGES_NAME || "screebai";
          if (!bucketName) {
            throw new Error("Bucket name non specificato");
          }
          savedImageUrl = await uploadDrawing(
            imageDataUrl,
            wordRef.current,
            bucketName
          );

          // Qui potresti anche salvare il riferimento all'immagine in un database
          // Ad esempio, potresti creare una tabella 'drawings' in Supabase
          // e salvare l'URL dell'immagine, la parola, il risultato dell'AI, ecc.
        }
      } catch (storageError) {
        console.error(
          "Errore durante il salvataggio dell'immagine:",
          storageError
        );
        // Non interrompiamo il flusso del gioco se il salvataggio fallisce
      }

      try {
        // Analizza l'immagine con OpenAI
        // Se abbiamo un'immagine salvata, usiamo quella, altrimenti usiamo l'immagine originale
        // Passa la locale corrente per ottenere la risposta nella lingua giusta
        const result = await analyzeDrawing(
          savedImageUrl || imageDataUrl,
          locale as "it" | "en"
        );
        setAiResult(result);

        // Verifica se la risposta è corretta
        const isCorrect = checkMatch(result, wordRef.current);
        if (isCorrect) {
          scoreRef.current += POINTS_PER_ATTEMPT;
          setScore(scoreRef.current);
        }

        // Elimina l'immagine dopo l'analisi se è stata salvata
        if (savedImageUrl) {
          try {
            deleteDrawing(savedImageUrl);
          } catch (deleteError) {
            console.error(
              "Errore durante l'eliminazione dell'immagine:",
              deleteError
            );
            // Non interrompiamo il flusso del gioco se l'eliminazione fallisce
          }
        }
      } catch (analyzeError) {
        console.error("Errore durante l'analisi dell'immagine:", analyzeError);
        alert("Errore durante l'analisi. Riprova.");

        // Se l'analisi fallisce, eliminiamo comunque l'immagine se è stata salvata
        if (savedImageUrl) {
          try {
            deleteDrawing(savedImageUrl);
          } catch (deleteError) {
            console.error(
              "Errore durante l'eliminazione dell'immagine:",
              deleteError
            );
          }
        }
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

  const startTimer = useCallback(() => {
    setTimeLeft(MAX_TIME_PER_ATTEMPT);
    stopTimer();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (!isAnalyzing && !hasSubmittedRef.current) {
            hasSubmittedRef.current = true;
            
            // Cerca il canvas nel DOM se il riferimento non è disponibile
            const canvas = canvasRef || document.querySelector("canvas") as HTMLCanvasElement;
            
            if (canvas) {
              try {
                // Ottieni l'immagine con sfondo bianco usando la stessa logica di ScreebaiCanvas
                const imageDataUrl = getImageWithWhiteBackground(canvas);
                handleSubmit(imageDataUrl);
              } catch (error) {
                console.error("Errore durante l'acquisizione dell'immagine:", error);
                // Fallback: invia un'immagine vuota se non riusciamo a ottenere quella dal canvas
                const emptyCanvas = document.createElement("canvas");
                emptyCanvas.width = 400;
                emptyCanvas.height = 300;
                const ctx = emptyCanvas.getContext("2d");
                if (ctx) {
                  ctx.fillStyle = "white";
                  ctx.fillRect(0, 0, emptyCanvas.width, emptyCanvas.height);
                  handleSubmit(emptyCanvas.toDataURL("image/png"));
                }
              }
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isAnalyzing, canvasRef, getImageWithWhiteBackground, handleSubmit]);

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

  const startGame = () => {
    setGameStarted(true);
    resetGame();
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

  useEffect(() => {
    resetGame();
    return stopTimer;
  }, [locale]);

  return (
    <div className="flex flex-col h-full w-full p-1 sm:p-2 md:p-6">
      {gameStarted && (
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
      )}

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
      ) : !gameStarted ? (
        <div className="flex flex-col items-center justify-center flex-grow text-center px-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            {t("screebai.drawAndGuess")}
          </h2>
          <p className="text-lg text-gray-300 mb-6">
            {t("screebai.drawInstructions")}
          </p>
          <button
            className="px-4 py-2 rounded-2xl font-semibold bg-gradient-to-r from-[#8257e6] via-[#c026d3] to-[#f59e0b] text-white hover:opacity-90 transition-opacity"
            onClick={startGame}
          >
            {t("screebai.startGame")}
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
                          backgroundColor: checkMatch(
                            aiResult || "",
                            wordRef.current
                          )
                            ? "#10b981"
                            : "#ef4444",
                          color: "white",
                        }}
                      >
                        {checkMatch(aiResult || "", wordRef.current)
                          ? t("screebai.correct", {
                              points: POINTS_PER_ATTEMPT.toString(),
                            })
                          : t("screebai.notMatching") +
                            ' "' +
                            wordRef.current +
                            '"'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex-grow pb-14 sm:pb-12 md:pb-0 h-full">
            <ScreebaiCanvas
              onSubmit={handleSubmit}
              setCanvasRef={setCanvasRef}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ScreebAi;
