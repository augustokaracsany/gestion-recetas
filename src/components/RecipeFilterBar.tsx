import React from 'react';
import { DietaryTag } from '../types';
import { Search, Filter, SlidersHorizontal, X, Clock, Flame } from 'lucide-react';

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
  { id: 'todas', label: 'Todas las Recetas' },
  { id: 'panaderia', label: '🥖 Panadería & Masas' },
  { id: 'pastas', label: '🍝 Pastas Italianas' },
  { id: 'ensaladas', label: '🥗 Ensaladas & Bowls' },
  { id: 'platos_fuertes', label: '🍲 Platos Fuertes' },
  { id: 'sopas', label: '🥣 Sopas & Cremas' },
  { id: 'postres', label: '🍰 Postres & Dulces' },
  { id: 'desayunos', label: '🥞 Desayunos' },
];

const DIETARY_FILTERS: { id: DietaryTag; label: string }[] = [
  { id: 'celiaco', label: '🌾 Sin TACC / Celíacos' },
  { id: 'vegano', label: '🌱 Vegano' },
  { id: 'vegetariano', label: '🧀 Vegetariano' },
  { id: 'diabetico', label: '🩺 Apto Diabéticos' },
  { id: 'keto', label: '🥑 Keto Low-Carb' },
  { id: 'sin_lactosa', label: '🥛 Sin Lactosa' },
  { id: 'bajo_sodio', label: '🧂 Bajo Sodio' },
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
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const toggleTag = (tag: DietaryTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-sm space-y-4">
      {/* Top Search Input & Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Bar (RF-16) */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Buscar por título, ingredientes (ej. palta, almendras) o palabras clave (RF-16)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden transition-all placeholder:text-stone-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Toggle Advanced Filters Button */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border text-xs sm:text-sm font-semibold transition-all ${
            showAdvanced || activeFilterCount > 0
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filtros Dietéticos (RF-07)</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-amber-700 text-xs font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort Select */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3.5 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-semibold text-stone-700 focus:ring-2 focus:ring-amber-500 focus:outline-hidden cursor-pointer"
        >
          <option value="popular">Más Populares (Likes RF-14)</option>
          <option value="recent">Más Recientes</option>
          <option value="time">Menor Tiempo Total</option>
          <option value="calories">Bajo en Calorías</option>
        </select>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                isSelected
                  ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Advanced Filter Panel (Collapsible RF-07) */}
      {showAdvanced && (
        <div className="pt-4 border-t border-stone-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Dietary Restrictions Tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                Restricciones Dietéticas Específicas (RF-07):
              </span>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="text-xs text-amber-700 hover:underline font-bold"
                >
                  Limpiar Filtros
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {DIETARY_FILTERS.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-amber-50 hover:border-amber-200'
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty & Time filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1.5">
                Nivel de Dificultad:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'todas', label: 'Todas' },
                  { id: 'facil', label: 'Fácil' },
                  { id: 'media', label: 'Media' },
                  { id: 'dificil', label: 'Avanzada' },
                ].map((diff) => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff.id)}
                    className={`py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedDifficulty === diff.id
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-700 uppercase">
                  Tiempo Máximo de Preparación:
                </label>
                <span className="text-xs font-bold text-amber-700">{maxTime} minutos</span>
              </div>
              <input
                type="range"
                min="10"
                max="180"
                step="5"
                value={maxTime}
                onChange={(e) => setMaxTime(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <span>10 min (Rápido)</span>
                <span>60 min</span>
                <span>180 min (Gourmet)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
