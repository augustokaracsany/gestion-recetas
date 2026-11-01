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
  sortBy: 'popular' | 'recent' | 'time' | 'calories';
  setSortBy: (sort: 'popular' | 'recent' | 'time' | 'calories') => void;
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

const DIETARY_OPTIONS: { id: DietaryTag; label: string; icon: string }[] = [
  { id: 'vegetariano', label: 'Vegetariano', icon: '🧀' },
  { id: 'vegano', label: 'Vegano', icon: '🌱' },
  { id: 'celiaco', label: 'Sin gluten (Celíacos)', icon: '🌾' },
  { id: 'diabetico', label: 'Apto Diabéticos', icon: '🩺' },
  { id: 'keto', label: 'Dieta Keto', icon: '🥑' },
  { id: 'sin_lactosa', label: 'Sin lactosa', icon: '🥛' },
  { id: 'bajo_sodio', label: 'Bajo en sodio', icon: '🧂' },
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
    <section className="bg-white rounded-3xl p-4 sm:p-6 shadow-[0_4px_24px_-4px_rgba(197,130,38,0.08)] mb-8 border border-stone-200/60 transition-all">
      {/* Search Bar with integrated Chevron Toggle Arrow */}
      <div className="relative w-full flex items-center">
        <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-[#835500]">
          <span className="material-symbols-outlined text-[24px]">search</span>
        </div>

        <input
          id="recipe-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar recetas por nombre, ingrediente, técnica o autor..."
          className="w-full h-13 sm:h-14 pl-12 sm:pl-14 pr-28 sm:pr-32 rounded-full bg-[#f6f3f2] text-[#000000] placeholder:text-[#333333]/70 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-[#e09f3e] outline-none transition-all shadow-inner"
        />

        {/* Right side controls: Clear input button + Toggle arrow with counter */}
        <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center gap-1.5">
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Limpiar búsqueda"
              title="Borrar texto"
              className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
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
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              isOpen
                ? 'bg-[#e09f3e] text-white shadow-sm'
                : activeFilterCount > 0
                ? 'bg-[#ffddb9] text-[#714500] hover:bg-[#fdb252]'
                : 'bg-stone-200/80 hover:bg-stone-300 text-stone-700'
            }`}
          >
            <span className="hidden sm:inline">Filtros</span>
            {activeFilterCount > 0 && (
              <span
                className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                  isOpen ? 'bg-white text-[#835500]' : 'bg-[#835500] text-white'
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
        <div className="mt-5 pt-4 border-t border-stone-200/70 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* CATEGORIES with lateral overflow navigation arrows */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-700 shrink-0 hidden md:flex items-center gap-1 w-24">
              <span className="material-symbols-outlined text-[16px] text-[#835500]">dinner_dining</span>
              Categoría:
            </span>

            {/* Left Scroll Arrow */}
            <button
              type="button"
              onClick={() => scrollCategories('left')}
              aria-label="Desplazar categorías hacia la izquierda"
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-[#ffddb9] text-stone-700 hover:text-[#835500] flex items-center justify-center shrink-0 transition-colors shadow-2xs cursor-pointer"
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
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#e09f3e] text-white shadow-sm font-bold'
                      : 'bg-[#f6f3f2] text-stone-700 hover:bg-[#ffddb9] hover:text-[#2b1700]'
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
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-[#ffddb9] text-stone-700 hover:text-[#835500] flex items-center justify-center shrink-0 transition-colors shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          {/* ALL OTHER FILTERS AS CLEAN DROPDOWNS (Grid of 4) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            
            {/* 1. Restricción Dietética Dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-600 uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#835500]">eco</span>
                Restricción Dietética:
              </label>
              <select
                onChange={handleDietSelectChange}
                value=""
                className="w-full h-10 px-3 rounded-2xl bg-[#f6f3f2] text-xs text-stone-800 border border-stone-200 outline-none focus:ring-2 focus:ring-[#e09f3e] cursor-pointer font-medium"
              >
                <option value="" disabled>Seleccionar dieta / alérgeno...</option>
                <option value="all">Todas las dietas (Limpiar)</option>
                {DIETARY_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Tiempo Máximo Dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-600 uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#835500]">schedule</span>
                Tiempo de Cocina:
              </label>
              <select
                value={maxTime}
                onChange={(e) => setMaxTime(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-2xl bg-[#f6f3f2] text-xs text-stone-800 border border-stone-200 outline-none focus:ring-2 focus:ring-[#e09f3e] cursor-pointer font-medium"
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
              <label className="text-[11px] font-bold text-stone-600 uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#835500]">hotel_class</span>
                Dificultad:
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full h-10 px-3 rounded-2xl bg-[#f6f3f2] text-xs text-stone-800 border border-stone-200 outline-none focus:ring-2 focus:ring-[#e09f3e] cursor-pointer font-medium"
              >
                <option value="todas">Todas las dificultades</option>
                <option value="facil">Fácil (Principiante)</option>
                <option value="media">Intermedia</option>
                <option value="dificil">Maestro / Chef</option>
              </select>
            </div>

            {/* 4. Ordenar Dropdown */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-600 uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#835500]">swap_vert</span>
                Ordenar por:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full h-10 px-3 rounded-2xl bg-[#f6f3f2] text-xs text-stone-800 border border-stone-200 outline-none focus:ring-2 focus:ring-[#e09f3e] cursor-pointer font-medium"
              >
                <option value="popular">Más populares (Votos)</option>
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
                  <span className="text-[11px] font-semibold text-stone-500 mr-1">Filtros aplicados:</span>
                  {selectedTags.map((tag) => {
                    const found = DIETARY_OPTIONS.find((d) => d.id === tag);
                    return (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#ffddb9] text-[#714500]"
                      >
                        <span>{found?.icon} {found?.label || tag}</span>
                        <button
                          type="button"
                          onClick={() => removeDietTag(tag)}
                          className="hover:text-red-700 cursor-pointer text-xs"
                          title="Quitar filtro"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </>
              ) : (
                <span className="text-[11px] text-stone-400">Sin restricciones dietéticas activas</span>
              )}
            </div>

            {/* Clear All Filters Button */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex items-center gap-1.5 text-[#ab3333] hover:text-[#801318] text-xs px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors font-medium cursor-pointer"
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
