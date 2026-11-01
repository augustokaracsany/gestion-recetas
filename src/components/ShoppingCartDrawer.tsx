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
  Sparkles,
  AlertCircle,
  CreditCard,
  MapPin,
  TrendingDown,
  Layers,
  Bookmark,
  ArrowRight,
  RefreshCw,
  Plus,
  Minus,
  Truck,
  Check,
  ShieldCheck,
  CornerDownRight,
  PackageOpen
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-stone-50 h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Top Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight font-display">
                Compra de Ingredientes
              </h3>
              <p className="text-[11px] text-amber-100">
                Moneda local: <strong>Pesos Argentinos ($ ARS)</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-100 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Carrito vs Lista de Deseos */}
        <div className="bg-white border-b border-stone-200 px-5 flex items-center justify-between shrink-0">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('carrito')}
              className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'carrito'
                  ? 'border-amber-600 text-amber-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Carrito ({cart.length})
            </button>
            <button
              onClick={() => setActiveTab('deseos')}
              className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'deseos'
                  ? 'border-amber-600 text-amber-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
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
              className="text-[11px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Layers className="w-3 h-3" />
              Multi-Receta
            </button>
          )}
        </div>

        {/* Location & Preferred Store Bar */}
        <div className="bg-amber-50/60 border-b border-amber-200/60 px-5 py-2.5 text-xs text-stone-700 shrink-0 space-y-2">
          {/* Location Selector */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-stone-800 font-medium truncate">
              <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="truncate">
                Entregar en: <strong>{userLocation.cityName}</strong> (CP {userLocation.postalCode})
              </span>
            </div>
            <button
              onClick={() => setIsEditingLocation(!isEditingLocation)}
              className="text-[11px] font-bold text-amber-800 hover:underline shrink-0 cursor-pointer"
            >
              {isEditingLocation ? 'Cerrar' : 'Cambiar CP'}
            </button>
          </div>

          {isEditingLocation && (
            <form onSubmit={handleApplyLocation} className="p-3 bg-white rounded-xl border border-amber-200 shadow-xs space-y-2 animate-in fade-in">
              <div className="text-[11px] font-bold text-stone-600">Elegir localidad en Argentina:</div>
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
                    className={`text-left p-1.5 rounded-lg text-[10px] border transition-colors truncate ${
                      userLocation.postalCode === loc.postalCode
                        ? 'bg-amber-100 border-amber-400 font-bold text-amber-900'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
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
                  className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-stone-300"
                />
                <input
                  type="text"
                  placeholder="Ciudad o Barrio"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-stone-300"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-amber-600 text-white font-bold rounded-lg text-xs hover:bg-amber-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          )}

          {/* Store Selector */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-200/40">
            <div className="flex items-center gap-1.5 text-stone-800">
              <Store className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Tienda de compra:</span>
            </div>
            <select
              value={preferredStoreId}
              onChange={(e) => setPreferredStoreId(e.target.value)}
              className="text-xs font-bold text-stone-800 bg-white border border-stone-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {PARTNER_STORES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.estimatedDeliveryTime})
                </option>
              ))}
            </select>
          </div>

          {!isStoreAvailableInArea && (
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>
                {currentStore.name} tiene cobertura limitada en CP {userLocation.postalCode}. Te sugerimos cambiar a <strong>Coto Digital</strong> o <strong>Mercado Libre</strong>.
              </span>
            </div>
          )}
        </div>

        {/* Body Container */}
        {checkoutComplete ? (
          <div className="p-8 text-center my-auto space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h4 className="font-bold font-display text-xl text-stone-900">
              ¡Compra Confirmada!
            </h4>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-[#835500] rounded-full text-xs font-mono font-bold mx-auto">
              <span>Pedido: {lastCreatedOrder?.orderNumber || '#GST-ORD'}</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
              Tu pedido de ingredientes frescos se envió directamente a la sucursal de <strong>{lastCreatedOrder?.storeName || currentStore.name}</strong> para entrega en <strong>{lastCreatedOrder?.deliveryAddress.street} {lastCreatedOrder?.deliveryAddress.number} ({lastCreatedOrder?.deliveryAddress.city})</strong>.
            </p>
            <div className="p-4 bg-white rounded-2xl border border-stone-200 text-left text-xs space-y-1.5 shadow-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Tienda asociada:</span>
                <strong className="text-stone-800">{lastCreatedOrder?.storeName || currentStore.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Ingredientes del pedido:</span>
                <strong className="text-stone-800">{lastCreatedOrder?.items.length || itemsToBuy.length} ítems</strong>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Tiempo estimado de llegada:</span>
                <strong className="text-emerald-700">{lastCreatedOrder?.estimatedDeliveryTime || 'Hoy'}</strong>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 pt-1.5 border-t border-stone-100">
                <span>Total abonado ($ ARS):</span>
                <span className="text-emerald-700">{formatARS(lastCreatedOrder?.totalARS || grandTotal)}</span>
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
                className="w-full py-3 bg-[#835500] hover:bg-[#865300] text-white font-bold rounded-2xl text-xs sm:text-sm transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
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
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
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
                <h4 className="font-bold text-stone-800 text-sm">
                  Lista de Deseos de Ingredientes ({wishlistIngredients.length})
                </h4>
                <p className="text-[11px] text-stone-500">
                  Ingredientes guardados individualmente para compras futuras
                </p>
              </div>
              {wishlistIngredients.length > 0 && (
                <button
                  onClick={addAllWishlistIngredientsToCart}
                  className="text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-colors"
                >
                  Comprar todos
                </button>
              )}
            </div>

            {wishlistIngredients.length === 0 ? (
              <div className="text-center py-12 text-stone-400 space-y-2">
                <Bookmark className="w-10 h-10 mx-auto text-stone-300" />
                <p className="text-xs">No tienes ingredientes guardados en tu lista de deseos.</p>
                <p className="text-[11px] text-stone-500">
                  En cualquier receta, haz clic en el ícono de marcador junto a un ingrediente para guardarlo aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {wishlistIngredients.map((wishItem) => (
                  <div
                    key={wishItem.id}
                    className="p-3 bg-white rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-stone-900 truncate">
                        {wishItem.ingredient.quantity} {wishItem.ingredient.unit} {wishItem.ingredient.name}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate mt-0.5">
                        De receta: <span className="font-semibold">{wishItem.recipeTitle}</span>
                      </div>
                      <div className="text-[11px] text-emerald-700 font-bold mt-1">
                        {formatARS(wishItem.ingredient.estimatedPrice)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => moveWishlistIngredientToCart(wishItem.id)}
                        title="Mover al carrito"
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Al Carrito
                      </button>
                      <button
                        onClick={() => removeWishlistIngredient(wishItem.id)}
                        title="Eliminar de lista"
                        className="p-1.5 text-stone-300 hover:text-red-600 transition-colors cursor-pointer"
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
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto border border-amber-200/50">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-stone-800 text-base">Tu carrito de ingredientes está vacío</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                Selecciona ingredientes desde las recetas individuales o utiliza la herramienta Multi-Receta para unificar tu compra semanal.
              </p>
            </div>
            {onOpenMultiRecipe && (
              <button
                type="button"
                onClick={onOpenMultiRecipe}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
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
            <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 border border-emerald-300/80 shadow-xs space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-emerald-950 leading-tight">
                      Ahorro Inteligente en Despensa
                    </h5>
                    <p className="text-[11px] text-emerald-800/80">
                      Marcá lo que ya tenés en casa para descontarlo del total
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                    Ahorro Acumulado
                  </span>
                  <span className="text-sm font-extrabold text-emerald-700">
                    -{formatARS(pantrySavings)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-emerald-200/80 text-emerald-900">
                <span>
                  {itemsInPantry.length} ingrediente{itemsInPantry.length === 1 ? '' : 's'} en despensa
                </span>
                <span className="font-medium text-emerald-800">
                  {itemsToBuy.length} restantes por comprar
                </span>
              </div>
            </div>

            {/* Out of Stock Alert Summary if any */}
            {outOfStockItems.length > 0 && (
              <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl text-xs text-rose-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{outOfStockItems.length} ingrediente(s) sin stock en {currentStore.name}</span>
                </div>
                <p className="text-[11px] text-rose-700">
                  Podés sustituir automáticamente cada ítem por su equivalente o cambiar de tienda asociada con stock en {userLocation.cityName}.
                </p>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                Ingredientes a Comprar ({itemsToBuy.length})
              </span>
              <button
                onClick={clearCart}
                className="text-[11px] text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Vaciar carrito
              </button>
            </div>

            {/* Items To Buy List */}
            <div className="space-y-3">
              {itemsToBuy.map((item) => {
                const baseQty = item.ingredient.quantity > 0 ? item.ingredient.quantity : 1;
                const ratio = item.quantityNeeded / baseQty;
                const itemTotalPrice = item.ingredient.estimatedPrice * ratio;
                const isOutOfStock = !item.ingredient.inStock || item.ingredient.stockLevel === 'agotado';

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl bg-white border shadow-xs space-y-2.5 transition-all ${
                      isOutOfStock ? 'border-rose-300 bg-rose-50/20' : 'border-stone-200'
                    }`}
                  >
                    {/* Top row: Name, Price, Actions */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                            {item.ingredient.name}
                          </span>
                          {item.substitutedBy && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              Sustituido
                            </span>
                          )}
                        </div>

                        {/* Multi-Recipe Attribution Badges */}
                        {item.sources && item.sources.length > 1 ? (
                          <div className="mt-1 flex flex-wrap items-center gap-1">
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                              Consolidado de {item.sources.length} recetas:
                            </span>
                            {item.sources.map((s, idx) => (
                              <span key={idx} className="text-[10px] text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded-md truncate max-w-[160px]">
                                {s.recipeTitle} ({s.quantity}{item.ingredient.unit})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[11px] text-stone-500 mt-0.5 truncate">
                            Para receta: <strong className="text-stone-700">{item.recipeTitle}</strong>
                          </div>
                        )}

                        {/* Store and stock tag */}
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500">
                          <span className="flex items-center gap-1 font-medium text-stone-700">
                            <Store className="w-3 h-3 text-stone-400" />
                            {item.storeName || currentStore.name}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-stone-600">
                            Unit: {formatARS(item.ingredient.estimatedPrice)}
                          </span>
                        </div>
                      </div>

                      {/* Price & Quantity Box */}
                      <div className="text-right shrink-0">
                        <div className="text-xs sm:text-sm font-extrabold text-emerald-700">
                          {formatARS(itemTotalPrice)}
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center justify-end gap-1 mt-1.5">
                          <button
                            type="button"
                            onClick={() => updateCartItemQuantity(item.id, Math.max(0, item.quantityNeeded - (baseQty > 10 ? 50 : 1)))}
                            className="w-5 h-5 rounded-md bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 text-xs cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-[11px] font-bold text-stone-800 px-1">
                            {item.quantityNeeded} {item.ingredient.unit}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartItemQuantity(item.id, item.quantityNeeded + (baseQty > 10 ? 50 : 1))}
                            className="w-5 h-5 rounded-md bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 text-xs cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Out of Stock Warning & 1-Click Resolvers */}
                    {isOutOfStock && (
                      <div className="p-2.5 rounded-xl bg-rose-100/70 border border-rose-300 text-[11px] text-rose-900 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            Sin stock en {item.storeName || currentStore.name} en CP {userLocation.postalCode}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.ingredient.suggestedSubstitute && (
                            <button
                              type="button"
                              onClick={() => applyCartItemSubstitute(item.id, item.ingredient.suggestedSubstitute!)}
                              className="px-2.5 py-1 bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              Sustituir por {item.ingredient.suggestedSubstitute}
                            </button>
                          )}

                          {/* Quick Store switcher for this item */}
                          {PARTNER_STORES.filter(s => s.id !== preferredStoreId).slice(0, 2).map((otherStore) => (
                            <button
                              key={otherStore.id}
                              type="button"
                              onClick={() => updateCartItemStore(item.id, otherStore.name)}
                              className="px-2 py-1 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Store className="w-3 h-3 text-stone-500" />
                              Comprar en {otherStore.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bottom row: Pantry Toggle & Wishlist Move */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                      <button
                        type="button"
                        onClick={() => togglePantryItem(item.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-200"
                      >
                        <span>🏠 Ya lo tengo en casa (Descontar)</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveCartItemToWishlist(item.id)}
                          title="Mover a lista de deseos"
                          className="p-1 text-stone-400 hover:text-amber-700 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          title="Eliminar del carrito"
                          className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Items Already in Pantry Section */}
            {itemsInPantry.length > 0 && (
              <div className="pt-3 border-t border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">
                    En Despensa Personal ({itemsInPantry.length}) - No se comprarán
                  </span>
                  <span className="text-[11px] text-emerald-700 font-extrabold">
                    Ahorrado: -{formatARS(pantrySavings)}
                  </span>
                </div>

                {itemsInPantry.map((item) => {
                  const baseQty = item.ingredient.quantity > 0 ? item.ingredient.quantity : 1;
                  const ratio = item.quantityNeeded / baseQty;
                  const itemTotalPrice = item.ingredient.estimatedPrice * ratio;

                  return (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-stone-100/80 border border-stone-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={() => togglePantryItem(item.id)}
                          title="Volver a poner en lista de compra"
                          className="px-2 py-0.5 rounded-md bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-[10px] cursor-pointer"
                        >
                          Restaurar
                        </button>
                        <span className="line-through text-stone-500 truncate">
                          {item.quantityNeeded} {item.ingredient.unit} {item.ingredient.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold shrink-0">
                        Ahorrado ({formatARS(itemTotalPrice)})
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer Checkout Summary with Detailed Store Breakdown */}
        {!checkoutComplete && activeTab === 'carrito' && cart.length > 0 && (
          <div className="p-5 bg-white border-t border-stone-200 shrink-0 space-y-3.5 shadow-lg">
            {/* Store & Delivery Breakdown */}
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal ingredientes ({itemsToBuy.length} ítems):</span>
                <span className="font-semibold text-stone-900">{formatARS(subtotalToBuy)}</span>
              </div>

              {pantrySavings > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Ahorro por despensa:</span>
                  <span>-{formatARS(pantrySavings)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-stone-400" />
                  Envío estimado ({currentStore.name}):
                </span>
                <span className="font-semibold text-stone-900">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold">¡Envío Gratis!</span>
                  ) : (
                    formatARS(deliveryFee)
                  )}
                </span>
              </div>

              {/* Free delivery threshold progress bar */}
              {!isFreeDelivery && subtotalToBuy > 0 && (
                <div className="pt-1">
                  <div className="flex justify-between text-[10px] text-stone-500 mb-1">
                    <span>Envío gratis a partir de {formatARS(currentStore.freeDeliveryMinARS)}</span>
                    <span>Faltan {formatARS(currentStore.freeDeliveryMinARS - subtotalToBuy)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (subtotalToBuy / currentStore.freeDeliveryMinARS) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between text-base font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                <span>Total a pagar:</span>
                <span className="text-emerald-700">{formatARS(grandTotal)}</span>
              </div>
            </div>

            {/* Buy CTA */}
            <button
              onClick={handleSimulateCheckout}
              disabled={itemsToBuy.length === 0}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              Comprar en {currentStore.name} ({formatARS(grandTotal)})
            </button>
          </div>
        )}
      </div>

      <OrderTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        order={selectedOrderForTracking}
      />
    </div>
  );
};
