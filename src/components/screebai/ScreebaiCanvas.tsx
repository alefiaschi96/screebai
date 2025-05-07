'use client';

import { useRef, useState, useEffect } from 'react';

interface DrawingCanvasProps {
  onSubmit: (imageDataUrl: string) => void;
}

type Tool = 'pen' | 'eraser';

const ScreebaiCanvas = ({ onSubmit }: DrawingCanvasProps) => {
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
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        // Get the parent container dimensions
        const container = canvasRef.current.parentElement;
        if (container) {
          // Calcola l'altezza disponibile in base alla viewport
          const viewportHeight = window.innerHeight;
          const containerRect = container.getBoundingClientRect();
          const containerTop = containerRect.top;
          const toolbarHeight = 40; // Altezza stimata della barra degli strumenti
          
          // Calcola l'altezza massima disponibile per il canvas
          // Sottraiamo la posizione top del container e l'altezza della toolbar
          const availableHeight = viewportHeight - containerTop - toolbarHeight;
          
          // Usa l'altezza disponibile o l'altezza del container, quella che è minore
          const height = Math.min(availableHeight, containerRect.height);
          const width = containerRect.width;
          
          setCanvasSize({ width, height });
          
          // Set canvas dimensions
          canvasRef.current.width = width;
          canvasRef.current.height = height;
          
          // Initialize canvas with white background
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
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



  // Export canvas as PNG in base64 format
  const exportImage = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSubmit(dataUrl);
      clearCanvas();
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Drawing area */}
      <div className="flex-grow relative border border-gray-300 rounded-md overflow-hidden">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="absolute top-0 left-0 touch-none"
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
      <div className="fixed bottom-0 left-0 right-0 bg-white bg-opacity-95 shadow-lg py-2 px-2 flex justify-between items-center gap-1 md:static md:bg-transparent md:shadow-none md:mt-2 md:px-0 md:py-0">
        <div className="flex gap-1">
          <button
            className={`px-2 py-1 rounded-md text-xs ${currentTool === 'pen' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setCurrentTool('pen')}
          >
            Penna
          </button>
          <button
            className={`px-2 py-1 rounded-md text-xs ${currentTool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setCurrentTool('eraser')}
          >
            Gomma
          </button>
          <button
            className="px-2 py-1 bg-red-500 text-white rounded-md text-xs"
            onClick={clearCanvas}
          >
            Cancella tutto
          </button>
        </div>
        <button
          className="px-3 py-1 bg-green-500 text-white rounded-md text-xs font-bold"
          onClick={exportImage}
        >
          Finito
        </button>
      </div>
    </div>
  );
};

export default ScreebaiCanvas;
