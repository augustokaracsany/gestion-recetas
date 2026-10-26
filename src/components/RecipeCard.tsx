import React, { useState } from 'react';
import { Recipe } from '../types';
import { useApp } from '../context/AppContext';
import {
  Clock,
  Users,
  Flame,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Scale,
  ShoppingCart,
  Pin,
  Video,
  MoreVertical,
  Printer,
  Download,
  AlertCircle,
  Eye,
  Calendar,
  Sparkles
} from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onOpenDetail: (recipe: Recipe) => void;
  onOpenReport?: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onOpenDetail,
  onOpenReport,
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
    publishScheduledNow
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);

  const isLiked = recipe.likedUserIds.includes(currentUser.id);
  const isDisliked = recipe.dislikedUserIds.includes(currentUser.id);
  const isInWishlist = currentUser.wishlistRecipeIds.includes(recipe.id);
  const isComparing = comparingRecipeIds.includes(recipe.id);
  const isAuthor = recipe.authorId === currentUser.id;
  const canPin = isAuthor || currentUser.role === 'editor' || currentUser.role === 'admin';

  const totalTime = recipe.prepTimeMin + recipe.cookTimeMin;

  const getDifficultyColor = (diff: Recipe['difficulty']) => {
    switch (diff) {
      case 'facil': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'media': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'dificil': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getTagBadge = (tag: string) => {
    switch (tag) {
      case 'celiaco': return { label: 'Sin TACC', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'vegano': return { label: 'Vegano', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'vegetariano': return { label: 'Vegetariano', color: 'bg-green-100 text-green-900 border-green-300' };
      case 'diabetico': return { label: 'Diabéticos', color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'keto': return { label: 'Keto Low-Carb', color: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'sin_lactosa': return { label: 'Sin Lactosa', color: 'bg-sky-100 text-sky-900 border-sky-300' };
      case 'bajo_sodio': return { label: 'Bajo Sodio', color: 'bg-teal-100 text-teal-900 border-teal-300' };
      default: return { label: tag, color: 'bg-stone-100 text-stone-800 border-stone-300' };
    }
  };

  return (
    <div className="group relative bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Image Section */}
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
        <img
          src={recipe.coverImage}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          onClick={() => onOpenDetail(recipe)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
          <div className="flex flex-wrap gap-1.5 items-center">
            {recipe.isPinned && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-stone-900 shadow-md">
                <Pin className="w-3 h-3 fill-stone-900" />
                Fijada
              </span>
            )}
            {recipe.status === 'scheduled' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-600 text-white shadow-md">
                <Calendar className="w-3 h-3" />
                Programada
              </span>
            )}
            {recipe.status === 'draft' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-700 text-white shadow-md">
                Borrador
              </span>
            )}
            {recipe.isFeaturedDay && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-400 text-stone-950 shadow-md">
                <Sparkles className="w-3 h-3" />
                Top Día
              </span>
            )}
            {recipe.videoUrl && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-600/95 text-white shadow-xs">
                <Video className="w-3 h-3" />
                Con Video
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1 rounded-full">
            <button
              onClick={() => toggleWishlist(recipe.id)}
              title={isInWishlist ? 'Quitar de lista de deseos' : 'Guardar en lista de deseos (RF-24)'}
              className={`p-1.5 rounded-full transition-colors ${
                isInWishlist ? 'bg-amber-500 text-white' : 'text-white/90 hover:text-white hover:bg-white/20'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => toggleCompareRecipe(recipe.id)}
              title={isComparing ? 'Remover del comparador' : 'Comparar con otras recetas (RF-18)'}
              className={`p-1.5 rounded-full transition-colors ${
                isComparing ? 'bg-sky-500 text-white' : 'text-white/90 hover:text-white hover:bg-white/20'
              }`}
            >
              <Scale className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom meta over image */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-2">
            <img
              src={recipe.authorAvatar}
              alt={recipe.authorName}
              className="w-6 h-6 rounded-full border border-white/60 object-cover"
            />
            <span className="font-medium drop-shadow-sm truncate max-w-[130px]">
              {recipe.authorName}
            </span>
            {recipe.coAuthors.length > 0 && (
              <span className="text-[10px] text-amber-200 bg-black/40 px-1.5 py-0.5 rounded-md drop-shadow-xs">
                +{recipe.coAuthors.length} co-autor
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 drop-shadow-sm font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              {totalTime} min
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-300" />
              {recipe.servings} raciones
            </span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Dietary tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {recipe.tags.slice(0, 3).map((tag) => {
              const badge = getTagBadge(tag);
              return (
                <span
                  key={tag}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badge.color}`}
                >
                  {badge.label}
                </span>
              );
            })}
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border capitalize ${getDifficultyColor(
                recipe.difficulty
              )}`}
            >
              {recipe.difficulty}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onOpenDetail(recipe)}
            className="font-serif-display font-bold text-lg text-stone-900 group-hover:text-amber-800 transition-colors cursor-pointer line-clamp-2 leading-snug mb-1.5"
          >
            {recipe.title}
          </h3>

          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
            {recipe.description}
          </p>
        </div>

        {/* Scheduled Info Alert */}
        {recipe.status === 'scheduled' && (
          <div className="mb-3 p-2 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800 flex items-center justify-between">
            <span className="truncate">
              Publicación programada: {new Date(recipe.scheduledPublishDate || '').toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
            </span>
            {(isAuthor || currentUser.role === 'admin' || currentUser.role === 'editor') && (
              <button
                onClick={() => publishScheduledNow(recipe.id)}
                className="shrink-0 ml-2 px-2 py-0.5 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors"
              >
                Publicar ya
              </button>
            )}
          </div>
        )}

        {/* Card Footer: Likes, Dislikes, Cart, Menu */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Like */}
            <button
              onClick={() => toggleLikeRecipe(recipe.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                isLiked
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{recipe.likesCount}</span>
            </button>

            {/* Dislike */}
            <button
              onClick={() => toggleDislikeRecipe(recipe.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                isDisliked
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
              }`}
            >
              <ThumbsDown className={`w-3.5 h-3.5 ${isDisliked ? 'fill-current' : ''}`} />
              <span>{recipe.dislikesCount}</span>
            </button>

            {/* Calories badge */}
            <span className="hidden sm:inline-flex items-center gap-0.5 text-[11px] font-medium text-stone-500 ml-1">
              <Flame className="w-3 h-3 text-orange-500" />
              {recipe.nutrition.calories} kcal
            </span>
          </div>

          <div className="flex items-center gap-1.5 relative">
            {/* Add Ingredients to cart direct button */}
            <button
              onClick={() => addRecipeIngredientsToCart(recipe)}
              title="Añadir ingredientes de esta receta al carrito (RF-22 / RF-23)"
              className="p-1.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenDetail(recipe)}
              className="px-3 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              Ver
            </button>

            {/* More menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 bottom-full mb-1 w-48 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-30 text-xs">
                {canPin && (
                  <button
                    onClick={() => {
                      togglePinRecipe(recipe.id);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-stone-50 flex items-center gap-2 text-stone-700"
                  >
                    <Pin className="w-3.5 h-3.5 text-amber-600" />
                    {recipe.isPinned ? 'Desfijar de perfil' : 'Fijar en perfil (RF-17)'}
                  </button>
                )}

                <button
                  onClick={() => {
                    setPrintableRecipe(recipe);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-stone-50 flex items-center gap-2 text-stone-700"
                >
                  <Printer className="w-3.5 h-3.5 text-stone-500" />
                  Imprimir receta (RF-31)
                </button>

                <button
                  onClick={() => {
                    exportRecipeText(recipe);
                    setMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-stone-50 flex items-center gap-2 text-stone-700"
                >
                  <Download className="w-3.5 h-3.5 text-stone-500" />
                  Descarga rápida TXT (RF-29)
                </button>

                {onOpenReport && (
                  <button
                    onClick={() => {
                      onOpenReport(recipe);
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600 border-t border-stone-100"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    Denunciar receta (RF-11)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
