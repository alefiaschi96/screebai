"use client";

import { useState, useEffect, useRef } from "react";
import { getRandomWord } from "@/data/words";
import { analyzeDrawing } from "../../services/openaiService";
import ScreebaiCanvas from "./ScreebaiCanvas";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const ScreebAi = () => {
  const { user, userScore } = useAuth();
  const [word, setWord] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [, setUpdatingScore] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubmittedRef = useRef<boolean>(false);

  // Costanti dalle variabili d'ambiente
  const MAX_ATTEMPTS =
    parseInt(process.env.NEXT_PUBLIC_MAX_ATTEMPTS as string) || 5;
  const MAX_TIME_PER_ATTEMPT =
    parseInt(process.env.NEXT_PUBLIC_TIME_PER_ATTEMPT as string) || 60; // Tempo in secondi

  // Get a random word on component mount
  useEffect(() => {
    resetGame();

    // Cleanup del timer quando il componente viene smontato
    return () => {
      stopTimer();
    };
  }, []);

  // Funzione per gestire il timer
  const startTimer = () => {
    setTimeLeft(MAX_TIME_PER_ATTEMPT);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);

          if (!isAnalyzing && !hasSubmittedRef.current) {
            hasSubmittedRef.current = true; // Imposta a true per evitare duplicati
            const canvas = document.querySelector("canvas");
            if (canvas) {
              const imageDataUrl = canvas.toDataURL("image/png");
              handleSubmit(imageDataUrl);
            }
          }

          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  // Ferma il timer
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Aggiorna il punteggio dell'utente nel database
  const { updateScore } = useAuth();

  const updateUserScore = async (newPoints: number) => {
    if (!user || !userScore) return;

    try {
      setUpdatingScore(true);

      // Ottieni il punteggio attuale dal database
      const { data: currentScoreData, error: fetchError } = await supabase
        .from("scores")
        .select("score")
        .eq("user_id", user.id)
        .single();

      if (fetchError) {
        console.error(
          "Errore durante il recupero del punteggio attuale:",
          fetchError
        );
        return;
      }

      // Calcola il nuovo punteggio totale
      const currentScore = currentScoreData?.score || 0;
      const updatedScore = currentScore + newPoints;
      console.log(
        `Aggiornamento punteggio in corso... Da ${currentScore} a ${updatedScore}`
      );

      // Aggiorna il record nella tabella scores
      const { error } = await supabase
        .from("scores")
        .update({ score: updatedScore })
        .eq("user_id", user.id);

      if (error) {
        console.error("Errore durante l'aggiornamento del punteggio:", error);
      } else {
        console.log(
          `Punteggio aggiornato con successo! Nuovo punteggio: ${updatedScore}`
        );
        // Aggiorna anche il punteggio nel contesto di autenticazione
        updateScore(updatedScore);
      }
    } catch (error) {
      console.error("Errore durante l'aggiornamento del punteggio:", error);
    } finally {
      setUpdatingScore(false);
    }
  };

  // Reset the game
  const resetGame = () => {
    // Resettiamo tutti gli stati del gioco
    setScore(0);
    setAttempts(0);
    setGameOver(false);
    hasSubmittedRef.current = false;
    // Iniziamo un nuovo round (che imposta la parola e avvia il timer)
    startNewRound();
  };

  // Start a new round
  const startNewRound = () => {
    setWord(getRandomWord());
    setShowResult(false);
    setAiResult(null);
    hasSubmittedRef.current = false;
    // Avvia il timer per questo tentativo
    startTimer();
  };

  // Check if the AI result matches the word (case insensitive)
  const checkMatch = (result: string, targetWord: string): boolean => {
    return result.toLowerCase() === targetWord.toLowerCase();
  };

  // Handle drawing submission
  const handleSubmit = async (imageDataUrl: string) => {
    try {
      stopTimer();
      setIsAnalyzing(true);
      setShowResult(true);

      const result = await analyzeDrawing(imageDataUrl);
      setAiResult(result);
      console.log("AI ha riconosciuto:", result);

      // Aggiorna il numero di tentativi in modo sicuro
      setAttempts((prevAttempts) => {
        const newAttempts = prevAttempts + 1;

        const isCorrect = checkMatch(result, word);
        if (isCorrect) {
          setScore((prevScore) => prevScore + 1);
        }

        if (newAttempts >= MAX_ATTEMPTS) {
          const finalScore = isCorrect ? score + 1 : score;

          setTimeout(() => {
            updateUserScore(finalScore);
            setGameOver(true);
          }, 3000);
        } else {
          setTimeout(() => {
            startNewRound();
          }, 3000);
        }

        return newAttempts;
      });
    } catch (error) {
      console.error("Errore durante l'analisi dell'immagine:", error);
      alert("Si è verificato un errore durante l'analisi dell'immagine.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-2 md:p-6">
      {/* Game stats */}
      <div
        className="flex justify-between items-center mb-2 p-2 rounded-lg"
        style={{
          backgroundColor: "var(--light-blue)",
          color: "var(--secondary-dark)",
        }}
      >
        <div className="text-sm font-semibold">
          Tentativo: {attempts}/{MAX_ATTEMPTS}
        </div>
        <div className="text-sm font-semibold">
          Tempo:{" "}
          <span className={`${timeLeft <= 10 ? "text-danger" : ""}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="text-sm font-semibold">Punti: {score}</div>
      </div>

      {/* Game over screen */}
      {gameOver ? (
        <div className="flex flex-col items-center justify-center flex-grow text-center">
          <h1
            className="text-3xl font-bold mb-4"
            style={{ color: "var(--secondary)" }}
          >
            Gioco Finito!
          </h1>
          <p className="text-2xl mb-6">
            Hai totalizzato{" "}
            <span style={{ color: "var(--primary)", fontWeight: "bold" }}>
              {score}
            </span>{" "}
            punti su {MAX_ATTEMPTS} tentativi!
          </p>
          <button
            className="btn-primary p-3 text-white rounded-full hover:shadow-lg transition-all"
            style={{ backgroundColor: "var(--primary)" }}
            onClick={resetGame}
          >
            Gioca ancora
          </button>
        </div>
      ) : (
        <>
          {/* Contenitore con altezza fissa per evitare spostamenti nel layout */}
          <div className="mb-2 flex flex-col" style={{ minHeight: "100px" }}>
            {/* Word to draw o risultato AI */}
            <div
              className="text-center p-2 rounded-lg flex-grow flex flex-col justify-center"
              style={{
                backgroundColor: "var(--light-blue)",
              }}
            >
              {!showResult ? (
                /* Parola da disegnare */
                <div className="flex flex-col items-center justify-center h-full">
                  <p
                    className="text-3xl font-bold"
                    style={{ color: "var(--primary-dark)" }}
                  >
                    {word}
                  </p>
                </div>
              ) : (
                /* Risultato dell'AI */
                <div className="flex flex-col items-center justify-center h-full">
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: "var(--primary-dark)" }}
                  >
                    L&apos;AI ha riconosciuto:
                  </h3>
                  {isAnalyzing ? (
                    <p
                      className="text-xl"
                      style={{ color: "var(--primary-dark)" }}
                    >
                      Analisi in corso...
                    </p>
                  ) : (
                    <>
                      <p
                        className="text-3xl font-bold mb-3"
                        style={{ color: "var(--primary-dark)" }}
                      >
                        {aiResult || "Non riconosciuto"}
                      </p>
                      <div>
                        {checkMatch(aiResult || "", word) ? (
                          <span
                            className="font-bold px-3 py-1 rounded-full inline-block"
                            style={{
                              backgroundColor: "var(--success)",
                              color: "white",
                            }}
                          >
                            Corretto! +1 punto
                          </span>
                        ) : (
                          <span
                            className="font-bold px-3 py-1 rounded-full inline-block"
                            style={{
                              backgroundColor: "var(--danger)",
                              color: "white",
                            }}
                          >
                            Non corrisponde a &quot;{word}&quot;
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Drawing canvas */}
          <div className="flex-grow pb-12 md:pb-0">
            <ScreebaiCanvas onSubmit={handleSubmit} />
          </div>
        </>
      )}
    </div>
  );
};

export default ScreebAi;
