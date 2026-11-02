import React from 'react';
import { useApp } from '../context/AppContext';
import { Recipe } from '../types';
import {
  Scale,
  Trash2,
  Clock,
  Users,
  Flame,
  ShoppingCart,
  X,
  PlusCircle,
  Store
} from 'lucide-react';
import { formatARS } from '../utils/currency';

interface RecipeCompareViewProps {
  onOpenDetail: (recipe: Recipe) => void;
  onExploreMore: () => void;
}

export const RecipeCompareView: React.FC<RecipeCompareViewProps> = ({
  onOpenDetail,
  onExploreMore,
}) => {
  const {
    recipes,
    comparingRecipeIds,
    toggleCompareRecipe,
    clearCompareRecipes,
    addRecipeIngredientsToCart
  } = useApp();

  const comparedRecipes = recipes.filter((r) => comparingRecipeIds.includes(r.id));

  if (comparedRecipes.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-800 shadow-2xl max-w-2xl mx-auto my-8 text-zinc-100">
        <div className="w-16 h-16 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[32px]">balance</span>
        </div>
        <h3 className="text-xl font-bold font-display text-zinc-100 mb-2">
          Comparador de Recetas Lado a Lado
        </h3>
        <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-6 max-w-md mx-auto">
          Selecciona dos o tres recetas haciendo clic en el botón "Comparar" en cualquier tarjeta del catálogo para contrastar sus ingredientes, macronutrientes, tiempos de cocción y costo estimado.
        </p>
        <button
          onClick={onExploreMore}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-full text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          Explorar Catálogo de Recetas
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-xl text-zinc-100">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-bold font-display text-zinc-100">
              Comparador Culinario
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Analizando {comparedRecipes.length} receta{comparedRecipes.length > 1 ? 's' : ''} seleccionada{comparedRecipes.length > 1 ? 's' : ''} (máximo 3)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {comparedRecipes.length < 3 && (
            <button
              onClick={onExploreMore}
              className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-zinc-700"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              Añadir otra receta
            </button>
          )}
          <button
            onClick={clearCompareRecipes}
            className="flex items-center gap-1.5 px-4 py-2 text-rose-400 hover:bg-rose-950/40 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-rose-900/40"
          >
            <Trash2 className="w-4 h-4" />
            Limpiar comparador
          </button>
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-w-[700px]">
          {comparedRecipes.map((recipe) => {
            const totalCost = recipe.ingredients.reduce((sum, i) => sum + i.estimatedPrice, 0);
            return (
              <div
                key={recipe.id}
                className="bg-zinc-900 rounded-3xl border border-zinc-800 shadow-xl overflow-hidden flex flex-col justify-between text-zinc-100"
              >
                {/* Recipe Card Top */}
                <div>
                  <div className="relative aspect-[16/10] bg-zinc-950">
                    <img
                      src={recipe.coverImage}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => toggleCompareRecipe(recipe.id)}
                      className="absolute top-3 right-3 p-1.5 bg-zinc-950/80 hover:bg-zinc-950 text-zinc-300 hover:text-amber-400 rounded-full transition-colors cursor-pointer border border-zinc-800"
                      title="Quitar de comparación"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-zinc-100 text-xs">
                      <span className="font-semibold bg-zinc-950/80 border border-zinc-800 px-2 py-0.5 rounded-md backdrop-blur-xs text-amber-400">
                        {recipe.category}
                      </span>
                      <span className="capitalize font-medium bg-zinc-950/80 border border-zinc-800 px-2 py-0.5 rounded-md text-zinc-300">
                        {recipe.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-bold text-lg text-zinc-100 leading-snug line-clamp-2">
                        {recipe.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                        <span>Por {recipe.authorName}</span>
                        {recipe.coAuthors.length > 0 && <span>(+co-autores)</span>}
                      </div>
                    </div>

                    {/* Quick Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                        <span className="text-zinc-500 block text-[10px] uppercase font-bold">Tiempo Total</span>
                        <span className="font-bold text-zinc-100 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          {recipe.prepTimeMin + recipe.cookTimeMin} min
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                        <span className="text-zinc-500 block text-[10px] uppercase font-bold">Raciones</span>
                        <span className="font-bold text-zinc-100 flex items-center gap-1 mt-0.5">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          {recipe.servings} platos
                        </span>
                      </div>
                    </div>

                    {/* Dietary Tags */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1.5">
                        Restricciones Aprobadas
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {recipe.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          >
                            {tag.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Nutrition Breakdown */}
                    <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                      <span className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        Nutrición (por porción)
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Calorías:</span>
                          <strong className="text-zinc-100">{recipe.nutrition.calories} kcal</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Proteínas:</span>
                          <strong className="text-zinc-100">{recipe.nutrition.proteinG}g</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Carbohidratos:</span>
                          <strong className="text-zinc-100">{recipe.nutrition.carbsG}g</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Grasas:</span>
                          <strong className="text-zinc-100">{recipe.nutrition.fatG}g</strong>
                        </div>
                      </div>
                    </div>

                    {/* Ingredients Summary & Cost */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-zinc-300 uppercase">
                          Ingredientes ({recipe.ingredients.length})
                        </span>
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <Store className="w-3 h-3" />
                          {formatARS(totalCost)}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-zinc-300 max-h-44 overflow-y-auto pr-1">
                        {recipe.ingredients.map((ing) => (
                          <div
                            key={ing.id}
                            className="p-1.5 rounded-lg bg-zinc-950 flex items-center justify-between border border-zinc-800/80"
                          >
                            <span className="truncate pr-2 text-zinc-300">
                              {ing.quantity} {ing.unit} {ing.name}
                            </span>
                            <span className="shrink-0 font-medium text-amber-400 font-semibold">
                              {formatARS(ing.estimatedPrice)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-zinc-800 space-y-2">
                  <button
                    onClick={() => addRecipeIngredientsToCart(recipe)}
                    className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Comprar Ingredientes ({recipe.ingredients.length})
                  </button>

                  <button
                    onClick={() => onOpenDetail(recipe)}
                    className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-zinc-700"
                  >
                    Ver Receta Completa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
