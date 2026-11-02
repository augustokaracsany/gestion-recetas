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
  ShieldCheck,
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
import { formatRelativeDate, formatFullDateTime } from '../utils/dateUtils';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  onEditRecipe: (recipe: Recipe) => void;
  onOpenReport: (recipe: Recipe) => void;
  onOpenAuthorProfile?: (authorId: string) => void;
  onOpenGuidedCooking?: (recipe: Recipe) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  onEditRecipe,
  onOpenReport,
  onOpenAuthorProfile,
  onOpenGuidedCooking,
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
        className="relative w-full max-w-4xl bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden my-auto max-h-[92vh] flex flex-col cursor-default text-zinc-100"
      >
        {/* Top Header Bar */}
        <div className="sticky top-0 z-20 bg-zinc-900/95 backdrop-blur-md px-6 py-3 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <span className="text-amber-400">{recipe.category}</span>
            <span>•</span>
            <span className="capitalize">{recipe.difficulty}</span>
            {recipe.status === 'scheduled' && (
              <span className="px-2 py-0.5 rounded-full bg-sky-950 text-sky-400 border border-sky-800">
                Programada
              </span>
            )}
            {recipe.status === 'draft' && (
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                Borrador
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => toggleWishlist(recipe.id)}
              title={isInWishlist ? 'Quitar de lista de deseos' : 'Guardar en deseos'}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isInWishlist ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => toggleCompareRecipe(recipe.id)}
              title={isComparing ? 'Remover de comparación' : 'Comparar receta'}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isComparing ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <Scale className="w-4 h-4" />
            </button>

            <button
              onClick={() => setPrintableRecipe(recipe)}
              title="Vista de impresión limpia"
              className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenGuidedCooking?.(recipe)}
              title="Iniciar Modo Cocina Guiada Inmersivo (PRO)"
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">play_circle</span>
              <span className="hidden sm:inline">Cocina Guiada</span>
            </button>

            <button
              onClick={() => exportRecipeJson(recipe)}
              title="Exportar recetas como PDF"
              className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
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
                className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-xl transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}

            {canDelete && (
              <button
                onClick={handleDelete}
                title="Eliminar receta"
                className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onOpenReport(recipe)}
              title="Denunciar receta"
              className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-colors ml-1 cursor-pointer"
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
              <div className="flex flex-wrap gap-2 mb-2 items-center">
                {recipe.lastEditedBy && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/25 backdrop-blur-md text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    Revisado por {recipe.lastEditedBy.editorName}
                  </span>
                )}
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
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-zinc-950/80 border border-zinc-800">
            <div 
              onClick={() => onOpenAuthorProfile?.(recipe.authorId)}
              className="flex items-center gap-3 cursor-pointer group hover:opacity-90 transition-opacity"
            >
              <img
                src={recipe.authorAvatar}
                alt={recipe.authorName}
                className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/60 group-hover:border-amber-400 transition-colors"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-100 text-base group-hover:text-amber-400 transition-colors">{recipe.authorName}</span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                    Autor
                  </span>
                </div>
                {recipe.coAuthors.length > 0 && (
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Co-autoría con: <span className="font-semibold text-zinc-200">{recipe.coAuthors.join(', ')}</span>
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
                      ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
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
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => toggleLikeRecipe(recipe.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isLiked
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{recipe.likesCount}</span>
                </button>
                <div className="h-4 w-px bg-zinc-800" />
                <button
                  onClick={() => toggleDislikeRecipe(recipe.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isDisliked
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'text-zinc-500 hover:text-rose-400 hover:bg-zinc-800'
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
            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-[11px] font-semibold text-zinc-500 uppercase">Tiempo Total</div>
                <div className="text-sm font-bold text-zinc-100">
                  {recipe.prepTimeMin + recipe.cookTimeMin} min
                </div>
                <div className="text-[10px] text-zinc-400">
                  Prep: {recipe.prepTimeMin}m | Cocción: {recipe.cookTimeMin}m
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3">
              <Users className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-[11px] font-semibold text-zinc-500 uppercase">Raciones</div>
                <div className="text-sm font-bold text-zinc-100">{recipe.servings} porciones</div>
                <div className="text-[10px] text-zinc-400">Ajustable en cocina</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3">
              <Flame className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <div className="text-[11px] font-semibold text-zinc-500 uppercase">Calorías / Porción</div>
                <div className="text-sm font-bold text-zinc-100">{recipe.nutrition.calories} kcal</div>
                <div className="text-[10px] text-zinc-400">
                  P: {recipe.nutrition.proteinG}g | C: {recipe.nutrition.carbsG}g
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-3">
              <Store className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[11px] font-semibold text-zinc-500 uppercase">Costo Estimado</div>
                <div className="text-sm font-bold text-emerald-400">{formatARS(totalIngredientsCost)}</div>
                <div className="text-[10px] text-zinc-400">Tiendas locales</div>
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
                  <h3 className="font-bold text-lg text-zinc-100">Ingredientes</h3>
                  <p className="text-xs text-zinc-400">
                    Disponibilidad y tiendas asociadas
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSelectAllIngredients}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
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
                          ? 'bg-amber-500/10 border-amber-500/40 text-zinc-100'
                          : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700 text-zinc-300'
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
                            className="mt-1 h-4 w-4 rounded-md text-amber-500 border-zinc-700 focus:ring-amber-500/20 bg-zinc-900"
                          />
                          <div>
                            <div className="text-sm font-semibold text-zinc-200">
                              {ing.quantity} {ing.unit} <span className="font-bold text-zinc-100">{ing.name}</span>
                            </div>
                            <div className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                              <Store className="w-3 h-3 text-zinc-500" />
                              <span>{ing.storeName}</span>
                              <span>•</span>
                              <span className="font-medium text-emerald-400">{formatARS(ing.estimatedPrice)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Stock badge & Wishlist button */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {ing.stockLevel === 'alto' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                              Stock Alto
                            </span>
                          )}
                          {ing.stockLevel === 'medio' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                              Stock Medio
                            </span>
                          )}
                          {ing.stockLevel === 'agotado' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
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
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-amber-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {ing.suggestedSubstitute && (
                        <div className="mt-2 text-[11px] p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>Sustituto sugerido: <strong className="text-zinc-200">{ing.suggestedSubstitute}</strong></span>
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
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-full shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
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
                <h3 className="font-bold text-lg text-zinc-100">Instrucciones y Paso a Paso</h3>
                <p className="text-xs text-zinc-400">
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
                          ? 'bg-emerald-950/20 border-emerald-800/50'
                          : 'bg-zinc-950/80 border-zinc-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleStepDone(step.stepNumber)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-zinc-900 text-amber-400 border border-zinc-800 hover:bg-amber-500 hover:text-zinc-950'
                          }`}
                        >
                          {isDone ? <Check className="w-4 h-4" /> : step.stepNumber}
                        </button>

                        <div className="space-y-2 flex-1">
                          <div className="flex items-center justify-between">
                            <h4
                              className={`text-sm font-bold ${
                                isDone ? 'text-zinc-600 line-through' : 'text-zinc-100'
                              }`}
                            >
                              {step.title}
                            </h4>
                            <span className="text-xs font-medium text-zinc-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-zinc-500" />
                              {step.durationMinutes} min
                            </span>
                          </div>

                          <p
                            className={`text-xs sm:text-sm leading-relaxed ${
                              isDone ? 'text-zinc-600' : 'text-zinc-300'
                            }`}
                          >
                            {step.description}
                          </p>

                          {step.imageUrl && (
                            <img
                              src={step.imageUrl}
                              alt={step.title}
                              className="rounded-xl w-full max-h-48 object-cover border border-zinc-800 mt-2"
                            />
                          )}

                          {step.tip && (
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
                              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
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
          <div className="border-t border-zinc-800 pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-zinc-100 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  Comentarios y Preguntas Culinarias
                </h3>
                <p className="text-xs text-zinc-400">
                  Comparte tus resultados, consejos o dudas con el autor y la comunidad
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-amber-400">
                {recipeComments.length} comentarios
              </span>
            </div>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-3">
              <img
                src={currentUser ? currentUser.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80'}
                alt={currentUser ? currentUser.name : 'Usuario'}
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-zinc-800"
              />
              <div className="flex-1 space-y-2">
                <textarea
                  rows={2}
                  required
                  placeholder={currentUser ? `Escribe un comentario como ${currentUser.name}...` : 'Inicia sesión para dejar un comentario en esta receta...'}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs sm:text-sm placeholder-zinc-500 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
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

                  // Format date and time relative & full
                  const relativeDateStr = formatRelativeDate(comment.createdAt);
                  const fullDateTimeStr = formatFullDateTime(comment.createdAt);

                  return (
                    <div key={comment.id} className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        {/* Author info & Date/Time */}
                        <div 
                          onClick={() => onOpenAuthorProfile?.(comment.authorId)}
                          className="flex items-center gap-3 cursor-pointer group hover:opacity-90 transition-opacity"
                        >
                          <img
                            src={comment.authorAvatar}
                            alt={comment.authorName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-amber-500/40 group-hover:ring-amber-400 transition-all"
                          />
                          <div>
                            <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5 group-hover:text-amber-400 transition-colors">
                              <span>{comment.authorName}</span>
                              {recipe.authorId === comment.authorId && (
                                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold px-1.5 py-0.2 rounded-md">
                                  Autor
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px] text-zinc-500">schedule</span>
                              <span className="font-semibold text-zinc-300">{relativeDateStr}</span>
                              <span className="text-zinc-500">({fullDateTimeStr})</span>
                              {comment.updatedAt && (
                                <span className="text-zinc-500 italic font-normal">(editado)</span>
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
                              className="text-zinc-500 hover:text-amber-400 text-xs font-medium transition-colors cursor-pointer"
                              title="Editar comentario"
                            >
                              Editar
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-zinc-500 hover:text-rose-400 text-xs font-medium transition-colors cursor-pointer"
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
                            className="w-full px-3 py-2 text-xs sm:text-sm bg-zinc-900 text-zinc-100 rounded-xl border border-amber-500/40 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingCommentId(null)}
                              className="px-3 py-1 text-xs text-zinc-400 hover:bg-zinc-800 rounded-lg cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEditComment(comment.id)}
                              className="px-3.5 py-1 bg-amber-500 text-zinc-950 text-xs font-bold rounded-lg hover:bg-amber-400 cursor-pointer"
                            >
                              Guardar cambios
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pl-11">
                          {comment.content}
                        </p>
                      )}

                      {/* REDDIT-STYLE VOTING & REPLY BUTTON */}
                      <div className="flex items-center justify-between pl-11 pt-1">
                        {/* Upvote, Net Score, Downvote */}
                        <div className="inline-flex items-center bg-zinc-900 rounded-full border border-zinc-800 px-1 py-0.5 shadow-xs">
                          {/* Upvote button */}
                          <button
                            type="button"
                            onClick={() => voteComment(comment.id, 'like')}
                            aria-label="Votar positivo"
                            title="Voto positivo (Like)"
                            className={`p-1 rounded-full transition-colors cursor-pointer ${
                              userLiked
                                ? 'text-emerald-400 bg-emerald-950/60 font-bold'
                                : 'text-zinc-500 hover:text-emerald-400 hover:bg-zinc-800'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">thumb_up</span>
                          </button>

                          {/* Net Score: Reddit style (+N, -N, 0) */}
                          <span
                            className={`px-2 py-0.5 text-xs font-bold ${
                              netScore > 0
                                ? 'text-emerald-400'
                                : netScore < 0
                                ? 'text-rose-400'
                                : 'text-zinc-500'
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
                                ? 'text-rose-400 bg-rose-950/60 font-bold'
                                : 'text-zinc-500 hover:text-rose-400 hover:bg-zinc-800'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">thumb_down</span>
                          </button>
                        </div>

                        {/* Reply trigger */}
                        <button
                          type="button"
                          onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                          className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
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
                            className="flex-1 px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => handleReplySubmit(comment.id)}
                            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                          >
                            Enviar
                          </button>
                        </div>
                      )}

                      {/* Nested replies */}
                      {replies.length > 0 && (
                        <div className="pl-6 sm:pl-11 space-y-3 pt-3 border-l-2 border-amber-500/30 ml-4">
                          {replies.map((reply) => {
                            const replyNetScore = (reply.likedUserIds?.length || 0) - (reply.dislikedUserIds?.length || 0);
                            const replyUserLiked = currentUser && reply.likedUserIds?.includes(currentUser.id);
                            const replyUserDisliked = currentUser && reply.dislikedUserIds?.includes(currentUser.id);
                            const canEditReply = currentUser ? (reply.authorId === currentUser.id || currentUser.role === 'admin') : false;
                            const canDeleteReply = currentUser ? (reply.authorId === currentUser.id || currentUser.role === 'admin' || currentUser.role === 'editor') : false;
                            const isEditingReply = editingCommentId === reply.id;

                            const replyRelativeDate = formatRelativeDate(reply.createdAt);
                            const replyFullDateTime = formatFullDateTime(reply.createdAt);

                            return (
                              <div key={reply.id} className="bg-zinc-900 p-3.5 rounded-xl border border-zinc-800 space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={reply.authorAvatar}
                                      alt={reply.authorName}
                                      className="w-6 h-6 rounded-full object-cover ring-1 ring-amber-500/30"
                                    />
                                    <span className="text-xs font-bold text-zinc-200">{reply.authorName}</span>
                                    <span className="text-[10px] text-zinc-400 font-semibold" title={replyFullDateTime}>
                                      {replyRelativeDate}
                                    </span>
                                    {reply.updatedAt && (
                                      <span className="text-[10px] text-zinc-500 italic">(editado)</span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {canEditReply && !isEditingReply && (
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditComment(reply.id, reply.content)}
                                        className="text-zinc-500 hover:text-amber-400 text-[11px] cursor-pointer"
                                      >
                                        Editar
                                      </button>
                                    )}
                                    {canDeleteReply && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteComment(reply.id)}
                                        className="text-zinc-500 hover:text-rose-400 text-[11px] cursor-pointer"
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
                                      className="w-full px-2.5 py-1.5 text-xs bg-zinc-950 text-zinc-100 rounded-lg border border-amber-500/40"
                                    />
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => setEditingCommentId(null)}
                                        className="px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-800 rounded cursor-pointer"
                                      >
                                        Cancelar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEditComment(reply.id)}
                                        className="px-2.5 py-0.5 bg-amber-500 text-zinc-950 text-xs font-bold rounded hover:bg-amber-400 cursor-pointer"
                                      >
                                        Guardar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-zinc-300 pl-8 leading-relaxed">{reply.content}</p>
                                )}

                                {/* Reply Reddit Score bar */}
                                <div className="pl-8 pt-1 flex items-center">
                                  <div className="inline-flex items-center bg-zinc-950 rounded-full border border-zinc-800 px-1 py-0.2">
                                    <button
                                      type="button"
                                      onClick={() => voteComment(reply.id, 'like')}
                                      className={`p-0.5 rounded-full transition-colors cursor-pointer ${
                                        replyUserLiked ? 'text-emerald-400' : 'text-zinc-500 hover:text-emerald-400'
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-[15px]">thumb_up</span>
                                    </button>
                                    <span
                                      className={`px-1.5 text-[11px] font-bold ${
                                        replyNetScore > 0
                                          ? 'text-emerald-400'
                                          : replyNetScore < 0
                                          ? 'text-rose-400'
                                          : 'text-zinc-500'
                                      }`}
                                    >
                                      {replyNetScore > 0 ? `+${replyNetScore}` : replyNetScore}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => voteComment(reply.id, 'dislike')}
                                      className={`p-0.5 rounded-full transition-colors cursor-pointer ${
                                        replyUserDisliked ? 'text-rose-400' : 'text-zinc-500 hover:text-rose-400'
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
