import React, { useState } from 'react';
import { Recipe, Ingredient } from '../types';
import { useApp } from '../context/AppContext';
import { formatARS } from '../utils/currency';
import {
  X,
  ShoppingCart,
  CheckCircle2,
  Sparkles,
  Layers,
  Trash2,
  Plus
} from 'lucide-react';

interface WeeklyShoppingModalProps {
  isOpen: boolean;
  onClose: () => void;
  plannedRecipes: Recipe[];
}

export const WeeklyShoppingModal: React.FC<WeeklyShoppingModalProps> = ({
  isOpen,
  onClose,
  plannedRecipes,
}) => {
  const { addMultipleRecipesToCart, showToast } = useApp();
  const [checkedItemIds, setCheckedItemIds] = useState<string[]>([]);

  if (!isOpen) return null;

  // Consolidate all ingredients across planned recipes
  const consolidatedMap = new Map<string, {
    name: string;
    totalQuantity: number;
    unit: string;
    totalEstimatedPrice: number;
    recipes: string[];
    category: string;
  }>();

  plannedRecipes.forEach((recipe) => {
    recipe.ingredients.forEach((ing) => {
      const key = ing.name.toLowerCase().trim();
      if (consolidatedMap.has(key)) {
        const existing = consolidatedMap.get(key)!;
        existing.totalQuantity += ing.quantity;
        existing.totalEstimatedPrice += ing.estimatedPrice;
        if (!existing.recipes.includes(recipe.title)) {
          existing.recipes.push(recipe.title);
        }
      } else {
        consolidatedMap.set(key, {
          name: ing.name,
          totalQuantity: ing.quantity,
          unit: ing.unit,
          totalEstimatedPrice: ing.estimatedPrice,
          recipes: [recipe.title],
          category: ing.category || 'frescos'
        });
      }
    });
  });

  const consolidatedList = Array.from(consolidatedMap.values());
  const grandTotalEstimatedPrice = consolidatedList.reduce((sum, item) => sum + item.totalEstimatedPrice, 0);

  const toggleCheckItem = (name: string) => {
    setCheckedItemIds((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const handleSendAllToCart = () => {
    if (plannedRecipes.length === 0) {
      showToast('No hay recetas en el plan semanal.');
      return;
    }
    addMultipleRecipesToCart(plannedRecipes);
    showToast(`¡${consolidatedList.length} ingredientes consolidados enviados al carrito de compras!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-900 text-zinc-100 w-full max-w-2xl rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-display text-zinc-100 leading-tight">
                Lista de Compras Consolidada Semanal
              </h3>
              <p className="text-xs text-zinc-400">
                Basada en las {plannedRecipes.length} recetas planificadas para tu semana
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
            <strong>Consolidación Inteligente:</strong> Los ingredientes repetidos en diferentes días de la semana se han sumado automáticamente.
          </span>
        </div>

        {/* Ingredients List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {consolidatedList.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No hay ingredientes en el plan semanal actual. Agrega recetas a los días de la semana para generar tu lista.
            </div>
          ) : (
            consolidatedList.map((item) => {
              const isChecked = checkedItemIds.includes(item.name);

              return (
                <div
                  key={item.name}
                  onClick={() => toggleCheckItem(item.name)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isChecked
                      ? 'bg-zinc-950/60 border-zinc-800 opacity-50'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? 'bg-emerald-500 border-emerald-500 text-zinc-950'
                          : 'border-zinc-700 bg-zinc-900'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>

                    <div className="min-w-0">
                      <h4 className={`font-bold text-xs sm:text-sm truncate ${isChecked ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                        {item.totalQuantity} {item.unit} de {item.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                        Utilizado en: {item.recipes.join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-xs font-bold block ${isChecked ? 'text-zinc-500 line-through' : 'text-amber-400'}`}>
                      ~{formatARS(item.totalEstimatedPrice)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Action */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div>
            <span className="text-xs text-zinc-400 block">
              Total estimado para la semana ({consolidatedList.length} ítems):
            </span>
            <div className="text-lg font-extrabold text-amber-400 font-display">
              {formatARS(grandTotalEstimatedPrice)}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendAllToCart}
            disabled={consolidatedList.length === 0}
            className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Enviar Todos al Carrito General</span>
          </button>
        </div>

      </div>
    </div>
  );
};
