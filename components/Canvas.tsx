
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, RotateCcw, PenTool } from 'lucide-react';

interface CanvasProps {
  onCapture: (dataUrl: string) => void;
  isProcessing: boolean;
}

const Canvas: React.FC<CanvasProps> = ({ onCapture, isProcessing }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#1e293b');
  const [lineWidth, setLineWidth] = useState(3);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [color, lineWidth]);

  useEffect(() => {
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, [setupCanvas]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isProcessing) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isProcessing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    let x, y;
    if ('touches' in e) {
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleCapture = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onCapture(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b rounded-t-xl">
        <div className="flex gap-2">
          <button 
            onClick={() => setColor('#1e293b')}
            className={`p-2 rounded-lg transition-colors ${color === '#1e293b' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100'}`}
            title="Pen"
          >
            <PenTool size={20} />
          </button>
          <button 
            onClick={() => setColor('#ffffff')}
            className={`p-2 rounded-lg transition-colors ${color === '#ffffff' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100'}`}
            title="Eraser"
          >
            <Eraser size={20} />
          </button>
          <div className="w-px h-6 bg-slate-200 self-center mx-1" />
          <button 
            onClick={clearCanvas}
            className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
            title="Clear All"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={lineWidth} 
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="w-24 accent-indigo-600"
          />
          <button
            onClick={handleCapture}
            disabled={isProcessing}
            className={`px-6 py-2 rounded-lg font-semibold transition-all shadow-sm
              ${isProcessing 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:transform active:scale-95'
              }`}
          >
            {isProcessing ? 'Solving...' : 'Solve Equation'}
          </button>
        </div>
      </div>

      <div className="relative flex-grow bg-white rounded-b-xl border shadow-inner overflow-hidden cursor-crosshair touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={draw}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchMove={draw}
          className="w-full h-full"
        />
        {isProcessing && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-indigo-900 font-medium">Analyzing your handwriting...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
