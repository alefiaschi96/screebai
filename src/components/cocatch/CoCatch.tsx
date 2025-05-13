"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { Locale } from "@/i18n/settings";

const availableImages = [
  "/images/01-min.png",
  "/images/02-min.png",
  "/images/03-min.png",
  "/images/04-min.png",
  "/images/05-min.png",
  "/images/06-min.png",
  "/images/07-min.png",
  "/images/08-min.png",
  "/images/09-min.png",
  "/images/10-min.png",
  "/images/11-min.png",
  "/images/12_a-min.png",
  "/images/13-min.png",
  "/images/14-min.png",
  "/images/15-min.png",
  "/images/16-min.png",
  "/images/16_a-min.png",
  "/images/17-min.png",
  "/images/17_a-min.png",
  "/images/18_a-min.png",
];


const CoCatch = () => {
  const params = useParams();
  const locale = (params?.locale as Locale) || "it";
  const { t } = useTranslation(locale);
  const { user, userScore, updateScore } = useAuth();
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Stati del gioco
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [currentImage, setCurrentImage] = useState<{
    src: string;
    top: number;
    left: number;
    id: number;
  } | null>(null);
  const [imagesPreloaded, setImagesPreloaded] = useState<boolean>(false);
  const [, setUpdatingScore] = useState<boolean>(false);

  // Riferimenti per i timer
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const imageTimerRef = useRef<NodeJS.Timeout | null>(null);
  const imageIdRef = useRef<number>(0);

  const gameActiveRef = useRef(false);
  const scoreRef = useRef(0);

  // Costanti dalle variabili d'ambiente
  const GAME_DURATION =
    parseInt(process.env.NEXT_PUBLIC_TIME_PER_ATTEMPT as string) || 30; // Durata del gioco in secondi
  const IMAGE_DURATION =
    parseInt(process.env.NEXT_PUBLIC_IMAGE_DURATION as string) || 1500; // Durata di visualizzazione dell'immagine in ms

  // Precarica tutte le immagini
  const preloadImages = () => {
    if (imagesPreloaded) return;
    
    const preloadImagePromises = availableImages.map((src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(src);
        img.onerror = () => reject(`Failed to load image: ${src}`);
      });
    });

    Promise.all(preloadImagePromises)
      .then(() => {
        console.log('Tutte le immagini sono state precaricate');
        setImagesPreloaded(true);
      })
      .catch((error) => {
        console.error('Errore nel precaricare le immagini:', error);
        // Continuiamo comunque con il gioco anche se alcune immagini non si sono caricate
        setImagesPreloaded(true);
      });
  };

  // Inizia il gioco
  const startGame = () => {
    // Assicuriamoci che le immagini siano precaricate
    preloadImages();
    
    gameActiveRef.current = true;
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setCurrentImage(null);

    // Avvia timer
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    gameTimerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          endGame();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    showRandomImage();
  };

  // Termina il gioco
  const endGame = () => {
    gameActiveRef.current = false;
    setGameStarted(false);
    setGameOver(true);

    // Ferma tutti i timer
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    if (imageTimerRef.current) {
      clearTimeout(imageTimerRef.current);
      imageTimerRef.current = null;
    }

    // Aggiorna il punteggio nel database
    updateUserScore(scoreRef.current);
  };

  // Mostra un'immagine casuale in una posizione casuale
  const showRandomImage = () => {
    if (!gameActiveRef.current) return;

    // Seleziona un'immagine casuale
    const randomIndex = Math.floor(Math.random() * availableImages.length);
    const randomImage = availableImages[randomIndex];

    // Genera una posizione casuale (in percentuale)
    const randomTop = Math.floor(Math.random() * 80); // 0-80% dall'alto
    const randomLeft = Math.floor(Math.random() * 80); // 0-80% da sinistra

    // Incrementa l'ID dell'immagine per tracciare le diverse istanze
    imageIdRef.current += 1;

    // Imposta l'immagine corrente
    setCurrentImage({
      src: randomImage,
      top: randomTop,
      left: randomLeft,
      id: imageIdRef.current,
    });

    // Imposta un timer per rimuovere l'immagine dopo IMAGE_DURATION
    if (imageTimerRef.current) clearTimeout(imageTimerRef.current);
    imageTimerRef.current = setTimeout(() => {
      setCurrentImage(null);

      // Mostra la prossima immagine dopo un breve ritardo
      setTimeout(() => {
        if (gameActiveRef.current) showRandomImage();
      }, 300);
    }, IMAGE_DURATION);
  };

  // Gestisce il click su un'immagine
  const handleImageClick = () => {
    // Incrementa il punteggio
    setScore((prev) => {
      const updated = prev + 1;
      scoreRef.current = updated;
      return updated;
    });

    // Rimuovi l'immagine corrente
    setCurrentImage(null);

    // Ferma il timer dell'immagine
    if (imageTimerRef.current) {
      clearTimeout(imageTimerRef.current);
      imageTimerRef.current = null;
    }

    // Mostra la prossima immagine dopo un breve ritardo
    setTimeout(() => {
      if (gameActiveRef.current) showRandomImage();
    }, 300);
  };

  // Aggiorna il punteggio dell'utente nel database
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

      // Aggiorna il record nella tabella scores
      const { error } = await supabase
        .from("scores")
        .update({ score: updatedScore })
        .eq("user_id", user.id);

      if (error) {
        console.error("Errore durante l'aggiornamento del punteggio:", error);
      } else {
        updateScore(updatedScore);
      }
    } catch (error) {
      console.error("Errore durante l'aggiornamento del punteggio:", error);
    } finally {
      setUpdatingScore(false);
    }
  };

  // Effetti per gestire il ciclo di vita del componente
  useEffect(() => {
    // Precarica le immagini appena il componente viene montato
    preloadImages();
    
    return () => {
      // Pulizia dei timer quando il componente viene smontato
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (imageTimerRef.current) clearTimeout(imageTimerRef.current);
      gameActiveRef.current = false;
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full p-1 sm:p-2 md:p-6">
      {/* Game stats */}
      {gameStarted && (
        <div
          className="flex justify-between items-center mb-1 sm:mb-2 p-3 rounded-lg text-xs sm:text-sm"
          style={{
            backgroundColor: "#2a3b52",
            color: "white",
          }}
        >
          <div className="font-semibold">
            {t("cocatch.timeLeft")} {timeLeft}s
          </div>
          <div className="font-semibold">
            {t("cocatch.score")} {score}
          </div>
        </div>
      )}

      {/* Game over screen */}
      {gameOver ? (
        <div className="flex flex-col items-center justify-center flex-grow text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            {t("cocatch.gameOver")}
          </h2>
          <p className="text-xl text-white mb-6">
            {t("cocatch.finalScore")}: {score}
          </p>
          <button
            className="px-4 py-2 rounded-2xl font-semibold bg-gradient-to-r from-[#8257e6] via-[#c026d3] to-[#f59e0b] text-white hover:opacity-90 transition-opacity"
            onClick={startGame}
          >
            {t("cocatch.playAgain")}
          </button>
        </div>
      ) : !gameStarted ? (
        <div className="flex flex-col items-center justify-center flex-grow text-center px-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            {t("cocatch.catchImages")}
          </h2>
          <p className="text-lg text-gray-300 mb-6">
            {t("cocatch.instructions")}
          </p>
          <button
            className="px-4 py-2 rounded-2xl font-semibold bg-gradient-to-r from-[#8257e6] via-[#c026d3] to-[#f59e0b] text-white hover:opacity-90 transition-opacity"
            onClick={startGame}
            disabled={!imagesPreloaded}
          >
            {imagesPreloaded ? t("cocatch.startGame") : t("cocatch.loading")}
          </button>
        </div>
      ) : (
        <div
          ref={gameAreaRef}
          className="flex-grow relative bg-[#1e293b] rounded-2xl overflow-hidden"
          style={{ minHeight: "300px" }}
        >
          {currentImage && (
            <div
              className="absolute cursor-pointer"
              style={{
                top: `${currentImage.top}%`,
                left: `${currentImage.left}%`,
                transition: "all 0.2s ease-in-out",
              }}
              onClick={handleImageClick}
            >
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-white rounded-full p-2 shadow-lg"
                style={{
                  transform: "scale(1)",
                  animation: "pulse 1s infinite",
                }}
              >
                <img
                  src={currentImage.src}
                  alt="Catch me!"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoCatch;
