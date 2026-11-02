import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ModerationReport } from '../types';
import { AdminSeederPanel } from './AdminSeederPanel';
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
  Clock,
  RefreshCw,
  PlusCircle,
  Eye,
  Info,
  Shield,
  Server
} from 'lucide-react';

export const ModerationAdminPanel: React.FC = () => {
  const {
    reports,
    resolveReport,
    submitReport,
    currentUser,
    switchUserRole,
    selectSpecificUser,
    recipes,
    allUsers,
    showToast
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<'pending' | 'resolved' | 'dismissed' | 'all'>('pending');
  const [activeTab, setActiveTab] = useState<'denuncias' | 'politicas' | 'seeder'>('denuncias');

  const isAdminOrEditor = currentUser?.role === 'admin' || currentUser?.role === 'editor';

  // Fallback to empty array if undefined
  const safeReports = reports || [];

  const filteredReports = safeReports.filter((r) => {
    if (filterStatus === 'pending') return r.status === 'pending';
    if (filterStatus === 'resolved') return r.status === 'resolved_removed';
    if (filterStatus === 'dismissed') return r.status === 'dismissed';
    return true;
  });

  const pendingCount = safeReports.filter((r) => r.status === 'pending').length;
  const removedCount = safeReports.filter((r) => r.status === 'resolved_removed').length;
  const dismissedCount = safeReports.filter((r) => r.status === 'dismissed').length;

  const getReasonBadge = (reason: ModerationReport['reason']) => {
    switch (reason) {
      case 'inapropiado':
        return { label: 'Inapropiado', color: 'bg-red-100 text-red-800 border-red-200' };
      case 'spam':
        return { label: 'Spam / Publicidad', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'plagio':
        return { label: 'Plagio / Copyright', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'peligro_alimentario':
        return { label: 'Peligro Alimentario', color: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'acoso':
        return { label: 'Acoso o Agresión', color: 'bg-rose-100 text-rose-800 border-rose-200' };
      default:
        return { label: 'Otro motivo', color: 'bg-stone-100 text-stone-800 border-stone-200' };
    }
  };

  const handleCreateTestReport = () => {
    const sampleRecipes = recipes.length > 0 ? recipes : [];
    const targetRecipe = sampleRecipes[0];
    const targetId = targetRecipe ? targetRecipe.id : 'rec-test-' + Date.now();
    const targetTitle = targetRecipe ? targetRecipe.title : 'Receta de prueba sospechosa';

    submitReport(
      'recipe',
      targetId,
      targetTitle,
      'plagio',
      'El usuario indica que la receta fue extraída textualmente de un libro protegido sin atribuir la fuente original.'
    );
    showToast('Denuncia de prueba generada en el panel de moderación.');
    setFilterStatus('pending');
  };

  const handleSwitchToAdmin = () => {
    const adminUser = allUsers.find((u) => u.role === 'admin') || allUsers.find((u) => u.username === 'ignacioadmin');
    if (adminUser) {
      selectSpecificUser(adminUser.id);
    } else {
      switchUserRole('admin');
    }
    showToast('Rol actualizado a Administrador para gestionar sanciones.');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#801318] text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 text-red-200 text-xs font-bold uppercase mb-2 border border-red-700/60">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Centro de Seguridad & Políticas Comunitarias</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-display tracking-tight">
            Panel de Moderación & Denuncias
          </h1>
          <p className="text-red-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Revisión y auditoría de denuncias sobre recetas inapropiadas, plagios o spam para mantener la confianza y calidad de la comunidad gastronómica.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={handleCreateTestReport}
            className="px-4 py-2.5 rounded-2xl bg-white text-[#801318] hover:bg-red-50 text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Crear Denuncia de Prueba</span>
          </button>
        </div>
      </div>

      {/* Role Notice & Switcher if non-admin */}
      {!isAdminOrEditor && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-950">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs sm:text-sm">
                Modo de Visualización de Moderación
              </h4>
              <p className="text-xs text-amber-900 mt-0.5">
                Para ejecutar resoluciones de moderador (eliminar recetas o suspender perfiles), conéctate con privilegios de Administrador.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSwitchToAdmin}
            className="px-4 py-2 bg-[#835500] hover:bg-[#865300] text-white rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-xs"
          >
            Conmutar a Administrador
          </button>
        </div>
      )}

      {/* Stats Bento Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase block">Denuncias Totales</span>
          <span className="text-2xl font-bold text-stone-900">{safeReports.length}</span>
          <span className="text-[11px] text-stone-400 block mt-0.5">Historial acumulado</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-red-200 shadow-2xs">
          <span className="text-[11px] font-bold text-red-600 uppercase block">Pendientes de Acción</span>
          <span className="text-2xl font-bold text-red-700">{pendingCount}</span>
          <span className="text-[11px] text-red-500 block mt-0.5">Requieren revisión</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase block">Contenidos Eliminados</span>
          <span className="text-2xl font-bold text-stone-900">{removedCount}</span>
          <span className="text-[11px] text-emerald-600 block mt-0.5">Sanciones aplicadas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase block">Desestimadas</span>
          <span className="text-2xl font-bold text-stone-900">{dismissedCount}</span>
          <span className="text-[11px] text-stone-400 block mt-0.5">Sin infracción hallada</span>
        </div>
      </div>

      {/* Subnavigation Tabs: Denuncias vs Políticas de Seguridad */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('denuncias')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'denuncias'
              ? 'bg-[#801318] text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Gestión de Denuncias ({safeReports.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('politicas')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'politicas'
              ? 'bg-[#801318] text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Políticas de Seguridad & Convivencia</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seeder')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'seeder'
              ? 'bg-[#801318] text-white shadow-2xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Panel Seeder Masivo (100 Usuarios / 500 Recetas)</span>
        </button>
      </div>

      {/* TAB 3: ADMIN SEEDER PANEL */}
      {activeTab === 'seeder' && <AdminSeederPanel />}

      {/* TAB 1: DENUNCIAS */}
      {activeTab === 'denuncias' && (
        <div className="space-y-4">
          {/* Status Filter Buttons */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
            <span className="text-xs font-bold text-stone-700 uppercase">
              Filtrar por estado:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  filterStatus === 'pending'
                    ? 'bg-red-700 text-white border-red-700 shadow-2xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Pendientes ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('resolved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  filterStatus === 'resolved'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Sancionados ({removedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('dismissed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  filterStatus === 'dismissed'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Desestimadas ({dismissedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Todas ({safeReports.length})
              </button>
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center border border-stone-200 shadow-2xs space-y-3">
                <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-stone-800 text-base">
                  No hay reportes en esta categoría
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  La plataforma no tiene denuncias pendientes bajo este filtro. Si deseas verificar el flujo de resolución, puedes generar una denuncia de prueba.
                </p>
                <button
                  type="button"
                  onClick={handleCreateTestReport}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Generar denuncia de prueba
                </button>
              </div>
            ) : (
              filteredReports.map((report) => {
                const badge = getReasonBadge(report.reason);
                const isPending = report.status === 'pending';
                const createdDate = new Date(report.createdAt);
                const formattedDate = createdDate.toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                }) + ' a las ' + createdDate.toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={report.id}
                    className={`p-6 rounded-3xl border transition-all ${
                      isPending
                        ? 'bg-white border-red-200 shadow-sm'
                        : 'bg-stone-50/80 border-stone-200 opacity-90'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 uppercase">
                          {report.targetType === 'recipe' ? 'Receta' : 'Perfil de Usuario'}
                        </span>
                        <span className="text-[11px] text-stone-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>Reportado el {formattedDate}</span>
                        </span>
                      </div>

                      <div>
                        {report.status === 'resolved_removed' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-red-700" />
                            Contenido Eliminado
                          </span>
                        )}
                        {report.status === 'dismissed' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-200 text-stone-700">
                            Desestimado
                          </span>
                        )}
                        {isPending && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            Pendiente de Dictamen
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="text-sm font-bold text-stone-900">
                        Elemento afectado:{' '}
                        <span className="text-red-700 font-serif-display font-bold">
                          "{report.targetTitleOrName}"
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/90 text-xs text-stone-700 space-y-1">
                        <div className="font-semibold text-stone-800">
                          Motivo reportado por {report.reporterName}:
                        </div>
                        <p className="leading-relaxed text-stone-600">
                          {report.details}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-4 mt-4 border-t border-stone-100 flex flex-wrap items-center justify-end gap-3">
                      {isPending ? (
                        <>
                          <button
                            type="button"
                            onClick={() => resolveReport(report.id, 'dismissed')}
                            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Desestimar Denuncia
                          </button>

                          <button
                            type="button"
                            onClick={() => resolveReport(report.id, 'removed')}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>
                              {report.targetType === 'recipe'
                                ? 'Eliminar Receta de la Plataforma'
                                : 'Suspender Perfil de Usuario'}
                            </span>
                          </button>
                        </>
                      ) : (
                        <div className="text-xs text-stone-400 italic">
                          Acción de auditoría registrada en el historial.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: POLÍTICAS DE SEGURIDAD */}
      {activeTab === 'politicas' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-stone-200">
            <div className="w-10 h-10 rounded-2xl bg-[#ffddb9] flex items-center justify-center text-[#835500]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-900">
                Políticas de Seguridad y Convivencia Culinaria
              </h3>
              <p className="text-xs text-stone-500">
                Lineamientos editoriales para autores, colaboradores y comensales en Gusto
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-700 leading-relaxed">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-amber-700">copyright</span>
                Protección contra el Plagio Culinario
              </h4>
              <p>
                Toda receta debe ser de autoría propia o atribuir de forma clara los colaboradores o cocineros involucrados mediante la opción de co-autoría. Está prohibida la copia textual sin autorización.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-orange-700">warning</span>
                Seguridad e Inocuidad Alimentaria
              </h4>
              <p>
                No se permiten preparaciones que incluyan ingredientes tóxicos, temperaturas de cocción comprobadamente perjudiciales o técnicas con riesgo microbiológico sin advertencia explícita.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-rose-700">block</span>
                Cero Spam y Promoción Engañosa
              </h4>
              <p>
                Las recetas no pueden utilizarse como vehículo publicitario de suplementos milagrosos, venta de productos no verificados o enlaces externos maliciosos en descripciones o comentarios.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-emerald-700">handshake</span>
                Respeto en Foros y Comentarios
              </h4>
              <p>
                La comunidad promueve la retroalimentación constructiva. Las críticas destructivas, discursos ofensivos o acoso a otros creadores serán motivo de suspensión inmediata del perfil.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
