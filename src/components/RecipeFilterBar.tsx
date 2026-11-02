import React, { useState, useRef } from 'react';
import { DietaryTag } from '../types';

interface RecipeFilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedTags: DietaryTag[];
  setSelectedTags: React.Dispatch<React.SetStateAction<DietaryTag[]>>;
  selectedDifficulty: string;
  setSelectedDifficulty: (diff: string) => void;
  maxTime: number;
  setMaxTime: (t: number) => void;
  sortBy: 'popular' | 'recent' | 'time' | 'calories' | 'comentarios';
  setSortBy: (sort: 'popular' | 'recent' | 'time' | 'calories' | 'comentarios') => void;
  activeFilterCount: number;
  onClearFilters: () => void;
}

const CATEGORIES = [
  { id: 'todas', label: 'Todas las recetas' },
  { id: 'panaderia', label: 'Panadería & Masas' },
  { id: 'pastas', label: 'Platos fuertes & Pastas' },
  { id: 'ensaladas', label: 'Entrantes & Bowls' },
  { id: 'sopas', label: 'Sopas & Cremas' },
  { id: 'postres', label: 'Postres & Dulces' },
  { id: 'desayunos', label: 'Bebidas & Desayunos' },
];

const DIETARY_OPTIONS: { id: DietaryTag; label: string }[] = [
  { id: 'vegetariano', label: 'Vegetariano' },
  { id: 'vegano', label: 'Vegano' },
  { id: 'celiaco', label: 'Sin gluten (Celíacos)' },
  { id: 'diabetico', label: 'Apto Diabéticos' },
  { id: 'keto', label: 'Dieta Keto' },
  { id: 'sin_lactosa', label: 'Sin lactosa' },
  { id: 'bajo_sodio', label: 'Bajo en sodio' },
];

