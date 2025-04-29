'use client';

import { useState, useEffect } from 'react';
import DrawingCanvas from './DrawingCanvas';
import { getRandomWord } from '@/data/words';
import { analyzeDrawing } from '../services/openaiService';

const DrawingApp = () => {
  const [word, setWord] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);

  // Get a random word on component mount
  useEffect(() => {
    setWord(getRandomWord());
    setShowResult(false);
    setAiResult(null);
  }, []);

  // Handle drawing submission
  const handleSubmit = async (imageDataUrl: string) => {
    try {
      setIsAnalyzing(true);
      setShowResult(true);
      
      // Chiamata a GPT-4 Vision per analizzare l'immagine
      const result = await analyzeDrawing(imageDataUrl);
      setAiResult(result);
      
      console.log('AI ha riconosciuto:', result);
      
      // Dopo un breve ritardo, mostra una nuova parola
      setTimeout(() => {
        setWord(getRandomWord());
        setShowResult(false);
        setAiResult(null);
      }, 5000);
    } catch (error) {
      console.error('Errore durante l\'analisi dell\'immagine:', error);
      alert('Si è verificato un errore durante l\'analisi dell\'immagine.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full p-4 md:p-6">
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
            <p className="text-3xl font-bold text-green-600">{aiResult || 'Non riconosciuto'}</p>
          )}
        </div>
      )}
      
      {/* Drawing canvas */}
      <div className="flex-grow">
        <DrawingCanvas onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default DrawingApp;
