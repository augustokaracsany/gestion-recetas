import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Recipe } from '../types';
import { formatARS } from '../utils/currency';
import {
  X,
  ShoppingCart,
  CheckCircle2,
  Layers,
  Sparkles,
  Store,
  ChefHat,
  Search
} from 'lucide-react';

interface MultiRecipeShoppingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCart: () => void;
}

export const MultiRecipeShoppingModal: React.FC<MultiRecipeShoppingModalProps> = ({
  isOpen,
  onClose,
  onOpenCart,
}) => {
  const { recipes, addMultipleRecipesToCart, showToast } = useApp();
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const publishedRecipes = recipes.filter(r => r.status === 'published');
  const filteredRecipes = publishedRecipes.filter(r =>
    r.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const toggleSelectRecipe = (id: string) => {
    setSelectedRecipeIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRecipeIds.length === filteredRecipes.length) {
      setSelectedRecipeIds([]);
    } else {
      setSelectedRecipeIds(filteredRecipes.map(r => r.id));
    }
  };

  const selectedRecipes = publishedRecipes.filter(r => selectedRecipeIds.includes(r.id));

  // Compute total ingredients and consolidated summary
  const totalIngredientsCount = selectedRecipes.reduce((sum, r) => sum + r.ingredients.length, 0);
  const totalCost = selectedRecipes.reduce(
    (sum, r) => sum + r.ingredients.reduce((iSum, ing) => iSum + ing.estimatedPrice, 0),
    0
  );

  const handleConfirmAddToCart = () => {
    if (selectedRecipes.length === 0) {
      showToast('Por favor selecciona al menos una receta.');
      return;
    }
    addMultipleRecipesToCart(selectedRecipes);
    onClose();
    onOpenCart();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-display leading-tight">
                Compra Multi-Receta Consolidada
              </h3>
              <p className="text-xs text-amber-100">
                Selecciona varias recetas para unificar sus ingredientes en una única lista de compra
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Explanatory Banner */}
        <div className="bg-amber-50 px-6 py-3 border-b border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-950">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Consolidación automática:</strong> Si dos recetas utilizan el mismo ingrediente (ej. 200g y 300g de harina), se consolidarán en 500g con el detalle de cada plato.
          </span>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between gap-3 bg-stone-50">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar recetas por nombre o categoría..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs font-semibold text-amber-800 hover:text-amber-950 px-3 py-2 rounded-xl bg-white border border-stone-200 hover:bg-amber-50 transition-colors shrink-0"
          >
            {selectedRecipeIds.length === filteredRecipes.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
          </button>
        </div>

        {/* Recipes Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-10 text-stone-400 text-xs">
              No se encontraron recetas con ese término.
            </div>
          ) : (
            filteredRecipes.map((recipe) => {
              const isSelected = selectedRecipeIds.includes(recipe.id);
              const recipeCost = recipe.ingredients.reduce((sum, i) => sum + i.estimatedPrice, 0);

              return (
                <div
                  key={recipe.id}
                  onClick={() => toggleSelectRecipe(recipe.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300 shadow-sm'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 rounded-md text-amber-600 border-stone-300 focus:ring-amber-500 cursor-pointer"
                    />
                    <img
                      src={recipe.coverImage}
                      alt={recipe.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-stone-200"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                        {recipe.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                        <span>Por {recipe.authorName}</span>
                        <span>•</span>
                        <span className="capitalize">{recipe.category}</span>
                      </p>
                      <div className="text-[11px] text-stone-600 font-medium mt-1 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px]">
                          {recipe.ingredients.length} ingredientes
                        </span>
                        <span className="text-emerald-700 font-bold">
                          {formatARS(recipeCost)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {isSelected ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Seleccionada
                      </span>
                    ) : (
                      <span className="text-[11px] text-stone-400 hover:text-stone-600">
                        Hacer clic para sumar
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Action */}
        <div className="p-5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-stone-600 space-y-0.5 text-center sm:text-left w-full sm:w-auto">
            <div>
              <strong className="text-stone-900 text-sm">
                {selectedRecipes.length} recetas seleccionadas
              </strong>{' '}
              ({totalIngredientsCount} ítems)
            </div>
            <div className="text-emerald-700 font-bold text-sm">
              Costo total aproximado: {formatARS(totalCost)}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmAddToCart}
              disabled={selectedRecipes.length === 0}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              Consolidar y Abrir Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
