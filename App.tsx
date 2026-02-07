
import React, { useState } from 'react';
import { Sigma, BookOpen, Lightbulb, History, Trash2, Camera, Upload } from 'lucide-react';
import Canvas from './components/Canvas';
import { solveEquation } from './services/gemini';
import { AppStatus, MathSolution } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [solution, setSolution] = useState<MathSolution | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<MathSolution[]>([]);

  const handleCapture = async (dataUrl: string) => {
    try {
      setStatus(AppStatus.SOLVING);
      setError(null);
      const result = await solveEquation(dataUrl);
      setSolution(result);
      setHistory(prev => [result, ...prev].slice(0, 10));
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to solve the equation. Please try again.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleCapture(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <Sigma size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">MathScribe AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors text-sm font-medium">
              <Upload size={18} />
              <span>Upload Image</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white p-2 rounded-2xl border shadow-sm h-[500px]">
            <Canvas onCapture={handleCapture} isProcessing={status === AppStatus.SOLVING} />
          </div>
          
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex gap-3 text-indigo-800">
            <Lightbulb className="flex-shrink-0" size={24} />
            <p className="text-sm">
              <span className="font-semibold">Tip:</span> Write clearly and include all symbols. You can draw algebra, calculus, or basic arithmetic problems!
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          {status === AppStatus.IDLE && !error && (
            <div className="h-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-12 text-center">
              <div className="bg-slate-50 p-6 rounded-full mb-4">
                <Sigma size={48} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-600">No Solution Yet</h3>
              <p className="max-w-xs mt-2 text-sm">Draw an equation on the canvas and click "Solve" to see the magic happen.</p>
            </div>
          )}

          {status === AppStatus.ERROR && (
            <div className="p-6 bg-red-50 border border-red-100 rounded-2xl">
              <h3 className="text-red-800 font-bold flex items-center gap-2 mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-red-700 text-sm">{error}</p>
              <button 
                onClick={() => setStatus(AppStatus.IDLE)}
                className="mt-4 text-xs font-bold text-red-800 uppercase tracking-wider hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {solution && status !== AppStatus.SOLVING && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-indigo-600 p-4 text-white">
                  <h3 className="font-bold flex items-center gap-2">
                    <BookOpen size={20} />
                    Solution Breakdown
                  </h3>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Detected Equation</span>
                    <div className="mt-2 text-2xl font-serif text-slate-800 bg-slate-50 p-4 rounded-lg overflow-x-auto">
                      {solution.equation}
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Steps</span>
                    <ul className="mt-3 space-y-4">
                      {solution.steps.map((step, idx) => (
                        <li key={idx} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <p className="text-slate-700 text-sm leading-relaxed">{step}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Final Result</span>
                    <div className="mt-2 text-3xl font-bold text-emerald-600">
                      {solution.result}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="text-yellow-400" size={20} />
                  <h4 className="font-bold">The Concept</h4>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  "{solution.explanation}"
                </p>
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3 px-2">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <History size={16} />
                  Recent History
                </h3>
                <button 
                  onClick={() => setHistory([])}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {history.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSolution(item);
                      setStatus(AppStatus.SUCCESS);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-white border hover:border-indigo-300 transition-all shadow-sm group"
                  >
                    <div className="text-sm font-medium text-slate-700 truncate">{item.equation}</div>
                    <div className="text-xs text-slate-400 group-hover:text-indigo-500">Result: {item.result}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
