import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Recipe, DietaryTag } from '../types';
import { WeeklyShoppingModal } from './WeeklyShoppingModal';
import { formatARS } from '../utils/currency';
import {
  Calendar,
  Sparkles,
  Crown,
  ChefHat,
  Layers,
  Plus,
  Trash2,
  Play,
  Clock,
  Flame,
  X,
  CheckCircle2,
  RefreshCw,
  Search
} from 'lucide-react';

interface MealPlannerViewProps {
  onOpenDetail: (recipe: Recipe) => void;
  onOpenSubscription: () => void;
  onOpenGuidedCooking: (recipe: Recipe) => void;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const SLOTS = ['Desayuno', 'Almuerzo', 'Cena'];

export const MealPlannerView: React.FC<MealPlannerViewProps> = ({
  onOpenDetail,
  onOpenSubscription,
  onOpenGuidedCooking,
}) => {
  const { currentUser, recipes, showToast, hasPremiumAccess } = useApp();

  const isPremiumUser = hasPremiumAccess;

  // Planner matrix state: day -> slot -> Recipe
  const [planner, setPlanner] = useState<Record<string, Record<string, Recipe | null>>>(() => {
    const initial: Record<string, Record<string, Recipe | null>> = {};
    DAYS.forEach((day) => {
      initial[day] = { Desayuno: null, Almuerzo: null, Cena: null };
    });
    // Seed default initial recipes if available
    const published = recipes.filter((r) => r.status === 'published');
    if (published.length >= 3) {
      initial['Lunes']['Desayuno'] = published[0] || null;
      initial['Lunes']['Almuerzo'] = published[1] || null;
      initial['Lunes']['Cena'] = published[2] || null;
    }
    return initial;
  });

  // Modal selector for assigning recipe
  const [activeSlotTarget, setActiveSlotTarget] = useState<{ day: string; slot: string } | null>(null);
  const [recipeSearch, setRecipeSearch] = useState('');
  
  // AI Generator Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiGoal, setAiGoal] = useState<'equilibrado' | 'vegano' | 'celiaco' | 'keto' | 'rapido'>('equilibrado');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Weekly Shopping Modal State
  const [isWeeklyShoppingOpen, setIsWeeklyShoppingOpen] = useState(false);

  // Get all unique assigned recipes across the week
  const allAssignedRecipes: Recipe[] = [];
  const assignedRecipeIds = new Set<string>();

  DAYS.forEach((day) => {
    SLOTS.forEach((slot) => {
      const r = planner[day]?.[slot];
      if (r && !assignedRecipeIds.has(r.id)) {
        assignedRecipeIds.add(r.id);
        allAssignedRecipes.push(r);
      }
    });
  });

  const handleOpenAssignModal = (day: string, slot: string) => {
    if (!isPremiumUser) {
      onOpenSubscription();
      return;
    }
    setActiveSlotTarget({ day, slot });
  };

  const handleAssignRecipe = (recipe: Recipe) => {
    if (!activeSlotTarget) return;
    setPlanner((prev) => ({
      ...prev,
      [activeSlotTarget.day]: {
        ...prev[activeSlotTarget.day],
        [activeSlotTarget.slot]: recipe,
      },
    }));
    setActiveSlotTarget(null);
    showToast(`Receta "${recipe.title}" asignada a ${activeSlotTarget.day} (${activeSlotTarget.slot}).`);
  };

  const handleClearSlot = (day: string, slot: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPremiumUser) {
      onOpenSubscription();
      return;
    }
    setPlanner((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: null,
      },
    }));
  };

  const handleGenerateAiPlan = () => {
    if (!isPremiumUser) {
      onOpenSubscription();
      return;
    }

    setIsGeneratingAi(true);

    setTimeout(() => {
      const published = recipes.filter((r) => r.status === 'published');
      let filtered = published;

      if (aiGoal === 'vegano') {
        filtered = published.filter((r) => r.tags.includes('vegano') || r.tags.includes('vegetariano'));
      } else if (aiGoal === 'celiaco') {
        filtered = published.filter((r) => r.tags.includes('celiaco'));
      } else if (aiGoal === 'keto') {
        filtered = published.filter((r) => r.tags.includes('keto'));
      }

      if (filtered.length === 0) filtered = published;

      const nextPlanner: Record<string, Record<string, Recipe | null>> = {};
      let poolIndex = 0;

      DAYS.forEach((day) => {
        nextPlanner[day] = {};
        SLOTS.forEach((slot) => {
          nextPlanner[day][slot] = filtered[poolIndex % filtered.length] || null;
          poolIndex++;
        });
      });

      setPlanner(nextPlanner);
      setIsGeneratingAi(false);
      setIsAiModalOpen(false);
      showToast('¡Plan semanal con IA generado con éxito según tus preferencias!');
    }, 1200);
  };

  const publishedRecipes = recipes.filter((r) => r.status === 'published');
  const filteredCatalogForModal = publishedRecipes.filter((r) =>
    r.title.toLowerCase().includes(recipeSearch.toLowerCase()) ||
    r.category.toLowerCase().includes(recipeSearch.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col gap-8 pb-16">
      
      {/* Top Header & Actions */}
      <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span className="text-xs uppercase tracking-wider font-extrabold text-amber-400">
              Planificación Culinaria Semanal
            </span>
            <span className="text-[10px] bg-amber-500 text-zinc-950 font-black px-2 py-0.5 rounded-full uppercase">
              Chef PRO
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Planificador Semanal de Menús Inteligente
          </h1>
          <p className="text-sm md:text-base text-zinc-400 max-w-3xl mt-1">
            Organiza tus desayunos, almuerzos y cenas de Lunes a Domingo. Genera combinaciones automáticas con IA y unifica tu lista de compras en un solo clic.
          </p>
        </div>

        {/* Action Cluster */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (!isPremiumUser) {
                onOpenSubscription();
              } else {
                setIsAiModalOpen(true);
              }
            }}
            className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generar Plan con IA</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isPremiumUser) {
                onOpenSubscription();
              } else {
                setIsWeeklyShoppingOpen(true);
              }
            }}
            className="px-5 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-bold text-xs sm:text-sm flex items-center gap-2 border border-zinc-800 transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Consolidar Compras ({allAssignedRecipes.length})</span>
          </button>
        </div>
      </div>

      {/* Non-Premium Promotion Banner if user is Free */}
      {!isPremiumUser && (
        <div className="bg-gradient-to-r from-amber-950/60 via-zinc-900 to-amber-950/60 rounded-3xl p-6 sm:p-8 border border-amber-500/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display text-lg sm:text-xl font-bold text-zinc-100">
                  Desbloquea el Planificador Semanal con Chef Premium
                </h3>
                <span className="text-[10px] bg-amber-400 text-zinc-950 font-black px-2 py-0.5 rounded-full uppercase">
                  Exclusivo
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                El planificador con IA, la consolidación automática de compras semanales y el Modo Cocina Guiada Inmersivo están reservados para usuarios Premium.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenSubscription}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold rounded-full text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all whitespace-nowrap cursor-pointer shrink-0"
          >
            Mejorar a Chef Premium
          </button>
        </div>
      )}

      {/* Weekly Calendar Grid (Monday to Sunday) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {DAYS.map((day) => (
          <div
            key={day}
            className="bg-zinc-900 rounded-3xl p-4 border border-zinc-800 shadow-xl flex flex-col justify-between space-y-3"
          >
            {/* Day Header */}
            <div className="pb-2 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-100 font-display uppercase tracking-wider">
                {day}
              </h3>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                3 comidas
              </span>
            </div>

            {/* Meal Slots */}
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              {SLOTS.map((slot) => {
                const assignedRecipe = planner[day]?.[slot];

                return (
                  <div
                    key={slot}
                    className={`rounded-2xl p-3 border transition-all flex flex-col justify-between min-h-[110px] ${
                      assignedRecipe
                        ? 'bg-zinc-950 border-amber-500/40 hover:border-amber-500 shadow-md'
                        : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 text-[11px] mb-1.5">
                      <span className="font-bold text-zinc-400 uppercase tracking-wider">
                        {slot}
                      </span>
                      {assignedRecipe && (
                        <button
                          type="button"
                          onClick={(e) => handleClearSlot(day, slot, e)}
                          className="text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Quitar receta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {assignedRecipe ? (
                      <div className="space-y-2">
                        <h4
                          onClick={() => onOpenDetail(assignedRecipe)}
                          className="font-bold text-xs text-zinc-100 line-clamp-2 leading-snug hover:text-amber-400 transition-colors cursor-pointer"
                        >
                          {assignedRecipe.title}
                        </h4>

                        <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/80">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {assignedRecipe.prepTimeMin + assignedRecipe.cookTimeMin}m
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              if (!isPremiumUser) {
                                onOpenSubscription();
                              } else {
                                onOpenGuidedCooking(assignedRecipe);
                              }
                            }}
                            className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-zinc-950 font-bold transition-all cursor-pointer flex items-center gap-1"
                            title="Iniciar Modo Cocina Guiada Inmersivo"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>Guiada</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenAssignModal(day, slot)}
                        className="my-auto py-3 px-2 border border-dashed border-zinc-800 hover:border-amber-500/40 rounded-xl text-zinc-500 hover:text-amber-400 text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Asignar Plato</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ASSIGN RECIPE TO SLOT */}
      {activeSlotTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-900 text-zinc-100 w-full max-w-xl rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base text-zinc-100 font-display">
                  Asignar Plato a {activeSlotTarget.day} ({activeSlotTarget.slot})
                </h3>
                <p className="text-xs text-zinc-400">
                  Elige una receta de tu catálogo para este momento del día
                </p>
              </div>
              <button
                onClick={() => setActiveSlotTarget(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-950">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar receta por nombre o categoría..."
                  value={recipeSearch}
                  onChange={(e) => setRecipeSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Recipe List */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {filteredCatalogForModal.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-500">
                  No se encontraron recetas con ese nombre.
                </div>
              ) : (
                filteredCatalogForModal.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => handleAssignRecipe(r)}
                    className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800/80 hover:border-amber-500/50 flex items-center justify-between gap-3 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={r.coverImage}
                        alt={r.title}
                        className="w-10 h-10 rounded-xl object-cover border border-zinc-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-zinc-100 truncate">{r.title}</h4>
                        <span className="text-[10px] text-amber-400 uppercase font-semibold">
                          {r.category} • {r.prepTimeMin + r.cookTimeMin}m
                        </span>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shrink-0">
                      Seleccionar
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AI GENERATOR GOAL SELECTOR */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-900 text-zinc-100 w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-6 h-6 text-amber-400" />
                <h3 className="font-bold text-lg font-display text-zinc-100">
                  Generar Plan Semanal con IA
                </h3>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Selecciona tu objetivo nutricional o restricción dietética para que el motor de Inteligencia Culinaria arme automáticamente tu menú de Lunes a Domingo:
            </p>

            <div className="space-y-2">
              {[
                { id: 'equilibrado', label: 'Equilibrado Gourmet (Variedad Completa)' },
                { id: 'vegano', label: 'Vegano & Vegetariano' },
                { id: 'celiaco', label: 'Sin TACC / Apto Celíacos' },
                { id: 'keto', label: 'Dieta Keto / Alto en Proteínas' },
                { id: 'rapido', label: 'Rápido & Económico (< 30 min)' },
              ].map((goal) => (
                <label
                  key={goal.id}
                  onClick={() => setAiGoal(goal.id as any)}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    aiGoal === goal.id
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-xs font-semibold">{goal.label}</span>
                  <input
                    type="radio"
                    name="aiGoal"
                    checked={aiGoal === goal.id}
                    onChange={() => {}}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isGeneratingAi}
                onClick={handleGenerateAiPlan}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Optimizando Menú Semanal...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generar Plan Ahora</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WEEKLY CONSOLIDATED SHOPPING MODAL */}
      <WeeklyShoppingModal
        isOpen={isWeeklyShoppingOpen}
        onClose={() => setIsWeeklyShoppingOpen(false)}
        plannedRecipes={allAssignedRecipes}
      />

    </div>
  );
};
