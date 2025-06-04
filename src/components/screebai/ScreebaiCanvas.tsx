'use client';

import { useRef, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { Locale } from '@/i18n/settings';

interface DrawingCanvasProps {
  onSubmit: (imageDataUrl: string) => void;
  setCanvasRef?: (canvas: HTMLCanvasElement | null) => void;
}

type Tool = 'pen' | 'eraser';

const ScreebaiCanvas = ({ onSubmit, setCanvasRef }: DrawingCanvasProps) => {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'it';
  const { t } = useTranslation(locale);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>('pen');
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
  // Clear canvas function (definita prima dell'useEffect)
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Set up canvas and context
  useEffect(() => {
    // Passa il riferimento al canvas al componente genitore se la prop è fornita
    if (setCanvasRef && canvasRef.current) {
      setCanvasRef(canvasRef.current);
    }
    
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        // Get the parent container dimensions
        const container = canvasRef.current.parentElement;
        if (container) {
          // Calcola l'altezza disponibile in base alla viewport
          const containerRect = container.getBoundingClientRect();
          
          // Calcola l'altezza della barra degli strumenti in base alla dimensione dello schermo
          const isMobile = window.innerWidth < 640;
          
          // Assicuriamo che il container abbia un'altezza minima
          if (containerRect.height < 300) {
            container.style.minHeight = '60vh';
          }
          
          // Rileggi le dimensioni dopo aver impostato l'altezza minima
          const updatedRect = container.getBoundingClientRect();
          const width = updatedRect.width;
          const height = updatedRect.height;
          
          // Imposta dimensioni minime per il canvas
          const finalWidth = Math.max(width, 300);
          const finalHeight = Math.max(height, 300);
          
          setCanvasSize({ width: finalWidth, height: finalHeight });
          
          // Set canvas dimensions
          canvasRef.current.width = finalWidth;
          canvasRef.current.height = finalHeight;
          
          // Applica uno stile di bordo più sottile su mobile
          if (isMobile) {
            container.style.borderWidth = '1px';
          }
        }
      }
    };

    // Initialize canvas size
    updateCanvasSize();
    
    // Assicuriamoci che il canvas abbia uno sfondo bianco dopo un breve ritardo
    // per gestire eventuali problemi di timing
    const initTimer = setTimeout(() => {
      clearCanvas();
    }, 100);
    
    // Update canvas size on window resize and orientation change
    window.addEventListener('resize', updateCanvasSize);
    window.addEventListener('orientationchange', () => {
      // Piccolo ritardo per permettere al browser di completare il cambio di orientamento
      setTimeout(updateCanvasSize, 100);
    });
    
    // Aggiorna la dimensione del canvas dopo un breve ritardo per assicurarsi
    // che tutti gli elementi della pagina siano stati renderizzati correttamente
    const resizeTimer = setTimeout(updateCanvasSize, 300);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('orientationchange', updateCanvasSize);
      clearTimeout(initTimer);
      clearTimeout(resizeTimer);
      
      // Rimuovi il riferimento quando il componente viene smontato
      if (setCanvasRef) {
        setCanvasRef(null);
      }
    };
  }, []);

  // Drawing functions
  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath(); // Start a new path for next drawing
    }
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get coordinates based on event type
    let x: number, y: number;
    
    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      x = touch.clientX - rect.left;
      y = touch.clientY - rect.top;
      
      // Non chiamiamo preventDefault() qui perché causa errori con eventi passivi
      // Lo scrolling è prevenuto tramite CSS touch-action: none
    } else {
      // Mouse event
      const rect = canvas.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    // Set drawing style based on current tool
    ctx.lineWidth = currentTool === 'pen' ? 5 : 20;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentTool === 'pen' ? 'black' : 'white';
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };



  // Export canvas as PNG in base64 format with white background
  const exportImage = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Crea un canvas temporaneo con sfondo bianco
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          // Riempi il canvas temporaneo con sfondo bianco
          tempCtx.fillStyle = 'white';
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
          
          // Disegna l'immagine originale sopra lo sfondo bianco
          tempCtx.drawImage(canvas, 0, 0);
          
          // Ottieni l'URL dati dal canvas temporaneo
          const dataUrl = tempCanvas.toDataURL('image/png');
          
          // Invia l'immagine con sfondo bianco
          onSubmit(dataUrl);
          
          // Pulisci il canvas per il prossimo disegno
          clearCanvas();
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full mt-1 pt-0">
      {/* Drawing area */}
      <div className="flex-grow relative border border-[#334155] rounded-2xl overflow-hidden bg-white" style={{ minHeight: '60vh' }}>
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="absolute top-0 left-0 touch-none w-full h-full"
          style={{ touchAction: 'none' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      
      {/* Tools */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#2a3b52] shadow-lg py-2 px-3 flex justify-between items-center gap-2 md:static md:bg-transparent md:shadow-none md:mt-3 md:px-0 md:py-0">
        <div className="flex gap-1">
          <button
            className={`px-3 py-1.5 rounded-xl text-sm font-medium ${currentTool === 'pen' ? 'bg-gradient-to-r from-[#8257e6] to-[#c026d3] text-white' : 'bg-[#334155] text-white'}`}
            onClick={() => setCurrentTool('pen')}
          >
            {t("screebai.pen")}
          </button>
          <button
            className={`px-3 py-1.5 rounded-xl text-sm font-medium ${currentTool === 'eraser' ? 'bg-gradient-to-r from-[#8257e6] to-[#c026d3] text-white' : 'bg-[#334155] text-white'}`}
            onClick={() => setCurrentTool('eraser')}
          >
            {t("screebai.erase")}
          </button>
          <button
            className="px-3 py-1.5 rounded-xl text-sm font-medium bg-[#334155] text-white hover:bg-[#475569] transition-colors"
            onClick={clearCanvas}
          >
            {t("screebai.eraseAll")}
          </button>
        </div>
        <button
          className="px-3 py-1.5 rounded-xl text-sm font-medium bg-gradient-to-r from-[#8257e6] via-[#c026d3] to-[#f59e0b] text-white hover:opacity-90 transition-opacity"
          onClick={exportImage}
        >
          Invia
        </button>
      </div>
    </div>
  );
};

export default ScreebaiCanvas;
