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
          const { width, height } = container.getBoundingClientRect();
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
    
    // Update canvas size on window resize
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      clearTimeout(initTimer);
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
      
      // Prevent scrolling when drawing
      e.preventDefault();
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
      <div className="flex justify-between items-center mt-4 px-2">
        <div className="flex space-x-2">
          <button
            className={`p-2 rounded-md ${currentTool === 'pen' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setCurrentTool('pen')}
          >
            Penna
          </button>
          <button
            className={`p-2 rounded-md ${currentTool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setCurrentTool('eraser')}
          >
            Gomma
          </button>
          <button
            className="p-2 bg-red-500 text-white rounded-md"
            onClick={clearCanvas}
          >
            Cancella tutto
          </button>
        </div>
        <button
          className="p-2 bg-green-500 text-white rounded-md"
          onClick={exportImage}
        >
          Finito
        </button>
      </div>
    </div>
  );
};

export default ScreebaiCanvas;