export const RecipeFilterBar: React.FC<RecipeFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedTags,
  setSelectedTags,
  selectedDifficulty,
  setSelectedDifficulty,
  maxTime,
  setMaxTime,
  sortBy,
  setSortBy,
  activeFilterCount,
  onClearFilters,
}) => {
  // Collapsed by default as requested
  const [isOpen, setIsOpen] = useState(false);
  const categoriesContainerRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesContainerRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      categoriesContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleDietSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as DietaryTag | 'all';
    if (val === 'all') {
      setSelectedTags([]);
    } else if (val) {
      if (!selectedTags.includes(val)) {
        setSelectedTags((prev) => [...prev, val]);
      }
    }
  };

  const removeDietTag = (tag: DietaryTag) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  return (
    <section className="bg-zinc-900/90 rounded-2xl p-4 sm:p-5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)] mb-8 border border-zinc-800 transition-all">
      {/* Search Bar with integrated Chevron Toggle Arrow */}
      <div className="relative w-full flex items-center">
        <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-amber-400">
          <span className="material-symbols-outlined text-[24px]">search</span>
        </div>

        <input
          id="recipe-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar recetas por nombre, ingrediente, técnica o autor..."
          className="w-full h-12 sm:h-13 pl-12 sm:pl-14 pr-28 sm:pr-32 rounded-xl bg-zinc-950 text-zinc-100 placeholder:text-zinc-500 text-xs sm:text-sm border border-zinc-800 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 outline-none transition-all shadow-inner"
        />

        {/* Right side controls: Clear input button + Toggle arrow with counter */}
        <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center gap-1.5">
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Limpiar búsqueda"
              title="Borrar texto"
              className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
            </button>
          )}

          {/* Toggle Button with Arrow */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? 'Ocultar filtros avanzados' : 'Desplegar filtros avanzados'}
            title={isOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isOpen
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : activeFilterCount > 0
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/80'
            }`}
          >
            <span className="hidden sm:inline">Filtros</span>
            {activeFilterCount > 0 && (
              <span
                className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                  isOpen ? 'bg-zinc-950 text-amber-400' : 'bg-amber-500 text-zinc-950'
                }`}
              >
                {activeFilterCount}
              </span>
            )}
            <span
              className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${
                isOpen ? 'rotate-180' : 'rotate-0'
              }`}
            >
              expand_more
            </span>
          </button>
        </div>
      </div>

      {/* Collapsible Filters Container */}
      {isOpen && (
        <div className="mt-5 pt-4 border-t border-zinc-800/80 space-y-4 animate-fade-in">
          
          {/* CATEGORIES with lateral overflow navigation arrows */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-300 shrink-0 hidden md:flex items-center gap-1.5 w-24">
              <span className="material-symbols-outlined text-[16px] text-amber-400">dinner_dining</span>
              Categoría:
            </span>

            {/* Left Scroll Arrow */}
            <button
              type="button"
              onClick={() => scrollCategories('left')}
              aria-label="Desplazar categorías hacia la izquierda"
              className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 border border-zinc-700/60 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>

            {/* Scrollable Container */}
            <div
              ref={categoriesContainerRef}
              className="flex items-center gap-2 overflow-x-auto scroll-smooth py-1 px-1 flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)] font-bold'
                      : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:text-amber-300 hover:bg-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Right Scroll Arrow */}
            <button
              type="button"
              onClick={() => scrollCategories('right')}
              aria-label="Desplazar categorías hacia la derecha"
              className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 border border-zinc-700/60 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          {/* ALL OTHER FILTERS AS CLEAN DROPDOWNS (Grid of 4) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            
            {/* 1. Restricción Dietética Dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-amber-400">eco</span>
                Restricción Dietética:
              </label>
              <select
                onChange={handleDietSelectChange}
                value=""
                className="w-full h-10 px-3 rounded-xl bg-zinc-950 text-xs text-zinc-200 border border-zinc-800 outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 cursor-pointer font-medium"
              >
                <option value="" disabled>Seleccionar dieta / alérgeno...</option>
                <option value="all">Todas las dietas (Limpiar)</option>
                {DIETARY_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Tiempo Máximo Dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-amber-400">schedule</span>
                Tiempo de Cocina:
              </label>
              <select
                value={maxTime}
                onChange={(e) => setMaxTime(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl bg-zinc-950 text-xs text-zinc-200 border border-zinc-800 outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 cursor-pointer font-medium"
              >
                <option value={180}>Cualquier duración</option>
                <option value={30}>Rápido (&lt; 30 min)</option>
                <option value={60}>Medio (&lt; 60 min)</option>
                <option value={90}>Elaborado (&lt; 90 min)</option>
                <option value={120}>Lenta cocción (&lt; 120 min)</option>
              </select>
            </div>

            {/* 3. Dificultad Dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-amber-400">hotel_class</span>
                Dificultad:
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-zinc-950 text-xs text-zinc-200 border border-zinc-800 outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 cursor-pointer font-medium"
              >
                <option value="todas">Todas las dificultades</option>
                <option value="facil">Fácil (Principiante)</option>
                <option value="media">Intermedia</option>
                <option value="dificil">Maestro / Chef</option>
              </select>
            </div>

            {/* 4. Ordenar Dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-amber-400">swap_vert</span>
                Ordenar por:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl bg-zinc-950 text-xs text-zinc-200 border border-zinc-800 outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 cursor-pointer font-medium"
              >
                <option value="popular">Más populares (Votos)</option>
                <option value="comentarios">Más comentadas (Interacción)</option>
                <option value="recent">Más recientes</option>
                <option value="time">Menor tiempo total</option>
                <option value="calories">Menos calorías</option>
              </select>
            </div>

          </div>

          {/* Active Dietary Tags Chips & Reset Filters Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {/* Selected Tags Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {selectedTags.length > 0 ? (
                <>
                  <span className="text-[11px] font-semibold text-zinc-400 mr-1">Filtros aplicados:</span>
                  {selectedTags.map((tag) => {
                    const found = DIETARY_OPTIONS.find((d) => d.id === tag);
                    return (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-amber-500/15 border border-amber-500/30 text-amber-300"
                      >
                        <span>{found?.label || tag}</span>
                        <button
                          type="button"
                          onClick={() => removeDietTag(tag)}
                          className="hover:text-red-400 cursor-pointer text-xs font-bold"
                          title="Quitar filtro"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </>
              ) : (
                <span className="text-[11px] text-zinc-500">Sin restricciones dietéticas activas</span>
              )}
            </div>

            {/* Clear All Filters Button */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs px-3 py-1.5 rounded-lg hover:bg-red-950/40 border border-red-900/40 transition-colors font-medium cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Restablecer todo ({activeFilterCount})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
