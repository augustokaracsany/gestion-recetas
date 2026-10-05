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
  CheckCircle2,
  Store
} from 'lucide-react';

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
      <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/90 shadow-sm max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Scale className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold font-serif-display text-stone-900 mb-2">
          Comparador de Recetas Lado a Lado (RF-18)
        </h3>
        <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-6">
          Selecciona dos o tres recetas haciendo clic en el icono de la balanza (<Scale className="w-3.5 h-3.5 inline text-sky-600" />) en cualquier tarjeta del catálogo para comparar sus ingredientes, macronutrientes, tiempos de cocción y costo estimado.
        </p>
        <button
          onClick={onExploreMore}
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-colors"
        >
          Explorar Catálogo de Recetas
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-sky-600" />
            <h2 className="text-xl sm:text-2xl font-bold font-serif-display text-stone-900">
              Comparador Culinario (RF-18)
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Analizando {comparedRecipes.length} receta{comparedRecipes.length > 1 ? 's' : ''} seleccionada{comparedRecipes.length > 1 ? 's' : ''} (máximo 3)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {comparedRecipes.length < 3 && (
            <button
              onClick={onExploreMore}
              className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Añadir otra receta
            </button>
          )}
          <button
            onClick={clearCompareRecipes}
            className="flex items-center gap-1.5 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors"
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
                className="bg-white rounded-3xl border border-stone-200 shadow-md overflow-hidden flex flex-col justify-between"
              >
                {/* Recipe Card Top */}
                <div>
                  <div className="relative aspect-[16/10] bg-stone-100">
                    <img
                      src={recipe.coverImage}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => toggleCompareRecipe(recipe.id)}
                      className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
                      title="Quitar de comparación"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white text-xs">
                      <span className="font-semibold bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-xs">
                        {recipe.category}
                      </span>
                      <span className="capitalize font-medium bg-black/50 px-2 py-0.5 rounded-md">
                        {recipe.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-bold font-serif-display text-lg text-stone-900 leading-snug line-clamp-2">
                        {recipe.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                        <span>Por {recipe.authorName}</span>
                        {recipe.coAuthors.length > 0 && <span>(+co-autores)</span>}
                      </div>
                    </div>

                    {/* Quick Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
                        <span className="text-stone-400 block text-[10px] uppercase font-bold">Tiempo Total</span>
                        <span className="font-bold text-stone-800 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          {recipe.prepTimeMin + recipe.cookTimeMin} min
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80">
                        <span className="text-stone-400 block text-[10px] uppercase font-bold">Raciones</span>
                        <span className="font-bold text-stone-800 flex items-center gap-1 mt-0.5">
                          <Users className="w-3.5 h-3.5 text-amber-600" />
                          {recipe.servings} platos
                        </span>
                      </div>
                    </div>

                    {/* Dietary Tags */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1.5">
                        Restricciones Aprobadas
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {recipe.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
                          >
                            {tag.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Nutrition Breakdown */}
                    <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-2">
                      <span className="text-xs font-bold text-amber-950 uppercase flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-orange-600" />
                        Nutrición (por porción)
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-stone-600">Calorías:</span>
                          <strong className="text-stone-900">{recipe.nutrition.calories} kcal</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-600">Proteínas:</span>
                          <strong className="text-stone-900">{recipe.nutrition.proteinG}g</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-600">Carbohidratos:</span>
                          <strong className="text-stone-900">{recipe.nutrition.carbsG}g</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-600">Grasas:</span>
                          <strong className="text-stone-900">{recipe.nutrition.fatG}g</strong>
                        </div>
                      </div>
                    </div>

                    {/* Ingredients Summary & Cost */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-stone-700 uppercase">
                          Ingredientes ({recipe.ingredients.length})
                        </span>
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <Store className="w-3 h-3" />
                          ${totalCost.toFixed(2)} USD
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-stone-600 max-h-44 overflow-y-auto pr-1">
                        {recipe.ingredients.map((ing) => (
                          <div
                            key={ing.id}
                            className="p-1.5 rounded-lg bg-stone-50 flex items-center justify-between border border-stone-200/50"
                          >
                            <span className="truncate pr-2">
                              {ing.quantity} {ing.unit} {ing.name}
                            </span>
                            <span className="shrink-0 font-medium text-stone-500">
                              ${ing.estimatedPrice.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-stone-100 space-y-2">
                  <button
                    onClick={() => addRecipeIngredientsToCart(recipe)}
                    className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Comprar Ingredientes ({recipe.ingredients.length})
                  </button>

                  <button
                    onClick={() => onOpenDetail(recipe)}
                    className="w-full py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors"
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
