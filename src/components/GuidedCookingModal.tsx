import React, { useState, useEffect, useRef } from 'react';
import { Recipe } from '../types';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ChefHat,
  Flame,
  Users
} from 'lucide-react';

interface GuidedCookingModalProps {
  recipe: Recipe | null;
  onClose: () => void;
}

export const GuidedCookingModal: React.FC<GuidedCookingModalProps> = ({
  recipe,
  onClose,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const activeStep = recipe?.steps[currentStepIndex];

  // Initialize timer for current step
  useEffect(() => {
    if (activeStep) {
      setTimerSeconds((activeStep.durationMinutes || 5) * 60);
      setIsTimerRunning(false);
    }
  }, [currentStepIndex, recipe]);

  // Timer Countdown Effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      playChime();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // Audio chime alert using Web Audio API synthesizer
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      // Audio context fallback
    }
  };

  // Text-To-Speech Readout
  const handleSpeakStep = () => {
    if (!('speechSynthesis' in window) || !activeStep) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `Paso ${activeStep.stepNumber}: ${activeStep.title}. ${activeStep.description}. ${activeStep.tip ? `Consejo del chef: ${activeStep.tip}` : ''}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'es-ES';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Cleanup speech synthesis on unmount or step change
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentStepIndex]);

  if (!recipe) return null;

  const totalSteps = recipe.steps.length;
  const progressPercent = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  const formatTimerText = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextStep = () => {
    if (!completedSteps.includes(currentStepIndex)) {
      setCompletedSteps((prev) => [...prev, currentStepIndex]);
    }

    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 text-zinc-100 flex flex-col justify-between p-4 sm:p-8 overflow-y-auto animate-in fade-in duration-300">
      
      {/* Top Navigation & Status Bar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between gap-4 pb-4 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Modo Cocina Guiada Inmersiva
              </span>
              <span className="text-[10px] bg-amber-500 text-zinc-950 font-black px-2 py-0.5 rounded-full uppercase">
                Chef PRO
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-zinc-100 truncate max-w-md">
              {recipe.title}
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Salir del modo cocina"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Bar Header */}
      <div className="w-full max-w-5xl mx-auto my-3 shrink-0">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-semibold mb-1.5">
          <span>Paso {currentStepIndex + 1} de {totalSteps}</span>
          <span className="text-amber-400 font-bold">{progressPercent}% completado</span>
        </div>
        <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Interactive Stage */}
      {isFinished ? (
        /* Celebration Finish View */
        <div className="my-auto w-full max-w-2xl mx-auto text-center space-y-6 bg-zinc-900/80 p-8 sm:p-12 rounded-3xl border border-amber-500/40 shadow-2xl">
          <div className="w-20 h-20 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
            <Sparkles className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-zinc-100">
              ¡Felicitaciones Chef!
            </h3>
            <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
              Has completado todos los pasos de la receta <strong>"{recipe.title}"</strong>. Es momento de emplatar y disfrutar tu plato culinario.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setIsFinished(false);
                setCurrentStepIndex(0);
              }}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-zinc-700"
            >
              Reiniciar desde el Paso 1
            </button>
            <button
              onClick={onClose}
              className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              Finalizar y Salir
            </button>
          </div>
        </div>
      ) : activeStep ? (
        /* Active Step Card */
        <div className="my-auto w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch py-4">
          
          {/* Left Column: Step Details & Text (7 cols) */}
          <div className="lg:col-span-7 bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-xl flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="px-3.5 py-1 bg-amber-500 text-zinc-950 font-extrabold text-xs sm:text-sm rounded-full shadow-md">
                  Paso {activeStep.stepNumber}
                </span>

                <button
                  onClick={handleSpeakStep}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    isSpeaking
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-amber-400 hover:border-amber-500/40'
                  }`}
                  title="Lectura por voz manos libres"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isSpeaking ? 'Detener Voz' : 'Escuchar Paso por Voz'}</span>
                </button>
              </div>

              <h3 className="text-xl sm:text-3xl font-extrabold text-zinc-100 font-display leading-tight mb-4">
                {activeStep.title}
              </h3>

              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal whitespace-pre-line mb-6">
                {activeStep.description}
              </p>

              {/* Chef Tip Callout if present */}
              {activeStep.tip && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm text-amber-300 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold text-amber-200 mb-0.5">Consejo del Chef:</strong>
                    <span>{activeStep.tip}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Step image if available */}
            {activeStep.imageUrl && (
              <img
                src={activeStep.imageUrl}
                alt={activeStep.title}
                className="w-full max-h-48 object-cover rounded-2xl border border-zinc-800 shadow-md"
              />
            )}
          </div>

          {/* Right Column: Floating Timer & Quick Control Panel (5 cols) */}
          <div className="lg:col-span-5 bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-xl flex flex-col items-center justify-between text-center space-y-6">
            <div className="w-full">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">
                Temporizador del Paso
              </span>

              {/* Large Digital Timer Display */}
              <div className="relative my-4 py-8 px-6 bg-zinc-950 rounded-3xl border border-zinc-800 shadow-inner flex flex-col items-center justify-center">
                <div className="text-5xl sm:text-6xl font-black font-mono tracking-wider text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                  {formatTimerText(timerSeconds)}
                </div>
                <span className="text-xs text-zinc-500 mt-2 font-medium">
                  {timerSeconds === 0 ? '¡Tiempo completado!' : 'Tiempo estimado de cocción'}
                </span>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md ${
                    isTimerRunning
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Iniciar Reloj</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds((activeStep.durationMinutes || 5) * 60);
                  }}
                  className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-2xl transition-colors cursor-pointer border border-zinc-700"
                  title="Reiniciar temporizador"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Ingredients Needed for this Step */}
            <div className="w-full text-left pt-4 border-t border-zinc-800">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Receta Global
              </span>
              <div className="flex items-center justify-between text-xs text-zinc-300 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  {recipe.nutrition.calories} kcal
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  {recipe.servings} raciones
                </span>
              </div>
            </div>

          </div>
        </div>
      ) : null}

      {/* Bottom Step Control Navigation */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between gap-4 pt-4 border-t border-zinc-800 shrink-0">
        <button
          onClick={handlePrevStep}
          disabled={currentStepIndex === 0 || isFinished}
          className="px-5 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Paso Anterior</span>
        </button>

        <div className="text-xs text-zinc-400 font-semibold hidden sm:block">
          Usa los botones para navegar sin tocar la pantalla con ingredientes
        </div>

        <button
          onClick={handleNextStep}
          disabled={isFinished}
          className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <span>{currentStepIndex === totalSteps - 1 ? '¡Finalizar Cocción!' : 'Siguiente Paso'}</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};
