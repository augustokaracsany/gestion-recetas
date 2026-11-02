import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PurchaseOrder } from '../types';
import { OrderTrackingModal } from './OrderTrackingModal';
import {
  PARTNER_STORES,
  PRESET_LOCATIONS,
  PartnerStore,
  checkStoreCoverage,
  getStoreById
} from '../data/storesData';
import { formatARS } from '../utils/currency';
import {
  X,
  ShoppingCart,
  Trash2,
  CheckCircle2,
  Store,
  AlertCircle,
  MapPin,
  TrendingDown,
  Layers,
  Bookmark,
  Plus,
  Minus,
  Truck
} from 'lucide-react';

interface ShoppingCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMultiRecipe?: () => void;
}

export const ShoppingCartDrawer: React.FC<ShoppingCartDrawerProps> = ({
  isOpen,
  onClose,
  onOpenMultiRecipe,
}) => {
  const {
    cart,
    togglePantryItem,
    updateCartItemQuantity,
    updateCartItemStore,
    applyCartItemSubstitute,
    removeFromCart,
    clearCart,
    userLocation,
    setUserLocation,
    preferredStoreId,
    setPreferredStoreId,
    moveCartItemToWishlist,
    currentUser,
    moveWishlistIngredientToCart,
    removeWishlistIngredient,
    addAllWishlistIngredientsToCart,
    activeDeliveryAddress,
    createOrderFromCart,
    selectedOrderForTracking,
    setSelectedOrderForTracking,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'carrito' | 'deseos'>('carrito');
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<PurchaseOrder | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [customPostalCode, setCustomPostalCode] = useState(userLocation.postalCode);
  const [customCity, setCustomCity] = useState(userLocation.cityName);

  if (!isOpen) return null;

  // Selected preferred store object
  const currentStore: PartnerStore = getStoreById(preferredStoreId) || PARTNER_STORES[0];

  // Validate coverage of active store in user's postal code
  const isStoreAvailableInArea = checkStoreCoverage(currentStore, userLocation.postalCode);

  // Group items by pantry vs to buy
  const itemsToBuy = cart.filter(item => !item.haveInPantry);
  const itemsInPantry = cart.filter(item => item.haveInPantry);

  // Compute subtotal (using unit price * (quantity / original base quantity))
  const subtotalToBuy = itemsToBuy.reduce((sum, item) => {
    const baseQuantity = item.ingredient.quantity > 0 ? item.ingredient.quantity : 1;
    const ratio = item.quantityNeeded / baseQuantity;
    return sum + (item.ingredient.estimatedPrice * ratio);
  }, 0);

  // Compute pantry savings
  const pantrySavings = itemsInPantry.reduce((sum, item) => {
    const baseQuantity = item.ingredient.quantity > 0 ? item.ingredient.quantity : 1;
    const ratio = item.quantityNeeded / baseQuantity;
    return sum + (item.ingredient.estimatedPrice * ratio);
  }, 0);

  // Delivery fee calculation
  const isFreeDelivery = subtotalToBuy >= currentStore.freeDeliveryMinARS;
  const deliveryFee = itemsToBuy.length === 0 ? 0 : (isFreeDelivery ? 0 : currentStore.deliveryFeeARS);
  const grandTotal = subtotalToBuy + deliveryFee;

  // Check out of stock items
  const outOfStockItems = itemsToBuy.filter(item => !item.ingredient.inStock || item.ingredient.stockLevel === 'agotado');

  const handleApplyLocation = (e: React.FormEvent) => {
    e.preventDefault();
    setUserLocation({
      postalCode: customPostalCode.trim() || '1414',
      cityName: customCity.trim() || 'CABA',
      city: customCity.trim() || 'CABA',
      zone: 'Área urbana',
      province: 'Argentina'
    });
    setIsEditingLocation(false);
  };

  const handleSimulateCheckout = () => {
    if (outOfStockItems.length > 0) {
      showToast('Atención: Algunos ingredientes no tienen stock. Te recomendamos sustituirlos o cambiar de tienda antes de comprar.');
    }
    const order = createOrderFromCart(activeDeliveryAddress || undefined);
    if (order) {
      setLastCreatedOrder(order);
      setCheckoutComplete(true);
    }
  };

  const wishlistIngredients = currentUser?.wishlistIngredientItems || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-900 text-zinc-100 h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-zinc-800 animate-in slide-in-from-right duration-300">
        
        {/* Top Header */}
        <div className="px-5 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight font-display text-zinc-100">
                Compra de Ingredientes
              </h3>
              <p className="text-[11px] text-zinc-400">
                Moneda local: <strong>Pesos Argentinos ($ ARS)</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Carrito vs Lista de Deseos */}
        <div className="bg-zinc-950 border-b border-zinc-800 px-5 flex items-center justify-between shrink-0">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('carrito')}
              className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'carrito'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Carrito ({cart.length})
            </button>
            <button
              onClick={() => setActiveTab('deseos')}
              className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'deseos'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              Ingredientes Guardados ({wishlistIngredients.length})
            </button>
          </div>

          {onOpenMultiRecipe && activeTab === 'carrito' && (
            <button
              type="button"
              onClick={onOpenMultiRecipe}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Layers className="w-3 h-3" />
              Multi-Receta
            </button>
          )}
        </div>

        {/* Location & Preferred Store Bar */}
        <div className="bg-zinc-950 border-b border-zinc-800 px-5 py-2.5 text-xs text-zinc-300 shrink-0 space-y-2">
          {/* Location Selector */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-zinc-200 font-medium truncate">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">
                Entregar en: <strong>{userLocation.cityName}</strong> (CP {userLocation.postalCode})
              </span>
            </div>
            <button
              onClick={() => setIsEditingLocation(!isEditingLocation)}
              className="text-[11px] font-bold text-amber-400 hover:underline shrink-0 cursor-pointer"
            >
              {isEditingLocation ? 'Cerrar' : 'Cambiar CP'}
            </button>
          </div>

          {isEditingLocation && (
            <form onSubmit={handleApplyLocation} className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 shadow-xl space-y-2 animate-in fade-in">
              <div className="text-[11px] font-bold text-zinc-300">Elegir localidad en Argentina:</div>
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                {PRESET_LOCATIONS.map((loc) => (
                  <button
                    key={loc.postalCode}
                    type="button"
                    onClick={() => {
                      setUserLocation(loc);
                      setCustomPostalCode(loc.postalCode);
                      setCustomCity(loc.cityName);
                      setIsEditingLocation(false);
                    }}
                    className={`text-left p-1.5 rounded-lg text-[10px] border transition-colors truncate cursor-pointer ${
                      userLocation.postalCode === loc.postalCode
                        ? 'bg-amber-500/20 border-amber-500 font-bold text-amber-400'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    CP {loc.postalCode} - {loc.cityName}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Código Postal (ej: 1414)"
                  value={customPostalCode}
                  onChange={(e) => setCustomPostalCode(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100"
                />
                <input
                  type="text"
                  placeholder="Ciudad o Barrio"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          )}

          {/* Store Selector */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Store className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Tienda de compra:</span>
            </div>
            <select
              value={preferredStoreId}
              onChange={(e) => setPreferredStoreId(e.target.value)}
              className="text-xs font-bold text-zinc-100 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {PARTNER_STORES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.estimatedDeliveryTime})
                </option>
              ))}
            </select>
          </div>

          {!isStoreAvailableInArea && (
            <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-[11px] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>
                {currentStore.name} tiene cobertura limitada en CP {userLocation.postalCode}. Te sugerimos cambiar a <strong>Coto Digital</strong> o <strong>Mercado Libre</strong>.
              </span>
            </div>
          )}
        </div>

        {/* Body Container */}
        {checkoutComplete ? (
          <div className="p-8 text-center my-auto space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h4 className="font-bold font-display text-xl text-zinc-100">
              ¡Compra Confirmada!
            </h4>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-mono font-bold mx-auto">
              <span>Pedido: {lastCreatedOrder?.orderNumber || '#GST-ORD'}</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
              Tu pedido de ingredientes frescos se envió directamente a la sucursal de <strong>{lastCreatedOrder?.storeName || currentStore.name}</strong> para entrega en <strong>{lastCreatedOrder?.deliveryAddress.street} {lastCreatedOrder?.deliveryAddress.number} ({lastCreatedOrder?.deliveryAddress.city})</strong>.
            </p>
            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-left text-xs space-y-1.5 shadow-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Tienda asociada:</span>
                <strong className="text-zinc-100">{lastCreatedOrder?.storeName || currentStore.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Ingredientes del pedido:</span>
                <strong className="text-zinc-100">{lastCreatedOrder?.items.length || itemsToBuy.length} ítems</strong>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Tiempo estimado de llegada:</span>
                <strong className="text-emerald-400">{lastCreatedOrder?.estimatedDeliveryTime || 'Hoy'}</strong>
              </div>
              <div className="flex justify-between text-sm font-bold text-zinc-100 pt-1.5 border-t border-zinc-800">
                <span>Total abonado ($ ARS):</span>
                <span className="text-emerald-400">{formatARS(lastCreatedOrder?.totalARS || grandTotal)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (lastCreatedOrder) {
                    setSelectedOrderForTracking(lastCreatedOrder);
                    setIsTrackingModalOpen(true);
                  }
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-2xl text-xs sm:text-sm transition-colors cursor-pointer shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4" />
                <span>Ver Seguimiento en Tiempo Real</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCheckoutComplete(false);
                  onClose();
                }}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-2xl text-xs transition-colors cursor-pointer border border-zinc-700"
              >
                Volver al Recetario
              </button>
            </div>
          </div>
        ) : activeTab === 'deseos' ? (
          /* Wishlist Ingredients Tab */
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-zinc-100 text-sm">
                  Lista de Deseos de Ingredientes ({wishlistIngredients.length})
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Ingredientes guardados individualmente para compras futuras
                </p>
              </div>
              {wishlistIngredients.length > 0 && (
                <button
                  onClick={addAllWishlistIngredientsToCart}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  Comprar todos
                </button>
              )}
            </div>

            {wishlistIngredients.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 space-y-2">
                <Bookmark className="w-10 h-10 mx-auto text-zinc-600" />
                <p className="text-xs text-zinc-400">No tienes ingredientes guardados en tu lista de deseos.</p>
                <p className="text-[11px] text-zinc-500">
                  En cualquier receta, haz clic en el ícono de marcador junto a un ingrediente para guardarlo aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {wishlistIngredients.map((wishItem) => (
                  <div
                    key={wishItem.id}
                    className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-100 truncate">
                        {wishItem.ingredient.quantity} {wishItem.ingredient.unit} {wishItem.ingredient.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                        De receta: <span className="font-semibold text-zinc-200">{wishItem.recipeTitle}</span>
                      </div>
                      <div className="text-[11px] text-emerald-400 font-bold mt-1">
                        {formatARS(wishItem.ingredient.estimatedPrice)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => moveWishlistIngredientToCart(wishItem.id)}
                        title="Mover al carrito"
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[11px] font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Al Carrito
                      </button>
                      <button
                        onClick={() => removeWishlistIngredient(wishItem.id)}
                        title="Eliminar de lista"
                        className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : cart.length === 0 ? (
          <div className="p-8 text-center my-auto space-y-4">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-3xl flex items-center justify-center mx-auto border border-amber-500/30">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-zinc-100 text-base">Tu carrito de ingredientes está vacío</h4>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                Selecciona ingredientes desde las recetas individuales o utiliza la herramienta Multi-Receta para unificar tu compra semanal.
              </p>
            </div>
            {onOpenMultiRecipe && (
              <button
                type="button"
                onClick={onOpenMultiRecipe}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                Unificar Varias Recetas
              </button>
            )}
          </div>
        ) : (
          /* Main Cart Content */
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            
            {/* REDISEÑO VISUAL DEL TIP DE DESPENSA / AHORRO INTELIGENTE */}
            <div className="rounded-2xl p-4 bg-zinc-950 border border-emerald-500/30 shadow-xs space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-xs">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-zinc-100 leading-tight">
                      Ahorro Inteligente en Despensa
                    </h5>
                    <p className="text-[11px] text-zinc-400">
                      Marcá lo que ya tenés en casa para descontarlo del total
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                    Ahorro Acumulado
                  </span>
                  <span className="text-sm font-extrabold text-emerald-400">
                    -{formatARS(pantrySavings)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-zinc-800 text-zinc-300">
                <span>
                  {itemsInPantry.length} ingrediente{itemsInPantry.length === 1 ? '' : 's'} en despensa
                </span>
                <span className="font-medium text-amber-400">
                  {itemsToBuy.length} restantes por comprar
                </span>
              </div>
            </div>

            {/* Out of Stock Alert Summary if any */}
            {outOfStockItems.length > 0 && (
              <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-xs text-rose-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{outOfStockItems.length} ingrediente(s) sin stock en {currentStore.name}</span>
                </div>
                <p className="text-[11px] text-rose-300/80">
                  Puedes cambiarlos por un sustituto sugerido o comprar en otra tienda.
                </p>
              </div>
            )}

            {/* List of Ingredients */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
                <span>Ingredientes ({cart.length})</span>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-zinc-500 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer lowercase font-normal"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  vaciar
                </button>
              </div>

              <div className="space-y-2.5">
                {cart.map((item) => {
                  const baseQty = item.ingredient.quantity > 0 ? item.ingredient.quantity : 1;
                  const ratio = item.quantityNeeded / baseQty;
                  const itemTotalPrice = item.ingredient.estimatedPrice * ratio;
                  const isOutOfStock = !item.ingredient.inStock || item.ingredient.stockLevel === 'agotado';

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                        item.haveInPantry
                          ? 'bg-zinc-950/60 border-zinc-800/60 opacity-60'
                          : isOutOfStock
                          ? 'bg-rose-950/30 border-rose-900/50'
                          : 'bg-zinc-950 border-zinc-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <button
                            type="button"
                            onClick={() => togglePantryItem(item.id)}
                            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                              item.haveInPantry
                                ? 'bg-emerald-500 border-emerald-500 text-zinc-950'
                                : 'border-zinc-700 bg-zinc-900 hover:border-amber-500'
                            }`}
                            title={item.haveInPantry ? 'Marcar como necesario' : 'Marcar como ya lo tengo en despensa'}
                          >
                            {item.haveInPantry && <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950" />}
                          </button>

                          <div className="min-w-0">
                            <h5 className={`font-bold text-xs leading-snug truncate ${item.haveInPantry ? 'line-through text-zinc-500' : 'text-zinc-100'}`}>
                              {item.ingredient.name}
                            </h5>
                            <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                              De: <span className="font-semibold text-zinc-300">{item.recipeTitle}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className={`text-xs font-bold ${item.haveInPantry ? 'text-zinc-500 line-through' : 'text-amber-400'}`}>
                            {formatARS(itemTotalPrice)}
                          </div>
                          <span className="text-[10px] text-zinc-500 block">
                            ~{formatARS(item.ingredient.estimatedPrice)}/{baseQty}{item.ingredient.unit}
                          </span>
                        </div>
                      </div>

                      {/* Controls: Quantity, Store, Substitutes */}
                      {!item.haveInPantry && (
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                          <div className="flex items-center gap-1.5 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                            <button
                              type="button"
                              onClick={() => updateCartItemQuantity(item.id, Math.max(1, item.quantityNeeded - 1))}
                              className="w-5 h-5 rounded-md hover:bg-zinc-800 flex items-center justify-center text-zinc-300 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-1.5 font-bold text-[11px] min-w-[28px] text-center text-zinc-100">
                              {item.quantityNeeded} {item.ingredient.unit}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartItemQuantity(item.id, item.quantityNeeded + 1)}
                              className="w-5 h-5 rounded-md hover:bg-zinc-800 flex items-center justify-center text-zinc-300 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => moveCartItemToWishlist(item.id)}
                              className="text-[11px] text-zinc-400 hover:text-amber-400 font-semibold cursor-pointer"
                              title="Guardar ingrediente para después"
                            >
                              Guardar
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="text-[11px] text-zinc-500 hover:text-rose-400 font-semibold cursor-pointer"
                              title="Eliminar del carrito"
                            >
                              Quitar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Footer Checkout Summary Bar */}
        {!checkoutComplete && cart.length > 0 && activeTab === 'carrito' && (
          <div className="p-4 bg-zinc-950 border-t border-zinc-800 shrink-0 space-y-3 shadow-2xl">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal ingredientes ({itemsToBuy.length} ítems):</span>
                <span className="font-semibold text-zinc-100">{formatARS(subtotalToBuy)}</span>
              </div>

              <div className="flex justify-between text-zinc-400">
                <span>Costo de envío ({currentStore.name}):</span>
                {isFreeDelivery ? (
                  <span className="font-bold text-emerald-400">¡GRATIS!</span>
                ) : (
                  <span className="font-semibold text-zinc-100">{formatARS(deliveryFee)}</span>
                )}
              </div>

              {!isFreeDelivery && (
                <div className="text-[10px] text-amber-400 font-semibold text-right">
                  Agrega {formatARS(currentStore.freeDeliveryMinARS - subtotalToBuy)} más para envío GRATIS
                </div>
              )}

              <div className="flex justify-between text-sm sm:text-base font-extrabold text-zinc-100 pt-2 border-t border-zinc-800">
                <span>Total estimado ($ ARS):</span>
                <span className="text-amber-400 font-display text-lg">{formatARS(grandTotal)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSimulateCheckout}
              disabled={itemsToBuy.length === 0}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Confirmar Compra ({itemsToBuy.length} ítems en {currentStore.name})</span>
            </button>
          </div>
        )}

      </div>

      {/* Order Tracking Modal */}
      {selectedOrderForTracking && (
        <OrderTrackingModal
          isOpen={isTrackingModalOpen}
          onClose={() => setIsTrackingModalOpen(false)}
          order={selectedOrderForTracking}
        />
      )}
    </div>
  );
};
