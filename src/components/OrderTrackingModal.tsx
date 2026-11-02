import React from 'react';
import { useApp } from '../context/AppContext';
import { PurchaseOrder, OrderStatus } from '../types';
import { formatARS } from '../utils/currency';
import {
  X,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ShoppingBag,
  Store,
  ChevronRight,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  Receipt
} from 'lucide-react';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: PurchaseOrder | null;
}

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'pendiente_pago', label: 'Pago Validado', desc: 'Acreditado vía Mercado Pago' },
  { key: 'en_preparacion', label: 'En Preparación', desc: 'Selección de ingredientes frescos' },
  { key: 'despachado', label: 'Despachado', desc: 'Embalado y asignado al repartidor' },
  { key: 'en_camino', label: 'En Camino', desc: 'El repartidor viaja hacia tu domicilio' },
  { key: 'entregado', label: 'Entregado', desc: '¡Recibido! Listo para cocinar' },
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  order
}) => {
  const { advanceOrderStatus, cancelOrder, showToast } = useApp();

  if (!isOpen || !order) return null;

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'cancelado';
  const isDelivered = order.status === 'entregado';

  const handleAdvance = () => {
    advanceOrderStatus(order.id);
  };

  const handleCancel = () => {
    if (confirm(`¿Estás seguro de que deseas cancelar el pedido ${order.orderNumber}?`)) {
      cancelOrder(order.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-zinc-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-950/20 backdrop-blur-sm flex items-center justify-center">
              <Truck className="w-5 h-5 text-zinc-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight font-display text-zinc-950">
                  Seguimiento del Pedido {order.orderNumber}
                </h3>
                <span className="text-[10px] bg-zinc-950/20 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider text-zinc-950">
                  {order.storeName}
                </span>
              </div>
              <p className="text-xs text-zinc-900/80 flex items-center gap-2 mt-0.5">
                <span>Fecha: {new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} hs</span>
                <span>•</span>
                <span>Entrega estimada: {order.estimatedDeliveryTime}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-zinc-900 hover:text-black p-1 rounded-xl hover:bg-black/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Stepper Card */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Estado del Envío en Tiempo Real
              </span>
              {isCancelled ? (
                <span className="text-xs font-bold text-red-400 bg-red-950/60 border border-red-800 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Pedido Cancelado
                </span>
              ) : isDelivered ? (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Entregado con éxito
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                  <Clock className="w-3.5 h-3.5" /> En Progreso
                </span>
              )}
            </div>

            {/* Stepper line */}
            {!isCancelled && (
              <div className="relative">
                <div className="hidden sm:grid grid-cols-5 gap-2 relative">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;

                    return (
                      <div key={step.key} className="flex flex-col items-center text-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                            isCompleted
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : isCurrent
                              ? 'bg-amber-500 text-zinc-950 ring-4 ring-amber-500/20 shadow-md scale-110'
                              : 'bg-zinc-800 text-zinc-500 border border-zinc-700/60'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                        </div>
                        <span
                          className={`text-xs font-bold leading-tight ${
                            isCurrent ? 'text-amber-400' : isCompleted ? 'text-emerald-400' : 'text-zinc-500'
                          }`}
                        >
                          {step.label}
                        </span>
                        <span className="text-[10px] text-zinc-400 mt-0.5 leading-snug">
                          {step.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Stepper View */}
                <div className="sm:hidden space-y-2.5">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    return (
                      <div
                        key={step.key}
                        className={`flex items-center gap-3 p-2 rounded-xl text-xs ${
                          isCurrent
                            ? 'bg-amber-500/10 border border-amber-500/30 font-bold text-amber-400'
                            : isCompleted
                            ? 'text-emerald-400'
                            : 'text-zinc-500'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? 'bg-amber-500 text-zinc-950'
                              : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        <div>
                          <span>{step.label}</span>
                          <span className="block text-[10px] text-zinc-400 font-normal">{step.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status History log */}
            <div className="mt-5 pt-4 border-t border-zinc-800">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide block mb-2">
                Trazabilidad y Bitácora de Despacho:
              </span>
              <div className="space-y-2 text-xs">
                {order.statusHistory.map((item, index) => (
                  <div key={index} className="flex items-start gap-2.5 text-zinc-300">
                    <span className="font-mono text-[11px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 shrink-0">
                      {item.timestamp}
                    </span>
                    <span className="text-zinc-300 leading-snug">
                      <strong className="text-zinc-100 capitalize font-semibold">
                        {item.status.replace('_', ' ')}:
                      </strong>{' '}
                      {item.note}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live simulation controls */}
            {!isCancelled && !isDelivered && (
              <div className="mt-4 pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-amber-400 font-medium">
                  Prueba interactiva del flujo logístico:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAdvance}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Avanzar Estado del Pedido</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-2.5 py-1.5 bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-300 text-xs font-semibold rounded-xl border border-zinc-800 hover:border-red-800 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Delivery Destination & Store Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Delivery address */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Dirección de Entrega:</span>
                {order.deliveryAddress.alias && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-semibold border border-amber-500/30">
                    {order.deliveryAddress.alias}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-200 font-semibold">
                {order.deliveryAddress.street} {order.deliveryAddress.number}
                {order.deliveryAddress.apartment && ` (${order.deliveryAddress.apartment})`}
              </p>
              <p className="text-xs text-zinc-400">
                {order.deliveryAddress.city}, {order.deliveryAddress.province} — CP {order.deliveryAddress.postalCode}
              </p>
              {order.deliveryAddress.notes && (
                <p className="text-[11px] text-zinc-400 italic bg-zinc-900 p-2 rounded-lg border border-zinc-800">
                  Nota: "{order.deliveryAddress.notes}"
                </p>
              )}
            </div>

            {/* Store & Carrier Card */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                <Store className="w-4 h-4 text-amber-400" />
                <span>Tienda Despachante:</span>
              </div>
              <p className="text-xs text-zinc-100 font-bold">
                {order.storeName}
              </p>
              <p className="text-xs text-zinc-400 leading-snug">
                Preparado con stock fresco y trazabilidad directa por e-commerce asociado.
              </p>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Garantía de frescura y control térmico</span>
              </div>
            </div>
          </div>

          {/* Itemized Ingredients List */}
          <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950">
            <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-zinc-100">
                  Ingredientes del Pedido ({order.items.length})
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">
                Subtotal: {formatARS(order.subtotalARS)}
              </span>
            </div>

            <div className="divide-y divide-zinc-800/80 max-h-56 overflow-y-auto">
              {order.items.map((item) => (
                <div key={item.id} className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-zinc-900/60">
                  <div className="min-w-0">
                    <div className="font-semibold text-zinc-200 truncate">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      <span>{item.quantity} {item.unit}</span>
                      {item.recipeTitle && <span> • Para: {item.recipeTitle}</span>}
                      {item.substituteUsed && (
                        <span className="text-amber-400 ml-1">
                          (Sustituto: {item.substituteUsed})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-zinc-100 font-mono">
                      {formatARS(item.subtotalARS || (item.priceARS * item.quantity))}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      {formatARS(item.priceARS)} c/u
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown (All in $ ARS) */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Subtotal ingredientes:</span>
              <span className="font-mono text-zinc-200">{formatARS(order.subtotalARS)}</span>
            </div>
            {order.pantrySavingsARS > 0 && (
              <div className="flex items-center justify-between text-emerald-400 font-medium">
                <span>Ahorro por despensa propia:</span>
                <span className="font-mono">- {formatARS(order.pantrySavingsARS)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-zinc-400">
              <span>Costo estimado de envío ({order.storeName}):</span>
              <span className="font-mono text-zinc-200">{formatARS(order.deliveryFeeARS)}</span>
            </div>
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-sm font-bold text-zinc-100">
              <span>Total Abonado ($ ARS):</span>
              <span className="font-mono text-amber-400 text-base">
                {formatARS(order.totalARS)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Cerrar Seguimiento
          </button>
        </div>
      </div>
    </div>
  );
};
