import React, { useState } from 'react';
import { Recipe } from '../types';
import { useApp } from '../context/AppContext';

interface RecipeCardProps {
  recipe: Recipe;
  onOpenDetail: (recipe: Recipe) => void;
  onOpenReport?: (recipe: Recipe) => void;
  onOpenAuthorProfile?: (authorId: string) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onOpenDetail,
  onOpenReport,
  onOpenAuthorProfile,
}) => {
  const {
    currentUser,
    toggleLikeRecipe,
    toggleDislikeRecipe,
    toggleWishlist,
    comparingRecipeIds,
    toggleCompareRecipe,
    addRecipeIngredientsToCart,
    togglePinRecipe,
    setPrintableRecipe,
    exportRecipeText,
    publishScheduledNow,
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  const isLiked = currentUser ? recipe.likedUserIds.includes(currentUser.id) : false;
  const isDisliked = currentUser ? recipe.dislikedUserIds.includes(currentUser.id) : false;
  const isInWishlist = currentUser ? currentUser.wishlistRecipeIds.includes(recipe.id) : false;
  const isComparing = comparingRecipeIds.includes(recipe.id);
  const isAuthor = currentUser ? recipe.authorId === currentUser.id : false;
  const canPin = currentUser ? (isAuthor || currentUser.role === 'editor' || currentUser.role === 'admin') : false;

  const totalTime = recipe.prepTimeMin + recipe.cookTimeMin;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addRecipeIngredientsToCart(recipe);
    setCartSuccess(true);
    setTimeout(() => setCartSuccess(false), 1500);
  };

  return (
    <article className="flex flex-col bg-zinc-900/95 rounded-2xl overflow-hidden border border-zinc-800/90 hover:border-amber-500/40 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)] hover:shadow-[0_16px_36px_-6px_rgba(245,158,11,0.18)] hover:-translate-y-1.5 transition-all duration-300 group">
      {/* Top Image & Floating Badges */}
      <div className="relative w-full h-52 overflow-hidden bg-zinc-950 cursor-pointer" onClick={() => onOpenDetail(recipe)}>
        <img
          src={recipe.coverImage}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Floating Time Badge */}
        <span className="absolute top-3 left-3 bg-zinc-950/85 backdrop-blur-md border border-zinc-800/80 px-3 py-1 rounded-full text-xs text-zinc-200 flex items-center gap-1.5 shadow-md font-semibold">
          <span className="material-symbols-outlined text-[14px] text-amber-400">timer</span>
          {totalTime} min
        </span>

        {/* Floating Difficulty Badge */}
        <span className="absolute top-3 right-3 bg-zinc-950/85 backdrop-blur-md border border-zinc-800/80 px-3 py-1 rounded-full text-xs text-amber-400 font-bold shadow-md capitalize">
          {recipe.difficulty === 'facil' ? 'Fácil' : recipe.difficulty === 'media' ? 'Intermedia' : 'Maestro'}
        </span>

        {/* Pinned / Status Badges on image if applicable */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
          {recipe.isPinned && (
            <span className="bg-amber-500 text-zinc-950 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">push_pin</span>
              Fijada
            </span>
          )}
          {recipe.status === 'draft' && (
            <span className="bg-zinc-900/90 backdrop-blur-md text-zinc-300 border border-zinc-700/60 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
              Borrador
            </span>
          )}
          {recipe.status === 'scheduled' && (
            <span className="bg-amber-600 text-zinc-950 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">event_note</span>
              <span>
                {recipe.scheduledPublishDate
                  ? `Prog. ${new Date(recipe.scheduledPublishDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`
                  : 'Programada'}
              </span>
            </span>
          )}
        </div>

        {/* Wishlist Bookmark Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(recipe.id);
          }}
          aria-label="Guardar en favoritos"
          title="Guardar en lista de deseos"
          className={`absolute bottom-3 right-3 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center shadow-md transition-all cursor-pointer ${
            isInWishlist
              ? 'bg-amber-500 text-zinc-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
              : 'bg-zinc-950/80 text-zinc-300 border border-zinc-700/60 hover:text-amber-400 hover:border-amber-400'
          }`}
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={isInWishlist ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            bookmark
          </span>
        </button>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Author info & Category */}
          <div className="flex items-center justify-between text-xs text-amber-400/90 mb-2 font-medium">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenAuthorProfile) onOpenAuthorProfile(recipe.authorId);
              }}
              className="truncate hover:underline hover:text-amber-300 font-bold cursor-pointer transition-colors flex items-center gap-1"
            >
              <span>Por {recipe.authorName}</span>
            </button>
            <span className="text-zinc-500 text-[11px] uppercase tracking-wider">{recipe.category}</span>
          </div>

          <h2
            onClick={() => onOpenDetail(recipe)}
            className="font-display text-lg sm:text-xl font-bold text-zinc-100 tracking-tight mb-2 group-hover:text-amber-400 transition-colors leading-tight cursor-pointer line-clamp-1"
          >
            {recipe.title}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
            {recipe.description}
          </p>

          {/* Dietary tags row */}
          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {recipe.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/10 border border-amber-500/20 text-amber-300"
                >
                  #{tag}
                </span>
              ))}
              {recipe.tags.length > 3 && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] text-zinc-500">
                  +{recipe.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer with Likes/Dislikes, Calories and Actions */}
        <div className="pt-3 border-t border-zinc-800 flex flex-col gap-3">
          <div className="flex items-center justify-between text-zinc-300">
            {/* Likes & Dislikes */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLikeRecipe(recipe.id);
                }}
                title="Me gusta"
                className={`flex items-center gap-1 transition-colors cursor-pointer select-none ${
                  isLiked ? 'text-amber-400 font-bold' : 'hover:text-amber-400 text-zinc-400'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={isLiked ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  thumb_up
                </span>
                <span className="text-xs font-semibold">{recipe.likesCount}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDislikeRecipe(recipe.id);
                }}
                title="No me gusta"
                className={`flex items-center gap-1 transition-colors cursor-pointer select-none ${
                  isDisliked ? 'text-red-400 font-bold' : 'hover:text-red-400 text-zinc-400'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={isDisliked ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  thumb_down
                </span>
                <span className="text-xs font-semibold">{recipe.dislikesCount}</span>
              </button>
            </div>

            {/* Calories badge */}
            <span className="inline-flex items-center gap-1 bg-zinc-800/80 border border-zinc-700/60 px-2.5 py-0.5 rounded-full text-zinc-300 text-xs font-medium">
              <span className="material-symbols-outlined text-[14px] text-amber-400">
                local_fire_department
              </span>
              {recipe.nutrition.calories} kcal
            </span>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-1.5 pt-1">
            <div className="flex items-center gap-1.5">
              {/* Add Ingredients to Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                aria-label="Añadir ingredientes al carrito"
                title="Añadir ingredientes al carrito"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  cartSuccess
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                    : 'bg-zinc-800 border border-zinc-700 text-amber-400 hover:bg-amber-500 hover:text-zinc-950'
                }`}
              >
                <span className="material-symbols-outlined text-[19px]">
                  {cartSuccess ? 'check' : 'shopping_cart'}
                </span>
              </button>

              {/* Ver Receta Button */}
              <button
                type="button"
                onClick={() => onOpenDetail(recipe)}
                className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:shadow-[0_0_18px_rgba(245,158,11,0.4)] transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>Ver receta</span>
              </button>

              {/* Compare Button */}
              <button
                type="button"
                onClick={() => toggleCompareRecipe(recipe.id)}
                title="Comparar recetas lado a lado"
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer border ${
                  isComparing
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-sm'
                    : 'bg-zinc-800/80 border-zinc-700/80 text-zinc-300 hover:text-amber-300 hover:bg-zinc-700'
                }`}
              >
                {isComparing ? '✓ Comparando' : 'Comparar'}
              </button>
            </div>

            {/* More Menu Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Más opciones"
                title="Opciones adicionales"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">more_vert</span>
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 bottom-full mb-2 w-48 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 py-1.5 z-40 text-xs text-zinc-200 animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  {canPin && (
                    <button
                      type="button"
                      onClick={() => {
                        togglePinRecipe(recipe.id);
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-zinc-800 flex items-center gap-2 text-zinc-300 hover:text-amber-400"
                    >
                      <span className="material-symbols-outlined text-[16px] text-amber-400">push_pin</span>
                      <span>{recipe.isPinned ? 'Desfijar' : 'Fijar receta'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setPrintableRecipe(recipe);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-zinc-800 flex items-center gap-2 text-zinc-300 hover:text-zinc-100"
                  >
                    <span className="material-symbols-outlined text-[16px] text-zinc-400">print</span>
                    <span>Imprimir receta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      exportRecipeText(recipe);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-zinc-800 flex items-center gap-2 text-zinc-300 hover:text-zinc-100"
                  >
                    <span className="material-symbols-outlined text-[16px] text-zinc-400">download</span>
                    <span>Descargar texto</span>
                  </button>

                  {recipe.status === 'scheduled' && (isAuthor || currentUser?.role === 'admin' || currentUser?.role === 'editor') && (
                    <button
                      type="button"
                      onClick={() => {
                        publishScheduledNow(recipe.id);
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-zinc-800 flex items-center gap-2 text-amber-400 font-medium"
                    >
                      <span className="material-symbols-outlined text-[16px]">schedule_send</span>
                      <span>Publicar ahora</span>
                    </button>
                  )}

                  {onOpenReport && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenReport(recipe);
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-red-950/40 flex items-center gap-2 text-red-400 border-t border-zinc-800"
                    >
                      <span className="material-symbols-outlined text-[16px]">flag</span>
                      <span>Denunciar</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
