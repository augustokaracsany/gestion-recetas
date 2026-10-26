import React, { useState } from 'react';
import { Recipe } from '../types';
import { useApp } from '../context/AppContext';

interface FeaturedRecipesPanelProps {
  onOpenDetail: (recipe: Recipe) => void;
  onCreateRecipe?: () => void;
}

export const FeaturedRecipesPanel: React.FC<FeaturedRecipesPanelProps> = ({
  onOpenDetail,
  onCreateRecipe,
}) => {
  const {
    currentUser,
    recipes,
    toggleLikeRecipe,
    toggleDislikeRecipe,
    addRecipeIngredientsToCart,
    toggleWishlist,
  } = useApp();

  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [filterMode, setFilterMode] = useState<'all' | 'votes' | 'certified' | 'lowCal'>('all');

  let list = recipes.filter((r) => r.status === 'published');

  if (timeRange === 'day') {
    list = list.filter((r) => r.isFeaturedDay || r.likesCount > 100);
  } else if (timeRange === 'week') {
    list = list.filter((r) => r.isFeaturedWeek || r.likesCount > 80);
  } else {
    list = list.filter((r) => r.isFeaturedMonth || r.likesCount > 50);
  }

  // Filter mode
  if (filterMode === 'lowCal') {
    list = [...list].sort((a, b) => a.nutrition.calories - b.nutrition.calories);
  } else {
    list = [...list].sort((a, b) => b.likesCount - a.likesCount);
  }

  // Spotlight is the #1 ranked
  const spotlightRecipe = list[0] || recipes[0];
  const podiumRecipes = list.slice(1);

  return (
    <div className="w-full flex flex-col gap-8 pb-12">
      {/* Sub-header Breadcrumb / Navigation context */}
      <div className="w-full pt-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[#835500] mb-1">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              military_tech
            </span>
            <span className="text-xs uppercase tracking-wider text-[#835500] font-bold">
              Hall de Fama Gastronómico
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-[#1B1C1C] tracking-tight">
            Recetas Destacadas de la Comunidad
          </h1>
          <p className="text-sm md:text-base text-[#514536] max-w-3xl mt-1">
            Las creaciones culinarias más aclamadas y votadas por nuestros chefs y aficionados en Gusto.
          </p>
        </div>

        {/* Live trending counter indicator */}
        <div className="hidden xl:flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-sm border border-stone-200/60 self-start md:self-auto">
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-[#FFDDB9] flex items-center justify-center text-[#2B1700] text-xs font-bold shadow-xs">
              #1
            </div>
            <div className="w-7 h-7 rounded-full bg-[#E4E2E1] flex items-center justify-center text-[#514536] text-xs font-bold shadow-xs">
              #2
            </div>
            <div className="w-7 h-7 rounded-full bg-[#E4E2E1] flex items-center justify-center text-[#514536] text-xs font-bold shadow-xs">
              #3
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#1B1C1C]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E09F3E] animate-pulse"></span>
            <span>14.8k votos emitidos hoy</span>
          </div>
        </div>
      </div>

      {/* Filter Period Tabs Bar */}
      <div className="w-full sticky top-16 z-30 bg-[#F3F3F3]/90 backdrop-blur-md py-1">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F6F3F2] p-1.5 rounded-full shadow-sm border border-stone-200/50">
          <div className="inline-flex items-center p-1 bg-[#E4E2E1] rounded-full">
            <button
              type="button"
              onClick={() => setTimeRange('day')}
              className={`px-5 sm:px-7 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                timeRange === 'day'
                  ? 'bg-[#E09F3E] text-white shadow-sm'
                  : 'text-[#514536] hover:text-[#1B1C1C]'
              }`}
            >
              Top del Día
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('week')}
              className={`px-5 sm:px-7 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                timeRange === 'week'
                  ? 'bg-[#E09F3E] text-white shadow-sm'
                  : 'text-[#514536] hover:text-[#1B1C1C]'
              }`}
            >
              Top de la Semana
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('month')}
              className={`px-5 sm:px-7 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                timeRange === 'month'
                  ? 'bg-[#E09F3E] text-white shadow-sm'
                  : 'text-[#514536] hover:text-[#1B1C1C]'
              }`}
            >
              Top del Mes
            </button>
          </div>

          {/* Quick stats & sorting tags */}
          <div className="flex items-center gap-2 pr-2 overflow-x-auto">
            <span className="text-xs uppercase text-[#514536] hidden sm:inline-block font-semibold">
              Filtrar por:
            </span>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white text-[#835500] shadow-sm'
                  : 'bg-white/60 text-[#514536] hover:bg-white'
              }`}
            >
              <span
                className="material-symbols-outlined text-[15px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
              Mayor Votación
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('certified')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                filterMode === 'certified'
                  ? 'bg-white text-[#835500] shadow-sm'
                  : 'bg-white/60 text-[#514536] hover:bg-white'
              }`}
            >
              Chefs Certificados
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('lowCal')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                filterMode === 'lowCal'
                  ? 'bg-white text-[#835500] shadow-sm'
                  : 'bg-white/60 text-[#514536] hover:bg-white'
              }`}
            >
              Bajo en Calorías
            </button>
          </div>
        </div>
      </div>

      {/* SPOTLIGHT HERO / PODIUM WINNER (#1) */}
      {spotlightRecipe && (
        <div className="relative w-full rounded-3xl bg-white shadow-[0_4px_24px_-2px_rgba(197,130,38,0.12)] overflow-hidden border border-stone-200/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[440px]">
            {/* Visual Area */}
            <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-full overflow-hidden">
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105"
                style={{ backgroundImage: `url('${spotlightRecipe.coverImage}')` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                <span className="px-3.5 py-1.5 bg-[#E09F3E] text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1.5 backdrop-blur-sm">
                  <span
                    className="material-symbols-outlined text-[17px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    workspace_premium
                  </span>
                  #1 Top {timeRange === 'day' ? 'del Día' : timeRange === 'week' ? 'de la Semana' : 'del Mes'}
                </span>
                <span className="px-3 py-1.5 bg-stone-900/85 text-white text-xs font-semibold rounded-full backdrop-blur-md flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-[15px] text-[#FDB252]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    trending_up
                  </span>
                  Trending 98%
                </span>
              </div>

              {/* Author Badge */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-sm text-xs font-semibold text-[#1B1C1C]">
                <span className="material-symbols-outlined text-[#835500] text-[18px]">
                  account_circle
                </span>
                <span>{spotlightRecipe.authorName}</span>
                <span
                  className="material-symbols-outlined text-[#835500] text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-5 p-6 lg:p-8 flex flex-col justify-between bg-white">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-widest text-[#835500] font-bold">
                    Plato de Oro Invicto
                  </span>
                  <div className="flex items-center gap-1 text-[#514536] text-xs font-semibold">
                    <span
                      className="material-symbols-outlined text-[#E09F3E] text-[17px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      timer
                    </span>
                    {spotlightRecipe.prepTimeMin + spotlightRecipe.cookTimeMin} mins
                  </div>
                </div>

                <h2
                  onClick={() => onOpenDetail(spotlightRecipe)}
                  className="font-display text-2xl lg:text-3xl text-[#1B1C1C] font-bold tracking-tight mb-3 leading-tight hover:text-[#835500] cursor-pointer transition-colors"
                >
                  {spotlightRecipe.title}
                </h2>

                <p className="text-sm text-[#514536] line-clamp-3 mb-6 leading-relaxed">
                  {spotlightRecipe.description}
                </p>

                {/* Metrics bar for spotlight */}
                <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-[#F6F3F2] mb-6 text-center border border-stone-200/50">
                  <div>
                    <span className="block text-lg font-bold text-[#1B1C1C]">
                      {spotlightRecipe.nutrition.calories}
                    </span>
                    <span className="text-[10px] text-[#514536] uppercase font-bold tracking-wider">
                      Calorías
                    </span>
                  </div>
                  <div>
                    <span className="block text-lg font-bold text-[#835500]">
                      {spotlightRecipe.likesCount}
                    </span>
                    <span className="text-[10px] text-[#514536] uppercase font-bold tracking-wider">
                      Votos Positivos
                    </span>
                  </div>
                  <div>
                    <span className="block text-lg font-bold text-[#1B1C1C] capitalize">
                      {spotlightRecipe.difficulty}
                    </span>
                    <span className="text-[10px] text-[#514536] uppercase font-bold tracking-wider">
                      Dificultad
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom bar inside spotlight */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => toggleLikeRecipe(spotlightRecipe.id)}
                    className="flex items-center gap-1.5 text-[#1B1C1C] hover:text-[#835500] transition-colors cursor-pointer"
                  >
                    <span
                      className="material-symbols-outlined text-[20px] text-[#835500]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      thumb_up
                    </span>
                    <span className="text-xs font-bold">{spotlightRecipe.likesCount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleDislikeRecipe(spotlightRecipe.id)}
                    className="flex items-center gap-1 text-[#514536] hover:text-[#AB3333] transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[19px]">thumb_down</span>
                    <span className="text-xs font-bold">{spotlightRecipe.dislikesCount}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addRecipeIngredientsToCart(spotlightRecipe)}
                    aria-label="Añadir ingredientes al carrito"
                    title="Añadir ingredientes al carrito"
                    className="w-10 h-10 rounded-full bg-[#FFDDB9] text-[#835500] hover:bg-[#E09F3E] hover:text-white flex items-center justify-center transition-all shadow-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenDetail(spotlightRecipe)}
                    className="px-5 py-2.5 rounded-full bg-[#E09F3E] hover:bg-[#835500] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">menu_book</span>
                    <span>Ver receta</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION TITLE & LEADERBOARD GRID */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#835500] text-[26px]">
            military_tech
          </span>
          <h2 className="font-display text-xl sm:text-2xl text-[#1B1C1C] font-bold">
            Top Clasificados de la Jornada
          </h2>
        </div>
        <span className="text-xs text-[#514536] font-medium">Actualizado en vivo</span>
      </div>

      {/* 6-CARD RESPONSIVE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {podiumRecipes.map((recipe, index) => {
          const rank = index + 2;
          const totalTime = recipe.prepTimeMin + recipe.cookTimeMin;
          const isInWish = currentUser.wishlistRecipeIds.includes(recipe.id);

          return (
            <article
              key={recipe.id}
              className="flex flex-col bg-white rounded-3xl shadow-[0_4px_20px_-2px_rgba(197,130,38,0.06)] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_32px_-4px_rgba(197,130,38,0.12)] hover:-translate-y-1 border border-stone-200/50"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-stone-100">
                <img
                  src={recipe.coverImage}
                  alt={recipe.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 cursor-pointer"
                  onClick={() => onOpenDetail(recipe)}
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-[#1B1C1C] text-xs font-bold rounded-full shadow-sm flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        rank === 2 ? 'bg-[#E09F3E]' : rank === 3 ? 'bg-[#865300]' : 'bg-stone-400'
                      }`}
                    ></span>
                    #{rank} del Podio
                  </span>
                  <span className="px-2.5 py-1 bg-stone-900/80 backdrop-blur-sm text-white text-[11px] font-semibold rounded-full">
                    {95 - index * 3}% Score
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleWishlist(recipe.id)}
                  aria-label="Guardar en favoritos"
                  className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer ${
                    isInWish ? 'bg-[#AB3333] text-white' : 'bg-white/80 text-[#1B1C1C] hover:text-[#AB3333]'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={isInWish ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    bookmark
                  </span>
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F6F3F2] text-[#514536] text-xs font-semibold uppercase">
                      {recipe.category}
                    </span>
                    <span className="text-[#514536] text-xs">•</span>
                    <span className="text-[#514536] text-xs font-medium">{totalTime} mins</span>
                  </div>

                  <h3
                    onClick={() => onOpenDetail(recipe)}
                    className="font-display text-lg font-bold text-[#1B1C1C] line-clamp-1 mb-1.5 hover:text-[#835500] cursor-pointer transition-colors"
                  >
                    {recipe.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#514536] line-clamp-2 mb-4 leading-relaxed">
                    {recipe.description}
                  </p>
                </div>

                {/* Bottom Bar of the card */}
                <div className="pt-3 border-t border-stone-100 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-[#514536] text-xs bg-[#F6F3F2] px-3 py-1.5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLikeRecipe(recipe.id);
                        }}
                        className={`flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                          recipe.likedUserIds.includes(currentUser.id)
                            ? 'text-[#835500] font-bold'
                            : 'text-[#1B1C1C] hover:text-[#835500]'
                        }`}
                        title="Me gusta"
                      >
                        <span
                          className="material-symbols-outlined text-[17px] text-[#835500]"
                          style={recipe.likedUserIds.includes(currentUser.id) ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                          thumb_up
                        </span>
                        {recipe.likesCount}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDislikeRecipe(recipe.id);
                        }}
                        className={`flex items-center gap-1 transition-colors cursor-pointer ${
                          recipe.dislikedUserIds.includes(currentUser.id)
                            ? 'text-[#AB3333] font-bold'
                            : 'hover:text-[#AB3333]'
                        }`}
                        title="No me gusta"
                      >
                        <span
                          className="material-symbols-outlined text-[16px]"
                          style={recipe.dislikedUserIds.includes(currentUser.id) ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                          thumb_down
                        </span>
                        {recipe.dislikesCount}
                      </button>
                    </div>

                    <div className="flex items-center gap-1 font-semibold text-[#1B1C1C]">
                      <span className="material-symbols-outlined text-[16px] text-[#835500]">
                        local_fire_department
                      </span>
                      {recipe.nutrition.calories} kcal
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => addRecipeIngredientsToCart(recipe)}
                      aria-label="Añadir ingredientes al carrito"
                      title="Añadir ingredientes al carrito"
                      className="w-9 h-9 rounded-full bg-[#FFDDB9] text-[#835500] hover:bg-[#E09F3E] hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenDetail(recipe)}
                      className="px-4 py-1.5 rounded-full bg-[#835500] text-white hover:bg-[#865300] text-xs font-semibold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      <span>Ver receta</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Community Callout Banner */}
      <div className="w-full bg-gradient-to-r from-[#FFDDB9] via-[#FFDDB4] to-[#FFDDB9] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm border border-amber-200/60 mt-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#835500] shadow-sm shrink-0">
            <span
              className="material-symbols-outlined text-[32px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              emoji_events
            </span>
          </div>
          <div>
            <h3 className="font-display text-xl sm:text-2xl text-[#2B1700] font-bold tracking-tight">
              ¿Tienes una creación culinaria digna del podio?
            </h3>
            <p className="text-xs sm:text-sm text-[#663E00] mt-0.5">
              Publica tu receta hoy y participa en la votación global de la comunidad de Gusto.
            </p>
          </div>
        </div>

        {onCreateRecipe && (
          <button
            type="button"
            onClick={onCreateRecipe}
            className="px-6 py-3 bg-[#835500] hover:bg-[#865300] text-white rounded-full text-xs sm:text-sm font-bold shadow-md transition-all whitespace-nowrap cursor-pointer"
          >
            Subir mi receta
          </button>
        )}
      </div>
    </div>
  );
};
