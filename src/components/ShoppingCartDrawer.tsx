import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  ShoppingCart,
  Trash2,
  CheckCircle2,
  Store,
  Sparkles,
  AlertCircle,
  CreditCard,
  PackageCheck,
  CheckSquare,
  Square
} from 'lucide-react';

interface ShoppingCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShoppingCartDrawer: React.FC<ShoppingCartDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    cart,
    togglePantryItem,
    removeFromCart,
    clearCart,
    selectedStoreFilter,
    setSelectedStoreFilter,
    showToast
  } = useApp();

  const [checkoutComplete, setCheckoutComplete] = useState(false);

  if (!isOpen) return null;

  // Filter items by store
  const filteredCart = selectedStoreFilter === 'Todas'
    ? cart
    : cart.filter((item) => item.storeName === selectedStoreFilter);

  // Active items to buy (those NOT already in pantry)
  const itemsToBuy = filteredCart.filter((item) => !item.haveInPantry);
  const itemsInPantry = filteredCart.filter((item) => item.haveInPantry);

  const subtotal = itemsToBuy.reduce((sum, item) => sum + item.ingredient.estimatedPrice, 0);
  const deliveryFee = itemsToBuy.length > 0 ? 2.50 : 0;
  const grandTotal = subtotal + deliveryFee;

  const stores = ['Todas', 'Supermercado Central Gourmet', 'Dietética El Trébol Verde', 'Mercado Fresco Orgánico', 'Molino & Cereal San Jorge'];

  const handleSimulateCheckout = () => {
    setCheckoutComplete(true);
    showToast('¡Pedido de ingredientes confirmado con las tiendas asociadas!');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-5 bg-[#E09F3E] text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
            <div>
              <h3 className="font-bold text-base leading-tight font-display">
                Carrito de Ingredientes
              </h3>
              <p className="text-xs text-amber-100">
                {cart.length} ingredientes acumulados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-100 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Content */}
        {checkoutComplete ? (
          <div className="p-8 text-center my-auto space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[36px]">check_circle</span>
            </div>
            <h4 className="font-bold font-display text-xl text-stone-900">
              ¡Pedido Realizado con Éxito!
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Tus ingredientes han sido ordenados directamente en las tiendas asociadas seleccionadas. Recibirás tu pedido de cocina en tu dirección asignada.
            </p>
            <div className="p-4 bg-[#F6F3F2] rounded-2xl border border-stone-200 text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-500">Total abonado:</span>
                <strong className="text-emerald-700">${grandTotal.toFixed(2)} USD</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Ingredientes comprados:</span>
                <strong className="text-stone-800">{itemsToBuy.length} ítems</strong>
              </div>
            </div>
            <button
              onClick={() => {
                clearCart();
                setCheckoutComplete(false);
                onClose();
              }}
              className="w-full py-2.5 bg-[#E09F3E] hover:bg-[#835500] text-white font-bold rounded-full text-xs transition-colors cursor-pointer"
            >
              Listo y Volver a Cocinar
            </button>
          </div>
        ) : cart.length === 0 ? (
          <div className="p-8 text-center my-auto space-y-3">
            <div className="w-14 h-14 bg-stone-100 text-stone-400 rounded-3xl flex items-center justify-center mx-auto">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-stone-800 text-base">Tu carrito está vacío</h4>
            <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
              Visita cualquier receta y presiona "Comprar Ingredientes" para armar tu lista de compras virtual.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Store Filter Selector */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1.5 flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-amber-600" />
                Filtrar por Tienda Asociada:
              </label>
              <select
                value={selectedStoreFilter}
                onChange={(e) => setSelectedStoreFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50 font-medium text-stone-800 focus:ring-2 focus:ring-amber-500"
              >
                {stores.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Hint about pantry toggle */}
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-snug">
              💡 <strong>Tip inteligente:</strong> Marca la casilla <em>"Ya lo tengo en casa"</em> para no comprar ingredientes que ya tienes en tu despensa.
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 uppercase">
                  Ingredientes por Comprar ({itemsToBuy.length})
                </span>
                <button
                  onClick={clearCart}
                  className="text-[11px] text-red-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3 h-3" />
                  Vaciar carrito
                </button>
              </div>

              {itemsToBuy.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => togglePantryItem(item.id)}
                        title="Marcar como ya disponible en despensa"
                        className="mt-0.5 text-stone-400 hover:text-amber-600"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                      <div>
                        <div className="text-xs font-bold text-stone-900">
                          {item.ingredient.quantity} {item.ingredient.unit} {item.ingredient.name}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          Para receta: <strong className="text-stone-700">{item.recipeTitle}</strong>
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5 flex items-center gap-1">
                          <Store className="w-2.5 h-2.5" />
                          <span>{item.storeName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-emerald-700">
                        ${item.ingredient.estimatedPrice.toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-300 hover:text-red-500 p-1 mt-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Stock check indicator */}
                  <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-stone-100">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <strong className="text-stone-600">Stock en tienda:</strong>
                    </span>
                    <span className="font-semibold text-emerald-700 capitalize">
                      {item.ingredient.stockLevel || 'Disponible'}
                    </span>
                  </div>
                </div>
              ))}

              {/* Items in Pantry section */}
              {itemsInPantry.length > 0 && (
                <div className="pt-3 border-t border-stone-200 space-y-2">
                  <span className="text-xs font-bold text-stone-400 uppercase">
                    En mi despensa personal ({itemsInPantry.length})
                  </span>
                  {itemsInPantry.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-xs opacity-70"
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePantryItem(item.id)}
                          className="text-emerald-600"
                        >
                          <CheckSquare className="w-4 h-4" />
                        </button>
                        <span className="line-through text-stone-500">
                          {item.ingredient.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        Ahorrado (${item.ingredient.estimatedPrice.toFixed(2)})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Checkout Summary */}
        {!checkoutComplete && cart.length > 0 && (
          <div className="p-5 bg-stone-50 border-t border-stone-200 shrink-0 space-y-3">
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal ingredientes:</span>
                <span className="font-semibold text-stone-900">${subtotal.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span>Envío estimado conjunto:</span>
                <span className="font-semibold text-stone-900">${deliveryFee.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 pt-1 border-t border-stone-200">
                <span>Total a pagar:</span>
                <span className="text-emerald-700">${grandTotal.toFixed(2)} USD</span>
              </div>
            </div>

            <button
              onClick={handleSimulateCheckout}
              disabled={itemsToBuy.length === 0}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Comprar en Tiendas Asociadas (${grandTotal.toFixed(2)})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
