import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatARS } from '../utils/currency';
import {
  X,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowRight,
  Crown,
  Zap
} from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, upgradeToPremium, hasPremiumAccess } = useApp();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mercadopago'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form fields
  const [cardNumber, setCardNumber] = useState('4509 8412 9013 7741');
  const [cardHolder, setCardHolder] = useState(currentUser?.name || 'Chef Gusto');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('834');
  const [cardDni, setCardDni] = useState('38.491.205');
  const [installments, setInstallments] = useState('1');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || hasPremiumAccess) return null;

  const monthlyPriceARS = 4990;
  const yearlyPriceARS = 49900;
  const currentPriceARS = billingCycle === 'monthly' ? monthlyPriceARS : yearlyPriceARS;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    setCardExpiry(raw);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (paymentMethod === 'card') {
      const cleanDigits = cardNumber.replace(/\s/g, '');
      if (cleanDigits.length < 15) {
        setErrorMessage('Por favor ingresa un número de tarjeta válido (16 dígitos).');
        return;
      }
      if (!cardHolder.trim()) {
        setErrorMessage('Por favor ingresa el nombre del titular como figura en la tarjeta.');
        return;
      }
      if (cardExpiry.length < 5) {
        setErrorMessage('Ingresa una fecha de vencimiento válida (MM/AA).');
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMessage('Ingresa el código de seguridad (CVV de 3 dígitos).');
        return;
      }
    }

    setIsProcessing(true);

    try {
      await upgradeToPremium({
        method: paymentMethod,
        billingCycle,
        amountARS: currentPriceARS,
        cardLast4: paymentMethod === 'card' ? cardNumber.slice(-4) : 'MP-Direct',
        holderName: cardHolder,
      });
      setIsProcessing(false);
      onClose();
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err?.message || 'Error al procesar el pago. Por favor intenta nuevamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 text-zinc-100">
        
        {/* Header in Gourmet Amber */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Crown className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight font-display">
                  Suscripción Chef Premium
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 tracking-wider">
                  Acceso Total
                </span>
              </div>
              <p className="text-xs text-amber-100/90 mt-0.5">
                Mejora tu cuenta de nivel Básico a Premium para desbloquear todo el potencial gastronómico
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-amber-100 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Plan Benefits Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-amber-500/20 flex flex-col">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Recetas Destacadas
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Acceso irrestricto al panel exclusivo del día, semana y mes curado por chefs profesionales.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-amber-500/20 flex flex-col">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
                <Zap className="w-4 h-4 text-amber-400" />
                Envíos Bonificados
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Descuentos especiales en delivery de ingredientes con supermercados asociados (Coto, Jumbo, Vea).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-amber-500/20 flex flex-col">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
                <Crown className="w-4 h-4 text-amber-400" />
                Subperfiles Familiares
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Gestiona subperfiles ilimitados con restricciones dietéticas (celíacos, keto, diabéticos).
              </p>
            </div>
          </div>

          {/* Billing Cycle Selector */}
          <div className="bg-zinc-950 p-1.5 rounded-2xl flex items-center border border-zinc-800">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                billingCycle === 'monthly'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Mensual: {formatARS(monthlyPriceARS)} / mes</span>
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-amber-500 text-zinc-950 shadow-sm font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Anual: {formatARS(yearlyPriceARS)} / año</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-md font-extrabold">
                -17% OFF
              </span>
            </button>
          </div>

          {/* Payment Method Tabs */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-2">
              Seleccionar Método de Pago (Moneda local $ ARS):
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  paymentMethod === 'card'
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                    : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-800/60'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${paymentMethod === 'card' ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-100">Tarjeta de Débito / Crédito</div>
                  <div className="text-[10px] text-zinc-400">Visa, Mastercard, Cabal</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('mercadopago')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  paymentMethod === 'mercadopago'
                    ? 'border-sky-500 bg-sky-500/10 ring-2 ring-sky-500/30'
                    : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-800/60'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${paymentMethod === 'mercadopago' ? 'bg-sky-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
                  <span className="font-black text-xs">MP</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-100">Mercado Pago</div>
                  <div className="text-[10px] text-zinc-400">Dinero en cuenta o Débito</div>
                </div>
              </button>
            </div>
          </div>

          {/* Payment Details Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {errorMessage && (
              <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300">
                {errorMessage}
              </div>
            )}

            {paymentMethod === 'card' ? (
              <div className="space-y-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                    Número de Tarjeta
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="4509 0000 0000 0000"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full pl-9 pr-3 py-2 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                      Nombre y Apellido (Titular)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="JUAN PÉREZ"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-zinc-900 rounded-xl border border-zinc-800 text-xs uppercase text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                      DNI del Titular
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="35.123.456"
                      value={cardDni}
                      onChange={(e) => setCardDni(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 rounded-xl border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                      Vencimiento
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MM/AA"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      className="w-full px-3 py-2 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-mono text-center text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                      Código CVV
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="123"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-mono text-center text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                      Cuotas
                    </label>
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(e.target.value)}
                      className="w-full px-2.5 py-2 bg-zinc-900 rounded-xl border border-zinc-800 text-xs text-zinc-100 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:outline-hidden"
                    >
                      <option value="1">1 pago sin interés</option>
                      <option value="3">3 cuotas fijas</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-sky-950/40 rounded-2xl border border-sky-800 text-xs text-sky-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sky-100">
                  <Lock className="w-4 h-4 text-sky-400" />
                  <span>Pago Seguro con Mercado Pago</span>
                </div>
                <p className="text-[11px] text-sky-300">
                  Se debitará de tu dinero en cuenta o tarjeta predeterminada vinculada a Mercado Pago por un total de <strong>{formatARS(currentPriceARS)}</strong>.
                </p>
                <div className="p-2.5 bg-zinc-900 rounded-xl border border-sky-800/60 flex items-center justify-between">
                  <span className="text-zinc-400">Usuario pagador:</span>
                  <span className="font-semibold text-zinc-100">{currentUser?.email || 'usuario@gusto.app'}</span>
                </div>
              </div>
            )}

            {/* Price Summary Breakdown */}
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-zinc-400">Total a abonar en $ ARS:</span>
                <div className="text-lg font-extrabold text-amber-400 font-display">
                  {formatARS(currentPriceARS)}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Encriptación Bancaria SSL 256-bit</span>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 text-xs sm:text-sm"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>Validando y Mejorando Cuenta...</span>
                </>
              ) : (
                <>
                  <span>Confirmar Suscripción y Subir a Chef Premium</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Cancellation Policy Footer */}
          <p className="text-[10px] text-center text-zinc-500">
            Sin permanencia mínima. Puedes cancelar o gestionar tu suscripción en cualquier momento desde los ajustes de tu perfil. Todos los precios están expresados en Pesos Argentinos ($ ARS) e incluyen IVA.
          </p>
        </div>
      </div>
    </div>
  );
};
