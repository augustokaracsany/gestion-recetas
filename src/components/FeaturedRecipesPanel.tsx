import React, { useState } from 'react';
import { Recipe } from '../types';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Trophy,
  Calendar,
  Flame,
  Clock,
  ThumbsUp,
  ShieldCheck,
  Crown,
  Eye,
  ArrowRight
} from 'lucide-react';

interface FeaturedRecipesPanelProps {
  onOpenDetail: (recipe: Recipe) => void;
}

export const FeaturedRecipesPanel: React.FC<FeaturedRecipesPanelProps> = ({
  onOpenDetail,
}) => {
  const { currentUser, recipes } = useApp();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  // Check role: Usuario Editor, Usuario Premium, Administrador have full panel access (RF-05)
  const hasSpecialAccess =
    currentUser.role === 'editor' ||
    currentUser.role === 'premium' ||
    currentUser.role === 'admin';

  let filteredRecipes = recipes.filter((r) => r.status === 'published');

  if (timeRange === 'day') {
    filteredRecipes = filteredRecipes.filter((r) => r.isFeaturedDay || r.likesCount > 150);
  } else if (timeRange === 'week') {
    filteredRecipes = filteredRecipes.filter((r) => r.isFeaturedWeek || r.likesCount > 100);
  } else {
    filteredRecipes = filteredRecipes.filter((r) => r.isFeaturedMonth || r.likesCount > 50);
  }

  // Sort by likes
  filteredRecipes.sort((a, b) => b.likesCount - a.likesCount);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 text-white p-6 sm:p-10 shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400 text-stone-950 text-xs font-extrabold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            Panel Exclusivo RF-05
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-serif-display leading-tight">
            Recetas Más Populares & Destacadas
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Curaduría gastronómica con las recetas con mayor valoración comunitaria, interacción y preparaciones del día, la semana y el mes.
          </p>

          <div className="flex items-center gap-2 pt-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md text-xs text-amber-200">
              {currentUser.role === 'admin' && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
              {currentUser.role === 'premium' && <Crown className="w-4 h-4 text-yellow-400" />}
              {currentUser.role === 'editor' && <Sparkles className="w-4 h-4 text-amber-400" />}
              <span>Rol activo: <strong>{currentUser.role.toUpperCase()}</strong></span>
            </div>
            {!hasSpecialAccess && (
              <span className="text-[11px] text-stone-300">
                (Visualización estándar para miembros de Gusto)
              </span>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute right-[-40px] top-[-40px] w-80 h-80 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-700 uppercase">
          <Calendar className="w-4 h-4 text-amber-600" />
          Periodo de Popularidad:
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
          <button
            onClick={() => setTimeRange('day')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeRange === 'day'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            🔥 Top del Día
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeRange === 'week'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            ⭐ Top de la Semana
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeRange === 'month'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            🏆 Top del Mes
          </button>
        </div>
      </div>

      {/* Featured Recipe Showcase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe, index) => (
          <div
            key={recipe.id}
            className="group relative bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Media header */}
              <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                <img
                  src={recipe.coverImage}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-black/20" />

                {/* Ranking Medal */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-stone-900/90 text-yellow-400 backdrop-blur-md border border-yellow-400/40 shadow-md">
                  <span>#{index + 1}</span>
                  <span>Más Valorada</span>
                </div>

                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={recipe.authorAvatar}
                      alt={recipe.authorName}
                      className="w-6 h-6 rounded-full border border-white/60 object-cover"
                    />
                    <span className="font-semibold drop-shadow-sm truncate">{recipe.authorName}</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-amber-300">
                    <ThumbsUp className="w-3.5 h-3.5 fill-current" />
                    <span>{recipe.likesCount} me gusta</span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <div className="flex flex-wrap gap-1">
                  {recipe.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200"
                    >
                      {tag.replace('_', ' ')}
                    </span>
                  ))}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 capitalize">
                    {recipe.category}
                  </span>
                </div>

                <h3
                  onClick={() => onOpenDetail(recipe)}
                  className="font-bold font-serif-display text-lg text-stone-900 group-hover:text-amber-800 transition-colors cursor-pointer leading-snug"
                >
                  {recipe.title}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {recipe.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-stone-500 pt-2 border-t border-stone-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    {recipe.prepTimeMin + recipe.cookTimeMin} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    {recipe.nutrition.calories} kcal
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Action */}
            <div className="p-4 pt-0">
              <button
                onClick={() => onOpenDetail(recipe)}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Explorar Receta Destacada
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
