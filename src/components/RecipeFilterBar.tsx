import React from 'react';
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
  { id: 'todas', label: 'Todas' },
  { id: 'panaderia', label: 'Panadería & Masas' },
  { id: 'pastas', label: 'Platos fuertes & Pastas' },
  { id: 'ensaladas', label: 'Entrantes & Bowls' },
  { id: 'postres', label: 'Postres' },
  { id: 'desayunos', label: 'Bebidas & Desayunos' },
];

const DIETARY_FILTERS: { id: DietaryTag; label: string }[] = [
  { id: 'vegetariano', label: 'Vegetariano' },
  { id: 'vegano', label: 'Vegano' },
  { id: 'celiaco', label: 'Sin gluten' },
  { id: 'keto', label: 'Keto' },
  { id: 'diabetico', label: 'Apto Diabéticos' },
  { id: 'sin_lactosa', label: 'Sin lactosa' },
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
  const toggleTag = (tag: DietaryTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <section className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_4px_24px_-4px_rgba(197,130,38,0.08)] mb-8 border border-stone-200/60">
      {/* Search Bar (RF-16) */}
      <div className="relative w-full mb-6">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-[#835500]">
          <span className="material-symbols-outlined text-[26px]">search</span>
        </div>
        <input
          id="recipe-search"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar recetas por nombre, ingrediente, técnica o autor..."
          className="w-full h-14 pl-14 pr-12 rounded-full bg-[#f6f3f2] text-[#000000] placeholder:text-[#333333]/70 text-sm sm:text-base focus:bg-white focus:ring-2 focus:ring-[#e09f3e] outline-none transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Limpiar búsqueda"
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#333333] hover:text-[#000000] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">cancel</span>
          </button>
        )}
      </div>

      {/* Filter Rows */}
      <div className="space-y-4 pt-1">
        {/* Categories Row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs sm:text-sm font-semibold text-[#333333] w-28 shrink-0 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#835500]">dinner_dining</span>
            Categorías:
          </span>
          <div className="flex flex-wrap gap-2 flex-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#e09f3e] text-white shadow-sm font-semibold'
                    : 'bg-[#f6f3f2] text-[#333333] hover:bg-[#ffddb9] hover:text-[#2b1700]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time, Difficulty & Sort Row */}
        <div className="flex flex-col lg:flex-row gap-4 pt-2">
          {/* Time Filter */}
          <div className="flex flex-wrap items-center gap-2 lg:w-1/3">
            <span className="text-xs sm:text-sm font-semibold text-[#333333] w-28 shrink-0 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#835500]">schedule</span>
              Tiempo:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMaxTime(180)}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  maxTime >= 180
                    ? 'bg-[#fdb252] text-[#714500] font-semibold shadow-sm'
                    : 'bg-[#f6f3f2] text-[#333333] hover:bg-[#ffddb9]'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setMaxTime(30)}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  maxTime <= 30
                    ? 'bg-[#fdb252] text-[#714500] font-semibold shadow-sm'
                    : 'bg-[#f6f3f2] text-[#333333] hover:bg-[#ffddb9]'
                }`}
              >
                &lt; 30 min
              </button>
              <button
                type="button"
                onClick={() => setMaxTime(60)}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  maxTime > 30 && maxTime <= 60
                    ? 'bg-[#fdb252] text-[#714500] font-semibold shadow-sm'
                    : 'bg-[#f6f3f2] text-[#333333] hover:bg-[#ffddb9]'
                }`}
              >
                30 - 60 min
              </button>
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="flex flex-wrap items-center gap-2 lg:w-1/3">
            <span className="text-xs sm:text-sm font-semibold text-[#333333] w-28 shrink-0 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#835500]">hotel_class</span>
              Dificultad:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedDifficulty('todas')}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  selectedDifficulty === 'todas'
                    ? 'bg-[#e09f3e] text-white shadow-sm font-semibold'
                    : 'bg-[#f6f3f2] text-[#333333] hover:bg-[#ffddb9]'
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setSelectedDifficulty('facil')}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  selectedDifficulty === 'facil'
                    ? 'bg-[#e09f3e] text-white shadow-sm font-semibold'
                    : 'bg-[#f6f3f2] text-[#333333] hover:bg-[#ffddb9]'
                }`}
              >
                Fácil
              </button>
              <button
                type="button"
                onClick={() => setSelectedDifficulty('media')}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  selectedDifficulty === 'media'
                    ? 'bg-[#e09f3e] text-white shadow-sm font-semibold'
                    : 'bg-[#f6f3f2] text-[#333333] hover:bg-[#ffddb9]'
                }`}
              >
                Intermedia
              </button>
              <button
                type="button"
                onClick={() => setSelectedDifficulty('dificil')}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  selectedDifficulty === 'dificil'
                    ? 'bg-[#e09f3e] text-white shadow-sm font-semibold'
                    : 'bg-[#f6f3f2] text-[#333333] hover:bg-[#ffddb9]'
                }`}
              >
                Maestro
              </button>
            </div>
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-2 lg:w-1/3">
            <span className="text-xs sm:text-sm font-semibold text-[#333333] w-28 shrink-0 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#835500]">swap_vert</span>
              Ordenar:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 rounded-full text-xs sm:text-sm bg-[#f6f3f2] text-[#333333] border-none outline-none focus:ring-2 focus:ring-[#e09f3e] cursor-pointer"
            >
              <option value="popular">Más populares</option>
              <option value="recent">Más recientes</option>
              <option value="time">Menor tiempo</option>
              <option value="calories">Menor calorías</option>
            </select>
          </div>
        </div>

        {/* Dietary Tags & Reset Action (RF-07) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs sm:text-sm font-semibold text-[#333333] w-28 shrink-0 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#835500]">eco</span>
              Dieta:
            </span>
            <div className="flex flex-wrap gap-2">
              {DIETARY_FILTERS.map((df) => {
                const isActive = selectedTags.includes(df.id);
                return (
                  <button
                    key={df.id}
                    type="button"
                    onClick={() => toggleTag(df.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#835500] text-white shadow-sm font-semibold'
                        : 'bg-[#f6f3f2] text-[#333333] hover:bg-[#ffddb9]'
                    }`}
                  >
                    {df.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset Filters Button */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 text-[#ab3333] hover:text-[#801318] text-xs sm:text-sm px-3.5 py-1.5 rounded-full hover:bg-red-50 transition-colors ml-auto sm:ml-0 font-medium cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              <span>Limpiar filtros ({activeFilterCount})</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
