import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ModerationReport } from '../types';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'recipe' | 'profile';
  targetId: string;
  targetTitle: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}) => {
  const { submitReport } = useApp();
  const [reason, setReason] = useState<ModerationReport['reason']>('inapropiado');
  const [details, setDetails] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport(targetType, targetId, targetTitle, reason, details);
    setDetails('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-red-700">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-semibold text-stone-900">
              {targetType === 'recipe' ? 'Denunciar Receta' : 'Denunciar Perfil de Usuario'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-red-100/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-sm">
            <span className="text-stone-500 font-medium">Elemento a reportar: </span>
            <span className="font-semibold text-stone-800">{targetTitle}</span>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">
              Motivo de la denuncia:
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as ModerationReport['reason'])}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-800 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            >
              <option value="inapropiado">Contenido ofensivo o inapropiado</option>
              <option value="spam">Spam, publicidad engañosa o enlaces sospechosos</option>
              <option value="plagio">Plagio o violación de derechos de autor</option>
              <option value="peligro_alimentario">Riesgo sanitario o ingredientes tóxicos</option>
              <option value="acoso">Hostigamiento o conducta indebida</option>
              <option value="otro">Otro motivo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-1.5">
              Detalles adicionales (mínimo 10 caracteres):
            </label>
            <textarea
              rows={3}
              required
              minLength={10}
              placeholder="Explica a los moderadores por qué este contenido incumple las normas de la comunidad..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-800 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden resize-none"
            />
          </div>

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <p>
              Tu denuncia será examinada por el equipo de moderadores y administradores (RF-11 / RF-20). Los reportes falsos reiterados pueden conllevar sanciones.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors"
            >
              Enviar Denuncia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
