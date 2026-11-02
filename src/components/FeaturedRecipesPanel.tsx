import React, { useState } from 'react';
import { Recipe } from '../types';
import { useApp } from '../context/AppContext';

interface FeaturedRecipesPanelProps {
  onOpenDetail: (recipe: Recipe) => void;
  onOpenAuthorProfile?: (authorId: string) => void;
  onCreateRecipe?: () => void;
}

export const FeaturedRecipesPanel: React.FC<FeaturedRecipesPanelProps> = ({
  onOpenDetail,
  onOpenAuthorProfile,
  onCreateRecipe,
}) => {
  const {
    currentUser,
    recipes,
    toggleLikeRecipe,
    toggleDislikeRecipe,
    addRecipeIngredientsToCart,
    toggleWishlist,
    toggleFeaturedRecipe,
  } = useApp();

  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [filterMode, setFilterMode] = useState<'all' | 'votes' | 'certified' | 'lowCal'>('all');

  // 1. Sort base published recipes
  const sortedPublished = React.useMemo(() => {
    let base = recipes.filter((r) => r.status === 'published');
    if (filterMode === 'lowCal') {
      return base.sort((a, b) => a.nutrition.calories - b.nutrition.calories);
    } else {
      return base.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    }
  }, [recipes, filterMode]);

  // 2. Exclusive Selection: Top Diario, Top Semanal, Top Mensual (No duplicated dishes)
  const { dayList, weekList, monthList } = React.useMemo(() => {
    // Top Diario candidates (isFeaturedDay or top ranked)
    const dayCandidates = sortedPublished.filter((r) => r.isFeaturedDay || r.likesCount >= 0);
    const dayList = dayCandidates.slice(0, 7);
    const dayIds = new Set(dayList.map((r) => r.id));

    // Top Semanal candidates (strictly EXCLUDING dishes in Top Diario)
    const weekCandidates = sortedPublished.filter((r) => !dayIds.has(r.id));
    const weekList = weekCandidates.slice(0, 7);
    const weekIds = new Set([...dayIds, ...weekList.map((r) => r.id)]);

    // Top Mensual candidates (strictly EXCLUDING dishes in Top Diario AND Top Semanal)
    const monthCandidates = sortedPublished.filter((r) => !weekIds.has(r.id));
    const monthList = monthCandidates.slice(0, 7);

    return { dayList, weekList, monthList };
  }, [sortedPublished]);

  // Determine active list based on selected timeRange tab
  const activeList =
    timeRange === 'day'
      ? dayList
      : timeRange === 'week'
      ? weekList
      : monthList;

  // Spotlight is #1 in the active list
  const spotlightRecipe = activeList[0] || sortedPublished[0];
  const podiumRecipes = activeList.slice(1);

  return (
    <div className="w-full flex flex-col gap-8 pb-12">
      {/* Sub-header Breadcrumb / Navigation context */}
      <div className="w-full pt-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-amber-400 mb-1">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              military_tech
            </span>
            <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
              Hall de Fama Gastronómico
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Recetas Destacadas de la Comunidad
          </h1>
          <p className="text-sm md:text-base text-zinc-400 max-w-3xl mt-1">
            Las creaciones culinarias más aclamadas y votadas por nuestros chefs y aficionados en Gusto.
          </p>
        </div>

        {/* Live trending counter indicator */}
        <div className="hidden xl:flex items-center gap-3 bg-zinc-900/90 px-5 py-2.5 rounded-full shadow-md border border-zinc-800 self-start md:self-auto">
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xs font-bold">
              #1
            </div>
            <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 text-xs font-bold">
              #2
            </div>
            <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 text-xs font-bold">
              #3
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-200">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span>14.8k votos emitidos hoy</span>
          </div>
        </div>
      </div>

      {/* Filter Period Tabs Bar */}
      <div className="w-full sticky top-16 z-30 bg-zinc-950/95 backdrop-blur-md py-1">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/90 p-1.5 rounded-full shadow-lg border border-zinc-800">
          <div className="inline-flex items-center p-1 bg-zinc-950 rounded-full border border-zinc-800/80">
            <button
              type="button"
              onClick={() => setTimeRange('day')}
              className={`px-5 sm:px-7 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                timeRange === 'day'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              Top del Día
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('week')}
              className={`px-5 sm:px-7 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                timeRange === 'week'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              Top de la Semana
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('month')}
              className={`px-5 sm:px-7 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                timeRange === 'month'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              Top del Mes
            </button>
          </div>

          {/* Quick stats & sorting tags */}
          <div className="flex items-center gap-2 pr-2 overflow-x-auto">
            <span className="text-xs uppercase text-zinc-400 hidden sm:inline-block font-semibold">
              Filtrar por:
            </span>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border ${
                filterMode === 'all'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-xs'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
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
              className={`px-3.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border ${
                filterMode === 'certified'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-xs'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              Chefs Certificados
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('lowCal')}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border ${
                filterMode === 'lowCal'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-xs'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              Bajo en Calorías
            </button>
          </div>
        </div>
      </div>

      {/* SPOTLIGHT HERO / PODIUM WINNER (#1) */}
      {spotlightRecipe && (
        <div className="relative w-full rounded-3xl bg-zinc-900 shadow-2xl overflow-hidden border border-zinc-800 hover:border-amber-500/40 transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[440px]">
            {/* Visual Area */}
            <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-full overflow-hidden group">
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${spotlightRecipe.coverImage}')` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent"></div>

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                <span className="px-3.5 py-1.5 bg-amber-500 text-zinc-950 text-xs font-bold rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
                  <span
                    className="material-symbols-outlined text-[17px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    workspace_premium
                  </span>
                  #1 Top {timeRange === 'day' ? 'del Día' : timeRange === 'week' ? 'de la Semana' : 'del Mes'}
                </span>
                <span className="px-3 py-1.5 bg-zinc-950/85 text-zinc-200 border border-zinc-800 text-xs font-semibold rounded-full backdrop-blur-md flex items-center gap-1">
                  <span
                    className="material-symbols-outlined text-[15px] text-amber-400"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    trending_up
                  </span>
                  Trending 98%
                </span>
              </div>

              {/* Author Badge */}
              <div 
                onClick={() => onOpenAuthorProfile?.(spotlightRecipe.authorId)}
                className="absolute bottom-4 left-4 bg-zinc-950/90 border border-zinc-800 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-md text-xs font-semibold text-zinc-200 cursor-pointer hover:border-amber-500/50 hover:text-amber-400 transition-all"
              >
                <span className="material-symbols-outlined text-amber-400 text-[18px]">
                  account_circle
                </span>
                <span>Por {spotlightRecipe.authorName}</span>
                <span
                  className="material-symbols-outlined text-amber-400 text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-5 p-6 lg:p-8 flex flex-col justify-between bg-zinc-900">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                    Plato de Oro Invicto
                  </span>
                  <div className="flex items-center gap-1 text-zinc-400 text-xs font-semibold">
                    <span
                      className="material-symbols-outlined text-amber-400 text-[17px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      timer
                    </span>
                    {spotlightRecipe.prepTimeMin + spotlightRecipe.cookTimeMin} mins
                  </div>
                </div>

                <h2
                  onClick={() => onOpenDetail(spotlightRecipe)}
                  className="font-display text-2xl lg:text-3xl text-zinc-100 font-bold tracking-tight mb-3 leading-tight hover:text-amber-400 cursor-pointer transition-colors"
                >
                  {spotlightRecipe.title}
                </h2>

                <p className="text-sm text-zinc-400 line-clamp-3 mb-6 leading-relaxed">
                  {spotlightRecipe.description}
                </p>

                {/* Metrics bar for spotlight */}
                <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-zinc-950/80 mb-6 text-center border border-zinc-800">
                  <div>
                    <span className="block text-lg font-bold text-zinc-100">
                      {spotlightRecipe.nutrition.calories}
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                      Calorías
                    </span>
                  </div>
                  <div>
                    <span className="block text-lg font-bold text-amber-400">
                      {spotlightRecipe.likesCount}
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                      Votos Positivos
                    </span>
                  </div>
                  <div>
                    <span className="block text-lg font-bold text-zinc-200 capitalize">
                      {spotlightRecipe.difficulty}
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                      Dificultad
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom bar inside spotlight */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => toggleLikeRecipe(spotlightRecipe.id)}
                    className="flex items-center gap-1.5 text-zinc-300 hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    <span
                      className="material-symbols-outlined text-[20px] text-amber-400"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      thumb_up
                    </span>
                    <span className="text-xs font-bold">{spotlightRecipe.likesCount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleDislikeRecipe(spotlightRecipe.id)}
                    className="flex items-center gap-1 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
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
                    className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-zinc-950 flex items-center justify-center transition-all shadow-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenDetail(spotlightRecipe)}
                    className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
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
          <span className="material-symbols-outlined text-amber-400 text-[26px]">
            military_tech
          </span>
          <h2 className="font-display text-xl sm:text-2xl text-zinc-100 font-bold">
            Top Clasificados de la Jornada
          </h2>
        </div>
        <span className="text-xs text-zinc-500 font-medium">Actualizado en vivo</span>
      </div>

      {/* 6-CARD RESPONSIVE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {podiumRecipes.map((recipe, index) => {
          const rank = index + 2;
          const totalTime = recipe.prepTimeMin + recipe.cookTimeMin;
          const isInWish = currentUser ? currentUser.wishlistRecipeIds.includes(recipe.id) : false;
          const isCardLiked = currentUser ? recipe.likedUserIds.includes(currentUser.id) : false;
          const isCardDisliked = currentUser ? recipe.dislikedUserIds.includes(currentUser.id) : false;

          return (
            <article
              key={recipe.id}
              className="group flex flex-col bg-zinc-900 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-amber-500/40 hover:-translate-y-1.5 border border-zinc-800"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-zinc-950">
                <img
                  src={recipe.coverImage}
                  alt={recipe.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                  onClick={() => onOpenDetail(recipe)}
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-3 py-1 bg-zinc-950/90 border border-zinc-800 backdrop-blur-md text-zinc-100 text-xs font-bold rounded-full shadow-md flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        rank === 2 ? 'bg-amber-400' : rank === 3 ? 'bg-amber-600' : 'bg-zinc-500'
                      }`}
                    ></span>
                    #{rank} del Podio
                  </span>
                  <span className="px-2.5 py-1 bg-zinc-950/80 border border-zinc-800 backdrop-blur-sm text-zinc-300 text-[11px] font-semibold rounded-full">
                    {95 - index * 3}% Score
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleWishlist(recipe.id)}
                  aria-label="Guardar en favoritos"
                  className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer border border-zinc-800 ${
                    isInWish ? 'bg-rose-600 text-white border-rose-500' : 'bg-zinc-950/80 text-zinc-300 hover:text-amber-400'
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
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-950 border border-zinc-800/80 text-amber-400 text-xs font-semibold uppercase shrink-0">
                        {recipe.category}
                      </span>
                      <span className="text-zinc-600 text-xs shrink-0">•</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAuthorProfile?.(recipe.authorId);
                        }}
                        className="text-xs text-zinc-400 hover:text-amber-400 transition-colors font-medium truncate cursor-pointer"
                      >
                        Por {recipe.authorName}
                      </button>
                    </div>
                    <span className="text-zinc-400 text-xs font-medium shrink-0">{totalTime} mins</span>
                  </div>

                  <h3
                    onClick={() => onOpenDetail(recipe)}
                    className="font-display text-lg font-bold text-zinc-100 line-clamp-1 mb-1.5 hover:text-amber-400 cursor-pointer transition-colors"
                  >
                    {recipe.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                    {recipe.description}
                  </p>
                </div>

                {/* Bottom Bar of the card */}
                <div className="pt-3 border-t border-zinc-800/80 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-zinc-400 text-xs bg-zinc-950 border border-zinc-800/60 px-3 py-1.5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLikeRecipe(recipe.id);
                        }}
                        className={`flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                          isCardLiked
                            ? 'text-amber-400 font-bold'
                            : 'text-zinc-300 hover:text-amber-400'
                        }`}
                        title="Me gusta"
                      >
                        <span
                          className="material-symbols-outlined text-[17px] text-amber-400"
                          style={isCardLiked ? { fontVariationSettings: "'FILL' 1" } : {}}
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
                          isCardDisliked
                            ? 'text-rose-400 font-bold'
                            : 'text-zinc-500 hover:text-rose-400'
                        }`}
                        title="No me gusta"
                      >
                        <span
                          className="material-symbols-outlined text-[16px]"
                          style={isCardDisliked ? { fontVariationSettings: "'FILL' 1" } : {}}
                        >
                          thumb_down
                        </span>
                        {recipe.dislikesCount}
                      </button>
                    </div>

                    <div className="flex items-center gap-1 font-semibold text-zinc-300">
                      <span className="material-symbols-outlined text-[16px] text-amber-400">
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
                      className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-zinc-950 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenDetail(recipe)}
                      className="px-4 py-1.5 rounded-full bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 border border-zinc-700 text-xs font-semibold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
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
      <div className="w-full bg-gradient-to-r from-amber-950/40 via-zinc-900 to-amber-950/40 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-amber-500/30 mt-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
            <span
              className="material-symbols-outlined text-[32px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              emoji_events
            </span>
          </div>
          <div>
            <h3 className="font-display text-xl sm:text-2xl text-zinc-100 font-bold tracking-tight">
              ¿Tienes una creación culinaria digna del podio?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Publica tu receta hoy y participa en la votación global de la comunidad de Gusto.
            </p>
          </div>
        </div>

        {onCreateRecipe && (
          <button
            type="button"
            onClick={onCreateRecipe}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-full text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all whitespace-nowrap cursor-pointer"
          >
            Subir mi receta
          </button>
        )}
      </div>
    </div>
  );
};
