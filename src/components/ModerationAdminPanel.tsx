import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ModerationReport } from '../types';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  UserX,
  Trash2,
  Check,
  ShieldCheck,
  Clock
} from 'lucide-react';

export const ModerationAdminPanel: React.FC = () => {
  const { reports, resolveReport, currentUser } = useApp();
  const [filterStatus, setFilterStatus] = useState<'pending' | 'resolved' | 'all'>('pending');

  const filteredReports = reports.filter((r) => {
    if (filterStatus === 'pending') return r.status === 'pending';
    if (filterStatus === 'resolved') return r.status !== 'pending';
    return true;
  });

  const getReasonBadge = (reason: ModerationReport['reason']) => {
    switch (reason) {
      case 'inapropiado': return { label: 'Inapropiado', color: 'bg-red-100 text-red-800 border-red-200' };
      case 'spam': return { label: 'Spam / Publicidad', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'plagio': return { label: 'Plagio / Copyright', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'peligro_alimentario': return { label: 'Peligro Alimentario', color: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'acoso': return { label: 'Acoso', color: 'bg-rose-100 text-rose-800 border-rose-200' };
      default: return { label: 'Otro', color: 'bg-stone-100 text-stone-800 border-stone-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-red-900 text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-800/80 text-red-200 text-xs font-bold uppercase mb-2 border border-red-700">
            <ShieldAlert className="w-3.5 h-3.5" />
            Centro de Seguridad & Políticas Comunitarias
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-display">
            Panel de Moderación (RF-11 / RF-20)
          </h2>
          <p className="text-red-200 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            Revisión y auditoría de denuncias de recetas inapropiadas, plagios, y reportes de conductas en perfiles para garantizar la seguridad de la comunidad.
          </p>
        </div>

        <div className="px-4 py-2 bg-red-950/60 rounded-2xl border border-red-800 text-xs text-red-200">
          <span>Administrador: <strong>{currentUser.name}</strong></span>
        </div>
      </div>

      {/* Filter status */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-700 uppercase">Estado de Denuncias:</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              filterStatus === 'pending'
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-stone-50 text-stone-700 border-stone-200'
            }`}
          >
            Pendientes ({reports.filter((r) => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('resolved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              filterStatus === 'resolved'
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-stone-50 text-stone-700 border-stone-200'
            }`}
          >
            Resueltos
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              filterStatus === 'all'
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-stone-50 text-stone-700 border-stone-200'
            }`}
          >
            Todos ({reports.length})
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-stone-200 text-stone-500 text-xs sm:text-sm">
            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            No hay reportes pendientes en este momento. La plataforma se encuentra libre de incidencias.
          </div>
        ) : (
          filteredReports.map((report) => {
            const badge = getReasonBadge(report.reason);
            const isPending = report.status === 'pending';

            return (
              <div
                key={report.id}
                className={`p-6 rounded-3xl border transition-all ${
                  isPending ? 'bg-white border-red-200 shadow-sm' : 'bg-stone-50/70 border-stone-200 opacity-80'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 uppercase">
                      {report.targetType === 'recipe' ? 'Receta' : 'Perfil de Usuario'}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      Reportado el {new Date(report.createdAt).toLocaleDateString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>

                  <div>
                    {report.status === 'resolved_removed' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                        Resuelto: Contenido Eliminado
                      </span>
                    )}
                    {report.status === 'dismissed' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-200 text-stone-700">
                        Desestimado
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-bold text-stone-900">
                    Elemento afectado: <span className="text-red-700">"{report.targetTitleOrName}"</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200/80 leading-relaxed">
                    <strong>Motivo del denunciante ({report.reporterName}):</strong> {report.details}
                  </p>
                </div>

                {isPending && (
                  <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                    <button
                      onClick={() => resolveReport(report.id, 'dismissed')}
                      className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      Desestimar Reporte
                    </button>

                    <button
                      onClick={() => resolveReport(report.id, 'removed')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {report.targetType === 'recipe' ? 'Eliminar Receta de la Plataforma' : 'Suspender Perfil de Usuario'}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
