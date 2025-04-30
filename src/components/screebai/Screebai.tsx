'use client';

import { useState, useEffect } from 'react';
import { getRandomWord } from '@/data/words';
import { analyzeDrawing } from '../../services/openaiService';
import ScreebaiCanvas from './ScreebaiCanvas';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const MAX_ATTEMPTS = 1;

const ScreebAi = () => {
  const { user, userScore } = useAuth();
  const [word, setWord] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [, setUpdatingScore] = useState<boolean>(false);

  // Get a random word on component mount
  useEffect(() => {
    resetGame();
  }, []);

  // Aggiorna il punteggio dell'utente nel database
  const { updateScore } = useAuth();
  
  const updateUserScore = async (newPoints: number) => {
    if (!user || !userScore) return;
    
    try {
      setUpdatingScore(true);
      
      // Ottieni il punteggio attuale dal database
      const { data: currentScoreData, error: fetchError } = await supabase
        .from('scores')
        .select('score')
        .eq('user_id', user.id)
        .single();
      
      if (fetchError) {
        console.error('Errore durante il recupero del punteggio attuale:', fetchError);
        return;
      }
      
      // Calcola il nuovo punteggio totale
      const currentScore = currentScoreData?.score || 0;
      const updatedScore = currentScore + newPoints;
      console.log(`Aggiornamento punteggio in corso... Da ${currentScore} a ${updatedScore}`);
      
      // Aggiorna il record nella tabella scores
      const { error } = await supabase
        .from('scores')
        .update({ score: updatedScore })
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Errore durante l\'aggiornamento del punteggio:', error);
      } else {
        console.log(`Punteggio aggiornato con successo! Nuovo punteggio: ${updatedScore}`);
        // Aggiorna anche il punteggio nel contesto di autenticazione
        updateScore(updatedScore);
      }
    } catch (error) {
      console.error('Errore durante l\'aggiornamento del punteggio:', error);
    } finally {
      setUpdatingScore(false);
    }
  };
  
  // Reset the game
  const resetGame = () => {
    setWord(getRandomWord());
    setShowResult(false);
    setAiResult(null);
    setScore(0);
    setAttempts(0);
    setGameOver(false);
  };

  // Start a new round
  const startNewRound = () => {
    setWord(getRandomWord());
    setShowResult(false);
    setAiResult(null);
  };

  // Check if the AI result matches the word (case insensitive)
  const checkMatch = (result: string, targetWord: string): boolean => {
    return result.toLowerCase() === targetWord.toLowerCase();
  };

  // Handle drawing submission
  const handleSubmit = async (imageDataUrl: string) => {
    try {
      setIsAnalyzing(true);
      setShowResult(true);
      
      // Chiamata a GPT-4 Vision per analizzare l'immagine
      const result = await analyzeDrawing(imageDataUrl);
      setAiResult(result);
      
      console.log('AI ha riconosciuto:', result);
      
      // Incrementa il numero di tentativi
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      // Controlla se l'AI ha indovinato correttamente
      const isCorrect = checkMatch(result, word);
      if (isCorrect) {
        // Incrementa il punteggio
        setScore(prevScore => prevScore + 1);
      }
      
      // Controlla se il gioco è finito
      if (newAttempts >= MAX_ATTEMPTS) {
        // Il gioco è finito dopo il massimo numero di tentativi
        // Calcola il punteggio finale
        const finalScore = isCorrect ? score + 1 : score;
        
        setTimeout(() => {
          // Aggiorna il punteggio dell'utente nel database
          updateUserScore(finalScore);
          setGameOver(true);
        }, 3000);
      } else {
        // Passa alla prossima parola dopo un breve ritardo
        setTimeout(() => {
          startNewRound();
        }, 3000);
      }
    } catch (error) {
      console.error('Errore durante l\'analisi dell\'immagine:', error);
      alert('Si è verificato un errore durante l\'analisi dell\'immagine.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-4 md:p-6">
      {/* Game stats */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-semibold">Tentativo: {attempts}/{MAX_ATTEMPTS}</div>
        <div className="text-sm font-semibold">Punti: {score}</div>
      </div>
      
      {/* Game over screen */}
      {gameOver ? (
        <div className="flex flex-col items-center justify-center flex-grow text-center">
          <h1 className="text-3xl font-bold mb-4">Gioco Finito!</h1>
          <p className="text-2xl mb-6">Hai totalizzato <span className="text-blue-600 font-bold">{score}</span> punti su {MAX_ATTEMPTS} tentativi!</p>
          <button 
            className="p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            onClick={resetGame}
          >
            Gioca ancora
          </button>
        </div>
      ) : (
        <>
          {/* Word to draw */}
          {!showResult ? (
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-1">Disegna:</h1>
              <p className="text-3xl font-bold text-blue-600">{word}</p>
            </div>
          ) : (
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-1">L&apos;AI ha riconosciuto:</h1>
              {isAnalyzing ? (
                <p className="text-xl">Analisi in corso...</p>
              ) : (
                <>
                  <p className="text-3xl font-bold text-green-600">{aiResult || 'Non riconosciuto'}</p>
                  <p className="mt-2">
                    {checkMatch(aiResult || '', word) ? 
                      <span className="text-green-600 font-bold">Corretto! +1 punto</span> : 
                      <span className="text-red-600">Non corrisponde a &quot;{word}&quot;</span>
                    }
                  </p>
                </>
              )}
            </div>
          )}
          
          {/* Drawing canvas */}
          <div className="flex-grow">
            <ScreebaiCanvas onSubmit={handleSubmit} />
          </div>
        </>
      )}
    </div>
  );
};

export default ScreebAi;
