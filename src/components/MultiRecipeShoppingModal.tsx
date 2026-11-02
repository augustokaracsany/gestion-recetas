import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatARS } from '../utils/currency';
import {
  X,
  ShoppingCart,
  CheckCircle2,
  Layers,
  Sparkles,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-900 text-zinc-100 w-full max-w-2xl rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-zinc-950 border-b border-zinc-800 text-zinc-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Layers className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-display leading-tight text-zinc-100">
                Compra Multi-Receta Consolidada
              </h3>
              <p className="text-xs text-zinc-400">
                Selecciona varias recetas para unificar sus ingredientes en una única lista de compra
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Explanatory Banner */}
        <div className="bg-zinc-950 px-6 py-3 border-b border-zinc-800 flex items-center gap-2.5 text-xs text-amber-400">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Consolidación automática:</strong> Si dos recetas utilizan el mismo ingrediente (ej. 200g y 300g de harina), se consolidarán en 500g con el detalle de cada plato.
          </span>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between gap-3 bg-zinc-950">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar recetas por nombre o categoría..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
            />
          </div>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
          >
            {selectedRecipeIds.length === filteredRecipes.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
          </button>
        </div>

        {/* Recipes Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-xs">
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
                      ? 'bg-zinc-950 border-amber-500 ring-2 ring-amber-500/30 shadow-md'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 text-amber-500 bg-zinc-900 border-zinc-700 rounded-md focus:ring-amber-500 cursor-pointer"
                    />
                    <img
                      src={recipe.coverImage}
                      alt={recipe.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-zinc-800"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-100 truncate">
                        {recipe.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 capitalize truncate mt-0.5">
                        {recipe.category} • {recipe.ingredients.length} ingredientes
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-amber-400 block">
                      ~{formatARS(recipeCost)}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      {recipe.servings} raciones
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Consolidated Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-4 shrink-0">
          <div>
            <span className="text-xs text-zinc-400 block">
              {selectedRecipeIds.length} receta(s) seleccionada(s)
            </span>
            <div className="text-base font-extrabold text-amber-400 font-display">
              {totalIngredientsCount} ingrediente(s) • {formatARS(totalCost)}
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirmAddToCart}
            disabled={selectedRecipeIds.length === 0}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Añadir al Carrito</span>
          </button>
        </div>
      </div>
    </div>
  );
};
