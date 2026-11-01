import React, { useState } from 'react';
import { Recipe, RecipeComment } from '../types';
import { useApp } from '../context/AppContext';
import {
  X,
  Clock,
  Users,
  Flame,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Scale,
  ShoppingCart,
  Printer,
  Download,
  Share2,
  Trash2,
  Edit3,
  AlertTriangle,
  UserPlus,
  UserCheck,
  CheckCircle,
  Video,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Store,
  Check,
  Calendar,
  BookmarkCheck
} from 'lucide-react';
import { formatARS } from '../utils/currency';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  onEditRecipe: (recipe: Recipe) => void;
  onOpenReport: (recipe: Recipe) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  onEditRecipe,
  onOpenReport,
}) => {
  const {
    currentUser,
    toggleLikeRecipe,
    toggleDislikeRecipe,
    toggleWishlist,
    toggleWishlistIngredient,
    comparingRecipeIds,
    toggleCompareRecipe,
    deleteRecipe,
    addRecipeIngredientsToCart,
    comments,
    addComment,
    editComment,
    deleteComment,
    voteComment,
    publishScheduledNow,
    followUserToggle,
    setPrintableRecipe,
    exportRecipeJson,
    exportRecipeText,
    showToast
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  if (!recipe) return null;

  const isAuthor = currentUser ? recipe.authorId === currentUser.id : false;
  const canEdit = currentUser ? (isAuthor || currentUser.role === 'editor' || currentUser.role === 'admin') : false;
  const canDelete = currentUser ? (isAuthor || currentUser.role === 'editor' || currentUser.role === 'admin') : false;
  const isFollowingAuthor = currentUser ? currentUser.followingUserIds.includes(recipe.authorId) : false;
  const isLiked = currentUser ? recipe.likedUserIds.includes(currentUser.id) : false;
  const isDisliked = currentUser ? recipe.dislikedUserIds.includes(currentUser.id) : false;
  const isInWishlist = currentUser ? currentUser.wishlistRecipeIds.includes(recipe.id) : false;
  const isComparing = comparingRecipeIds.includes(recipe.id);

  const recipeComments = comments.filter((c) => c.recipeId === recipe.id);
  const rootComments = recipeComments.filter((c) => !c.parentCommentId);

  const handleToggleIngredientSelect = (id: string) => {
    setSelectedIngredientIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllIngredients = () => {
    if (selectedIngredientIds.length === recipe.ingredients.length) {
      setSelectedIngredientIds([]);
    } else {
      setSelectedIngredientIds(recipe.ingredients.map((i) => i.id));
    }
  };

  const handleAddSelectedToCart = () => {
    const ids = selectedIngredientIds.length > 0 ? selectedIngredientIds : undefined;
    addRecipeIngredientsToCart(recipe, ids);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(recipe.id, commentText);
    setCommentText('');
  };

  const handleReplySubmit = (parentId: string) => {
    if (!replyText.trim()) return;
    addComment(recipe.id, replyText, parentId);
    setReplyText('');
    setReplyingToId(null);
  };

  const handleStartEditComment = (commentId: string, currentText: string) => {
    setEditingCommentId(commentId);
    setEditingContent(currentText);
  };

  const handleSaveEditComment = (commentId: string) => {
    if (!editingContent.trim()) return;
    editComment(commentId, editingContent);
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('¿Deseas eliminar este comentario?')) {
      deleteComment(commentId);
    }
  };

  const toggleStepDone = (stepNum: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNum) ? prev.filter((s) => s !== stepNum) : [...prev, stepNum]
    );
  };

  const handleDelete = () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente la receta "${recipe.title}"?`)) {
      if (deleteRecipe(recipe.id)) {
        onClose();
      }
    }
  };

  const totalIngredientsCost = recipe.ingredients.reduce((acc, ing) => acc + ing.estimatedPrice, 0);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col cursor-default"
      >
        {/* Top Header Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-3 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">
            <span>{recipe.category}</span>
            <span>•</span>
            <span className="capitalize">{recipe.difficulty}</span>
            {recipe.status === 'scheduled' && (
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                Programada
              </span>
            )}
            {recipe.status === 'draft' && (
              <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-300">
                Borrador
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => toggleWishlist(recipe.id)}
              title={isInWishlist ? 'Quitar de lista de deseos' : 'Guardar en deseos'}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isInWishlist ? 'bg-amber-100 text-amber-800' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => toggleCompareRecipe(recipe.id)}
              title={isComparing ? 'Remover de comparación' : 'Comparar receta'}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isComparing ? 'bg-sky-100 text-sky-800' : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Scale className="w-4 h-4" />
            </button>

            <button
              onClick={() => setPrintableRecipe(recipe)}
              title="Vista de impresión limpia"
              className="p-2 text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={() => exportRecipeJson(recipe)}
              title="Exportar receta JSON"
              className="p-2 text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            {canEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEditRecipe(recipe);
                }}
                title="Editar receta"
                className="p-2 text-amber-700 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            {canDelete && (
              <button
                onClick={handleDelete}
                title="Eliminar receta"
                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onOpenReport(recipe)}
              title="Denunciar receta"
              className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Hero Section */}
          <div className="relative rounded-3xl overflow-hidden aspect-[21/9] min-h-[220px] bg-stone-900 shadow-md">
            <img
              src={recipe.coverImage}
              alt={recipe.title}
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/40 to-transparent flex flex-col justify-end p-6 text-white">
              <div className="flex flex-wrap gap-2 mb-2">
                {recipe.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md uppercase tracking-wider text-amber-200 border border-white/20"
                  >
                    {tag.replace('_', ' ')}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold font-serif-display leading-tight mb-2">
                {recipe.title}
              </h1>
              <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
                {recipe.description}
              </p>
            </div>
          </div>

          {/* Scheduled Recipe Banner */}
          {recipe.status === 'scheduled' && (
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sky-950">
              <div className="flex items-center gap-2.5 text-xs">
                <span className="material-symbols-outlined text-[20px] text-sky-700">schedule</span>
                <div>
                  <span className="font-bold">Publicación Programada: </span>
                  <span>
                    {recipe.scheduledPublishDate
                      ? new Date(recipe.scheduledPublishDate).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Fecha pendiente de definir'}
                  </span>
                </div>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => publishScheduledNow(recipe.id)}
                  className="px-4 py-1.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-2xs cursor-pointer"
                >
                  Publicar Ahora de Inmediato
                </button>
              )}
            </div>
          )}

          {/* Author, Co-authors & Follow bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-[#FFDDB9]/30 border border-[#E09F3E]/30">
            <div className="flex items-center gap-3">
              <img
                src={recipe.authorAvatar}
                alt={recipe.authorName}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#E09F3E]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 text-base">{recipe.authorName}</span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FFDDB9] text-[#714500] font-bold">
                    Autor
                  </span>
                </div>
                {recipe.coAuthors.length > 0 && (
                  <div className="text-xs text-stone-600 mt-0.5">
                    Co-autoría con: <span className="font-semibold text-stone-800">{recipe.coAuthors.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {(!currentUser || recipe.authorId !== currentUser.id) && (
                <button
                  onClick={() => followUserToggle(recipe.authorId)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isFollowingAuthor
                      ? 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                      : 'bg-[#835500] text-white hover:bg-[#865300] shadow-xs'
                  }`}
                >
                  {isFollowingAuthor ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      Siguiendo
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      Seguir Chef
                    </>
                  )}
                </button>
              )}

              {/* Likes / Dislikes buttons */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200">
                <button
                  onClick={() => toggleLikeRecipe(recipe.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isLiked
                      ? 'bg-amber-100 text-amber-900'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{recipe.likesCount}</span>
                </button>
                <div className="h-4 w-px bg-stone-200" />
                <button
                  onClick={() => toggleDislikeRecipe(recipe.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isDisliked
                      ? 'bg-rose-100 text-rose-900'
                      : 'text-stone-400 hover:bg-stone-100'
                  }`}
                >
                  <ThumbsDown className={`w-3.5 h-3.5 ${isDisliked ? 'fill-current' : ''}`} />
                  <span>{recipe.dislikesCount}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar & Nutrition */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <div className="text-[11px] font-semibold text-stone-500 uppercase">Tiempo Total</div>
                <div className="text-sm font-bold text-stone-900">
                  {recipe.prepTimeMin + recipe.cookTimeMin} min
                </div>
                <div className="text-[10px] text-stone-500">
                  Prep: {recipe.prepTimeMin}m | Cocción: {recipe.cookTimeMin}m
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center gap-3">
              <Users className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <div className="text-[11px] font-semibold text-stone-500 uppercase">Raciones</div>
                <div className="text-sm font-bold text-stone-900">{recipe.servings} porciones</div>
                <div className="text-[10px] text-stone-500">Ajustable en cocina</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center gap-3">
              <Flame className="w-5 h-5 text-orange-600 shrink-0" />
              <div>
                <div className="text-[11px] font-semibold text-stone-500 uppercase">Calorías / Porción</div>
                <div className="text-sm font-bold text-stone-900">{recipe.nutrition.calories} kcal</div>
                <div className="text-[10px] text-stone-500">
                  P: {recipe.nutrition.proteinG}g | C: {recipe.nutrition.carbsG}g
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center gap-3">
              <Store className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[11px] font-semibold text-stone-500 uppercase">Costo Estimado</div>
                <div className="text-sm font-bold text-emerald-700">{formatARS(totalIngredientsCost)}</div>
                <div className="text-[10px] text-stone-500">Tiendas locales</div>
              </div>
            </div>
          </div>

          {/* Video Player if present */}
          {recipe.videoUrl && (
            <div className="p-4 rounded-2xl bg-stone-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                  <Video className="w-5 h-5" />
                  Video Explicativo del Paso a Paso
                </div>
                <a
                  href={recipe.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-stone-400 hover:text-white flex items-center gap-1 underline"
                >
                  Abrir enlace externo <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/50 flex items-center justify-center border border-stone-800">
                <iframe
                  src={
                    recipe.videoUrl.includes('youtube.com/watch?v=')
                      ? recipe.videoUrl.replace('watch?v=', 'embed/')
                      : recipe.videoUrl
                  }
                  title={recipe.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Two-Column Grid: Ingredients & Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Ingredients Left Column (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-stone-900">Ingredientes</h3>
                  <p className="text-xs text-stone-500">
                    Disponibilidad y tiendas asociadas
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSelectAllIngredients}
                  className="text-xs text-amber-700 hover:underline font-semibold"
                >
                  {selectedIngredientIds.length === recipe.ingredients.length ? 'Deseleccionar' : 'Marcar todos'}
                </button>
              </div>

              {/* Ingredients List with live stock check */}
              <div className="space-y-2.5">
                {recipe.ingredients.map((ing) => {
                  const isChecked = selectedIngredientIds.includes(ing.id);
                  return (
                    <div
                      key={ing.id}
                      onClick={() => handleToggleIngredientSelect(ing.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-amber-50/70 border-amber-300'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div
                          onClick={() => handleToggleIngredientSelect(ing.id)}
                          className="flex items-start gap-2.5 flex-1 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-1 h-4 w-4 rounded-md text-amber-600 border-stone-300 focus:ring-amber-500"
                          />
                          <div>
                            <div className="text-sm font-semibold text-stone-800">
                              {ing.quantity} {ing.unit} <span className="font-bold">{ing.name}</span>
                            </div>
                            <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                              <Store className="w-3 h-3 text-stone-400" />
                              <span>{ing.storeName}</span>
                              <span>•</span>
                              <span className="font-medium text-emerald-700">{formatARS(ing.estimatedPrice)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Stock badge & Wishlist button */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {ing.stockLevel === 'alto' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Stock Alto
                            </span>
                          )}
                          {ing.stockLevel === 'medio' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              Stock Medio
                            </span>
                          )}
                          {ing.stockLevel === 'agotado' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              Agotado
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlistIngredient(ing, recipe.id, recipe.title);
                            }}
                            title="Guardar en lista de deseos"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-700 hover:bg-stone-100 transition-colors cursor-pointer"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {ing.suggestedSubstitute && (
                        <div className="mt-2 text-[11px] p-1.5 rounded-lg bg-stone-100 text-stone-600 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>Sustituto sugerido: <strong>{ing.suggestedSubstitute}</strong></span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add to Cart CTA */}
              <button
                type="button"
                onClick={handleAddSelectedToCart}
                className="w-full py-3 px-4 bg-[#E09F3E] hover:bg-[#835500] text-white font-bold rounded-full shadow-sm flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                {selectedIngredientIds.length > 0
                  ? `Comprar ${selectedIngredientIds.length} ingredientes seleccionados`
                  : 'Agregar todos los ingredientes al Carrito'}
              </button>
            </div>

            {/* Steps Right Column (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <h3 className="font-bold text-lg text-stone-900">Instrucciones y Paso a Paso</h3>
                <p className="text-xs text-stone-500">
                  Marca los pasos completados a medida que cocinas (Modo Asistente de Cocina)
                </p>
              </div>

              <div className="space-y-4">
                {recipe.steps.map((step) => {
                  const isDone = completedSteps.includes(step.stepNumber);
                  return (
                    <div
                      key={step.stepNumber}
                      className={`p-4 rounded-2xl border transition-all ${
                        isDone
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-white border-stone-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleStepDone(step.stepNumber)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-100 text-stone-700 hover:bg-amber-100 hover:text-amber-800'
                          }`}
                        >
                          {isDone ? <Check className="w-4 h-4" /> : step.stepNumber}
                        </button>

                        <div className="space-y-2 flex-1">
                          <div className="flex items-center justify-between">
                            <h4
                              className={`text-sm font-bold ${
                                isDone ? 'text-stone-400 line-through' : 'text-stone-900'
                              }`}
                            >
                              {step.title}
                            </h4>
                            <span className="text-xs font-medium text-stone-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-stone-400" />
                              {step.durationMinutes} min
                            </span>
                          </div>

                          <p
                            className={`text-xs sm:text-sm leading-relaxed ${
                              isDone ? 'text-stone-400' : 'text-stone-700'
                            }`}
                          >
                            {step.description}
                          </p>

                          {step.imageUrl && (
                            <img
                              src={step.imageUrl}
                              alt={step.title}
                              className="rounded-xl w-full max-h-48 object-cover border border-stone-200 mt-2"
                            />
                          )}

                          {step.tip && (
                            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
                              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold">Consejo del Chef: </span>
                                {step.tip}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Comments and Reviews Section */}
          <div className="border-t border-stone-200 pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-stone-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-600" />
                  Comentarios y Preguntas Culinarias
                </h3>
                <p className="text-xs text-stone-500">
                  Comparte tus resultados, consejos o dudas con el autor y la comunidad
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
                {recipeComments.length} comentarios
              </span>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-3">
              <img
                src={currentUser ? currentUser.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80'}
                alt={currentUser ? currentUser.name : 'Usuario'}
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 space-y-2">
                <textarea
                  rows={2}
                  required
                  placeholder={currentUser ? `Escribe un comentario como ${currentUser.name}...` : 'Inicia sesión para dejar un comentario en esta receta...'}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs"
                  >
                    Publicar Comentario
                  </button>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {rootComments.length === 0 ? (
                <div className="text-center py-8 text-stone-400 text-xs">
                  Aún no hay comentarios en esta receta. ¡Sé el primero en compartir tu experiencia!
                </div>
              ) : (
                rootComments.map((comment) => {
                  const replies = recipeComments.filter((c) => c.parentCommentId === comment.id);
                  const netScore = (comment.likedUserIds?.length || 0) - (comment.dislikedUserIds?.length || 0);
                  const userLiked = currentUser && comment.likedUserIds?.includes(currentUser.id);
                  const userDisliked = currentUser && comment.dislikedUserIds?.includes(currentUser.id);
                  const isAuthor = currentUser ? comment.authorId === currentUser.id : false;
                  const canEdit = currentUser ? (isAuthor || currentUser.role === 'admin') : false;
                  const canDelete = currentUser ? (isAuthor || currentUser.role === 'admin' || currentUser.role === 'editor') : false;
                  const isEditingThis = editingCommentId === comment.id;

                  // Format date and time
                  const commentDate = new Date(comment.createdAt);
                  const formattedDateTime = commentDate.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  }) + ' a las ' + commentDate.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div key={comment.id} className="p-4 sm:p-5 rounded-2xl bg-stone-50/90 border border-stone-200 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        {/* Author info & Date/Time */}
                        <div className="flex items-center gap-3">
                          <img
                            src={comment.authorAvatar}
                            alt={comment.authorName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-amber-300"
                          />
                          <div>
                            <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                              <span>{comment.authorName}</span>
                              {recipe.authorId === comment.authorId && (
                                <span className="text-[10px] bg-[#ffddb9] text-[#714500] font-bold px-1.5 py-0.2 rounded-md">
                                  Autor
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-500 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px] text-stone-400">schedule</span>
                              <span>{formattedDateTime}</span>
                              {comment.updatedAt && (
                                <span className="text-stone-400 italic font-normal">(editado)</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Top-right actions: Edit / Delete */}
                        <div className="flex items-center gap-2">
                          {canEdit && !isEditingThis && (
                            <button
                              type="button"
                              onClick={() => handleStartEditComment(comment.id, comment.content)}
                              className="text-stone-400 hover:text-amber-700 text-xs font-medium transition-colors cursor-pointer"
                              title="Editar comentario"
                            >
                              Editar
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-stone-400 hover:text-red-600 text-xs font-medium transition-colors cursor-pointer"
                              title="Eliminar comentario"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Content or Edit Form */}
                      {isEditingThis ? (
                        <div className="pl-11 space-y-2">
                          <textarea
                            rows={3}
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="w-full px-3 py-2 text-xs sm:text-sm bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-[#e09f3e] focus:outline-hidden"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingCommentId(null)}
                              className="px-3 py-1 text-xs text-stone-600 hover:bg-stone-200 rounded-lg cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEditComment(comment.id)}
                              className="px-3.5 py-1 bg-[#e09f3e] text-white text-xs font-bold rounded-lg hover:bg-[#835500] cursor-pointer"
                            >
                              Guardar cambios
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed pl-11">
                          {comment.content}
                        </p>
                      )}

                      {/* REDDIT-STYLE VOTING & REPLY BUTTON */}
                      <div className="flex items-center justify-between pl-11 pt-1">
                        {/* Upvote, Net Score, Downvote */}
                        <div className="inline-flex items-center bg-white rounded-full border border-stone-200 px-1 py-0.5 shadow-2xs">
                          {/* Upvote button */}
                          <button
                            type="button"
                            onClick={() => voteComment(comment.id, 'like')}
                            aria-label="Votar positivo"
                            title="Voto positivo (Like)"
                            className={`p-1 rounded-full transition-colors cursor-pointer ${
                              userLiked
                                ? 'text-emerald-700 bg-emerald-100 font-bold'
                                : 'text-stone-500 hover:text-emerald-700 hover:bg-stone-100'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                          </button>

                          {/* Net Score: Reddit style (+N, -N, 0) */}
                          <span
                            className={`px-2 py-0.5 text-xs font-bold ${
                              netScore > 0
                                ? 'text-emerald-700'
                                : netScore < 0
                                ? 'text-rose-700'
                                : 'text-stone-500'
                            }`}
                            title={`Votos positivos: ${comment.likedUserIds?.length || 0} | Votos negativos: ${comment.dislikedUserIds?.length || 0}`}
                          >
                            {netScore > 0 ? `+${netScore}` : netScore}
                          </span>

                          {/* Downvote button */}
                          <button
                            type="button"
                            onClick={() => voteComment(comment.id, 'dislike')}
                            aria-label="Votar negativo"
                            title="Voto negativo (Dislike)"
                            className={`p-1 rounded-full transition-colors cursor-pointer ${
                              userDisliked
                                ? 'text-rose-700 bg-rose-100 font-bold'
                                : 'text-stone-500 hover:text-rose-700 hover:bg-stone-100'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">thumb_down</span>
                          </button>
                        </div>

                        {/* Reply trigger */}
                        <button
                          type="button"
                          onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                          className="text-xs text-[#835500] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">reply</span>
                          <span>Responder</span>
                        </button>
                      </div>

                      {/* Reply form if active */}
                      {replyingToId === comment.id && (
                        <div className="pl-11 pt-2 flex gap-2">
                          <input
                            type="text"
                            placeholder="Escribe tu respuesta..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="flex-1 px-3.5 py-1.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#e09f3e] focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => handleReplySubmit(comment.id)}
                            className="px-4 py-1.5 bg-[#e09f3e] hover:bg-[#835500] text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Enviar
                          </button>
                        </div>
                      )}

                      {/* Nested replies */}
                      {replies.length > 0 && (
                        <div className="pl-6 sm:pl-11 space-y-3 pt-3 border-l-2 border-amber-200 ml-4">
                          {replies.map((reply) => {
                            const replyNetScore = (reply.likedUserIds?.length || 0) - (reply.dislikedUserIds?.length || 0);
                            const replyUserLiked = currentUser && reply.likedUserIds?.includes(currentUser.id);
                            const replyUserDisliked = currentUser && reply.dislikedUserIds?.includes(currentUser.id);
                            const canEditReply = currentUser ? (reply.authorId === currentUser.id || currentUser.role === 'admin') : false;
                            const canDeleteReply = currentUser ? (reply.authorId === currentUser.id || currentUser.role === 'admin' || currentUser.role === 'editor') : false;
                            const isEditingReply = editingCommentId === reply.id;

                            const replyDate = new Date(reply.createdAt);
                            const formattedReplyDateTime = replyDate.toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            }) + ' a las ' + replyDate.toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit'
                            });

                            return (
                              <div key={reply.id} className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={reply.authorAvatar}
                                      alt={reply.authorName}
                                      className="w-6 h-6 rounded-full object-cover ring-1 ring-amber-300"
                                    />
                                    <span className="text-xs font-bold text-stone-800">{reply.authorName}</span>
                                    <span className="text-[10px] text-stone-500">
                                      {formattedReplyDateTime}
                                    </span>
                                    {reply.updatedAt && (
                                      <span className="text-[10px] text-stone-400 italic">(editado)</span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {canEditReply && !isEditingReply && (
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditComment(reply.id, reply.content)}
                                        className="text-stone-400 hover:text-amber-700 text-[11px] cursor-pointer"
                                      >
                                        Editar
                                      </button>
                                    )}
                                    {canDeleteReply && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteComment(reply.id)}
                                        className="text-stone-400 hover:text-red-600 text-[11px] cursor-pointer"
                                      >
                                        Eliminar
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {isEditingReply ? (
                                  <div className="pl-8 space-y-2">
                                    <textarea
                                      rows={2}
                                      value={editingContent}
                                      onChange={(e) => setEditingContent(e.target.value)}
                                      className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-amber-300"
                                    />
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => setEditingCommentId(null)}
                                        className="px-2 py-0.5 text-xs text-stone-500 hover:bg-stone-100 rounded"
                                      >
                                        Cancelar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEditComment(reply.id)}
                                        className="px-2.5 py-0.5 bg-[#e09f3e] text-white text-xs font-bold rounded"
                                      >
                                        Guardar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-stone-700 pl-8 leading-relaxed">{reply.content}</p>
                                )}

                                {/* Reply Reddit Score bar */}
                                <div className="pl-8 pt-1 flex items-center">
                                  <div className="inline-flex items-center bg-stone-50 rounded-full border border-stone-200 px-1 py-0.2">
                                    <button
                                      type="button"
                                      onClick={() => voteComment(reply.id, 'like')}
                                      className={`p-0.5 rounded-full transition-colors cursor-pointer ${
                                        replyUserLiked ? 'text-emerald-700' : 'text-stone-400 hover:text-emerald-700'
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-[15px]">thumb_up</span>
                                    </button>
                                    <span
                                      className={`px-1.5 text-[11px] font-bold ${
                                        replyNetScore > 0
                                          ? 'text-emerald-700'
                                          : replyNetScore < 0
                                          ? 'text-rose-700'
                                          : 'text-stone-500'
                                      }`}
                                    >
                                      {replyNetScore > 0 ? `+${replyNetScore}` : replyNetScore}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => voteComment(reply.id, 'dislike')}
                                      className={`p-0.5 rounded-full transition-colors cursor-pointer ${
                                        replyUserDisliked ? 'text-rose-700' : 'text-stone-400 hover:text-rose-700'
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-[15px]">thumb_down</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
