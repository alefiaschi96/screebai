"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { Locale } from "@/i18n/settings";
import { useRouter } from 'next/navigation';

// Immagini normali che aumentano il punteggio quando cliccate
const normalImages = [
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

// Immagine bug che penalizza quando cliccata
const bugImage = "/images/bug-min.png";

const CoCatch = () => {
  const params = useParams();
  const locale = (params?.locale as Locale) || "it";
  const { t } = useTranslation(locale);
  const { user, userScore, updateScore } = useAuth();
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    isBug?: boolean;
  } | null>(null);
  const [imagesPreloaded, setImagesPreloaded] = useState<boolean>(false);
  const [, setUpdatingScore] = useState<boolean>(false);
  const [bugShownCount, setBugShownCount] = useState<number>(0);

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

    const allImages = [...normalImages, bugImage];
    const preloadImagePromises = allImages.map((src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(src);
        img.onerror = () => reject(`Failed to load image: ${src}`);
      });
    });

    Promise.all(preloadImagePromises)
      .then(() => {
        setImagesPreloaded(true);
      })
      .catch((error) => {
        console.error("Errore nel precaricare le immagini:", error);
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
    setBugShownCount(0);

    // Mostra subito la prima immagine all'inizio del gioco
    setTimeout(() => showRandomImage(), 500);

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
    if (!gameActiveRef.current || !gameAreaRef.current) return;

    const gameArea = gameAreaRef.current;
    const gameAreaRect = gameArea.getBoundingClientRect();

    // Dimensioni dell'immagine (approssimative)
    const imageWidth = 80;
    const imageHeight = 80;

    // Calcola posizione casuale all'interno dell'area di gioco
    const maxLeft = Math.max(10, gameAreaRect.width - imageWidth);
    const maxTop = Math.max(10, gameAreaRect.height - imageHeight);
    const randomLeft = Math.floor(Math.random() * maxLeft);
    const randomTop = Math.floor(Math.random() * maxTop);

    // Incrementa l'ID dell'immagine
    imageIdRef.current += 1;

    // Determina se mostrare l'immagine bug
    // Forziamo l'apparizione del bug almeno un paio di volte durante la partita
    // La probabilità aumenta con il passare del tempo se non è ancora apparso abbastanza
    const timeElapsed = GAME_DURATION - timeLeft;
    const gameProgress = timeElapsed / GAME_DURATION; // 0 a 1

    // Aumentiamo la probabilità di mostrare il bug se:
    // 1. Non è stato mostrato abbastanza volte
    // 2. Siamo oltre la metà del gioco
    let showBug = false;

    if (bugShownCount < 2 && gameProgress > 0.3) {
      // Aumenta la probabilità di mostrare il bug man mano che il gioco avanza
      const bugProbability = bugShownCount === 0 ? 0.6 : 0.3;
      showBug = Math.random() < bugProbability;
    } else if (bugShownCount < 3) {
      // Probabilità normale di mostrare il bug
      showBug = Math.random() < 0.15;
    } else {
      // Probabilità ridotta dopo che è già apparso abbastanza volte
      showBug = Math.random() < 0.05;
    }

    if (showBug) {
      // Mostra l'immagine bug
      setBugShownCount((prev) => prev + 1);
      setCurrentImage({
        src: bugImage,
        top: randomTop,
        left: randomLeft,
        id: imageIdRef.current,
        isBug: true,
      });
    } else {
      // Seleziona un'immagine casuale normale
      const randomIndex = Math.floor(Math.random() * normalImages.length);
      const randomImage = normalImages[randomIndex];

      setCurrentImage({
        src: randomImage,
        top: randomTop,
        left: randomLeft,
        id: imageIdRef.current,
        isBug: false,
      });
    }

    // Imposta un timer per rimuovere l'immagine dopo un breve periodo
    if (imageTimerRef.current) clearTimeout(imageTimerRef.current);
    imageTimerRef.current = setTimeout(() => {
      setCurrentImage(null);

      // Mostra la prossima immagine dopo un breve ritardo
      setTimeout(() => {
        if (gameActiveRef.current) showRandomImage();
      }, 500);
    }, IMAGE_DURATION);
  };

  // Gestisce il click sull'immagine
  const handleImageClick = () => {
    if (!currentImage) return;

    // Controlla se è l'immagine bug
    if (currentImage.isBug) {
      // Penalizza il giocatore se clicca sul bug
      const newScore = Math.max(0, score - 2);
      setScore(newScore);
      scoreRef.current = newScore;
    } else {
      // Incrementa il punteggio per le immagini normali
      const newScore = score + 1;
      setScore(newScore);
      scoreRef.current = newScore;
    }

    // Rimuovi l'immagine corrente
    setCurrentImage(null);

    // Mostra una nuova immagine dopo un breve ritardo
    if (gameActiveRef.current) {
      imageTimerRef.current = setTimeout(showRandomImage, 500);
    }
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
    <div className="flex flex-col h-full w-full p-1 sm:p-2 md:p-4">
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
        <div>
          <div className="flex flex-col items-center justify-center h-full min-h-[40vh] text-center mx-auto max-w-md px-4">
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
            <button
              className="mt-4 px-4 py-2 rounded-2xl font-semibold bg-gradient-to-r from-[#8257e6] via-[#c026d3] to-[#f59e0b] text-white hover:opacity-90 transition-opacity"
              onClick={() => router.push(`/${locale}`)}
            >
              {t("games.goToHome")}
            </button>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div
              onClick={() =>
                window.open(
                  "https://tally.so/r/wMq66Y",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              className="z-1 col-span-1 lg:col-span-2 bg-[#1e293b] rounded-lg border border-[#334155] p-6 text-center cursor-pointer hover:bg-[#1a202c] transition-colors duration-300"
              role="button"
              aria-label={t("home.gadgetMessage")}
            >
              <span className="text-[#94a3b8] text-xl">
                {t("home.gadgetMessage1")}
                <br />
                {t("home.gadgetMessage2")}
              </span>
            </div>
          </div>
        </div>
      ) : !gameStarted ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center mx-auto max-w-md px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            {t("cocatch.catchImages")}
          </h2>
          <p className="text-lg text-gray-300 mb-6">
            {t("cocatch.instructions_1")}
          </p>
          <p className="text-lg text-gray-300 mb-6">
            {t("cocatch.instructions_2")}
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
          style={{
            minHeight: "300px",
            height:
              "calc(90vh - 120px)" /* 90% della viewport meno lo spazio per header/punteggio */,
            width: "100%",
            margin: "0 auto",
          }}
        >
          {currentImage && (
            <div
              className="absolute cursor-pointer"
              style={{
                top: `${currentImage.top}px`,
                left: `${currentImage.left}px`,
                transition: "all 0.2s ease-in-out",
                position: "absolute",
                zIndex: 5,
              }}
              onClick={handleImageClick}
            >
              <div
                className={`${
                  currentImage.isBug
                    ? "w-28 h-28 sm:w-28 sm:h-28 bg-red-100 border-2 border-red-500"
                    : "w-24 h-24 sm:w-24 sm:h-24 bg-white"
                } flex items-center justify-center rounded-full p-2 shadow-lg`}
                style={{
                  transform: currentImage.isBug
                    ? "scale(1.1) rotate(-10deg)"
                    : "scale(1)",
                  animation: currentImage.isBug ? "pulse 0.7s infinite" : "",
                }}
              >
                <img
                  src={currentImage.src}
                  alt={currentImage.isBug ? "Don't catch me!" : "Catch me!"}
                  className={`w-full h-full object-contain ${
                    currentImage.isBug ? "animate-bounce" : ""
                  }`}
                  draggable="false"
                />
                {currentImage.isBug && (
                  <div className="absolute -top-4 -right-4 bg-red-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center animate-pulse">
                    -1
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoCatch;
