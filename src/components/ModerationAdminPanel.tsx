import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ModerationReport, Recipe } from '../types';
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
  Server,
  Edit3,
  FileCheck,
  History,
  MessageSquare,
  X
} from 'lucide-react';

interface ModerationAdminPanelProps {
  onEditRecipe?: (recipe: Recipe) => void;
}

export const ModerationAdminPanel: React.FC<ModerationAdminPanelProps> = ({ onEditRecipe }) => {
  const {
    reports,
    resolveReport,
    submitReport,
    currentUser,
    switchUserRole,
    selectSpecificUser,
    recipes,
    reviewRecipeApproval,
    allUsers,
    showToast
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<'pending' | 'resolved' | 'dismissed' | 'all'>('pending');
  const [activeTab, setActiveTab] = useState<'revisión_recetas' | 'denuncias' | 'politicas' | 'seeder'>('revisión_recetas');
  const [approvalFilter, setApprovalFilter] = useState<'todos' | 'pending' | 'approved' | 'rejected'>('pending');
  
  // Rejection note modal state
  const [rejectNoteModal, setRejectNoteModal] = useState<{ recipeId: string; title: string } | null>(null);
  const [rejectNoteText, setRejectNoteText] = useState('');

  // Expanded audit history state
  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);

  const isAdminOrEditor = currentUser?.role === 'admin' || currentUser?.role === 'editor';

  // Fallback arrays
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

  // Recipe revision counts
  const recipesPendingCount = recipes.filter((r) => (r.approvalStatus || 'pending') === 'pending').length;
  const recipesApprovedCount = recipes.filter((r) => r.approvalStatus === 'approved').length;
  const recipesRejectedCount = recipes.filter((r) => r.approvalStatus === 'rejected').length;

  const filteredRevisionRecipes = recipes.filter((r) => {
    const status = r.approvalStatus || 'pending';
    if (approvalFilter === 'todos') return true;
    return status === approvalFilter;
  });

  const getReasonBadge = (reason: ModerationReport['reason']) => {
    switch (reason) {
      case 'inapropiado':
        return { label: 'Inapropiado', color: 'bg-red-950/80 text-red-300 border-red-800' };
      case 'spam':
        return { label: 'Spam / Publicidad', color: 'bg-yellow-950/80 text-yellow-300 border-yellow-800' };
      case 'plagio':
        return { label: 'Plagio / Copyright', color: 'bg-purple-950/80 text-purple-300 border-purple-800' };
      case 'peligro_alimentario':
        return { label: 'Peligro Alimentario', color: 'bg-orange-950/80 text-orange-300 border-orange-800' };
      case 'acoso':
        return { label: 'Acoso o Agresión', color: 'bg-rose-950/80 text-rose-300 border-rose-800' };
      default:
        return { label: 'Otro motivo', color: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
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

  const handleSwitchToEditor = () => {
    const editorUser = allUsers.find((u) => u.role === 'editor') || allUsers.find((u) => u.username === 'lauraeditora');
    if (editorUser) {
      selectSpecificUser(editorUser.id);
    } else {
      switchUserRole('editor');
    }
    showToast('Rol actualizado a Editor de Contenidos.');
  };

  const handleConfirmRejection = () => {
    if (!rejectNoteModal) return;
    reviewRecipeApproval(rejectNoteModal.recipeId, 'rejected', rejectNoteText.trim() || 'Receta no cumple los estándares editoriales de Gusto.');
    setRejectNoteModal(null);
    setRejectNoteText('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-zinc-900 border border-zinc-800 text-zinc-100 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase mb-2 border border-amber-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Panel de Control Editorial & Moderación</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-display tracking-tight text-zinc-100">
            Revisión de Recetas & Control de Calidad
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Gestión integral de aprobación de recetas por editores, corrección de errores de redacción, auditoría de cambios y gestión de denuncias comunitarias.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {!isAdminOrEditor ? (
            <button
              type="button"
              onClick={handleSwitchToEditor}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Shield className="w-4 h-4" />
              <span>Conmutar a Editor</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreateTestReport}
              className="px-4 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Crear Denuncia de Prueba</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Notice if user is standard user */}
      {!isAdminOrEditor && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-zinc-100">
                Modo de Demostración Editorial
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Para probar las funciones de aprobación, rechazo y edición como editor, conéctate con un perfil que posea el rol de Editor o Administrador.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSwitchToEditor}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer"
          >
            Conmutar a Editor
          </button>
        </div>
      )}

      {/* Stats Bento Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-400 uppercase block">Pendientes de Revisión</span>
          <span className="text-2xl font-bold text-zinc-100">{recipesPendingCount}</span>
          <span className="text-[11px] text-zinc-500 block mt-0.5">Recetas a dictaminar</span>
        </div>

        <div className="bg-zinc-900 p-4 rounded-2xl border border-emerald-900/40 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-400 uppercase block">Aprobadas por Editor</span>
          <span className="text-2xl font-bold text-emerald-400">{recipesApprovedCount}</span>
          <span className="text-[11px] text-zinc-500 block mt-0.5">Visibles en catálogo</span>
        </div>

        <div className="bg-zinc-900 p-4 rounded-2xl border border-rose-900/40 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-400 uppercase block">Desaprobadas</span>
          <span className="text-2xl font-bold text-rose-400">{recipesRejectedCount}</span>
          <span className="text-[11px] text-zinc-500 block mt-0.5">Requieren corrección</span>
        </div>

        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 shadow-2xs">
          <span className="text-[11px] font-bold text-red-400 uppercase block">Denuncias Comunitarias</span>
          <span className="text-2xl font-bold text-zinc-100">{pendingCount}</span>
          <span className="text-[11px] text-zinc-500 block mt-0.5">Pendientes de dictamen</span>
        </div>
      </div>

      {/* Subnavigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('revisión_recetas')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'revisión_recetas'
              ? 'bg-amber-500 text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Revisión de Recetas ({recipesPendingCount} pend.)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('denuncias')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'denuncias'
              ? 'bg-amber-500 text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Denuncias de Usuarios ({safeReports.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('politicas')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'politicas'
              ? 'bg-amber-500 text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Políticas Editoriales</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seeder')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'seeder'
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Panel Seeder Masivo</span>
        </button>
      </div>

      {/* TAB 1: REVISIÓN DE RECETAS (EDITORES) */}
      {activeTab === 'revisión_recetas' && (
        <div className="space-y-4">
          {/* Approval Filter Controls */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Filtrar recetas por estado editorial:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setApprovalFilter('pending')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  approvalFilter === 'pending'
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                Pendientes ({recipesPendingCount})
              </button>
              <button
                type="button"
                onClick={() => setApprovalFilter('approved')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  approvalFilter === 'approved'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                Aprobadas ({recipesApprovedCount})
              </button>
              <button
                type="button"
                onClick={() => setApprovalFilter('rejected')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  approvalFilter === 'rejected'
                    ? 'bg-rose-700 text-white border-rose-600 shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                Desaprobadas ({recipesRejectedCount})
              </button>
              <button
                type="button"
                onClick={() => setApprovalFilter('todos')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  approvalFilter === 'todos'
                    ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-sm'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                Todas ({recipes.length})
              </button>
            </div>
          </div>

          {/* Recipe Revision List */}
          <div className="space-y-4">
            {filteredRevisionRecipes.length === 0 ? (
              <div className="bg-zinc-900 p-12 rounded-3xl text-center border border-zinc-800 space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="font-bold text-zinc-100 text-base">
                  No hay recetas en esta categoría de revisión
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Todas las recetas bajo este filtro han sido procesadas por el equipo de editores.
                </p>
              </div>
            ) : (
              filteredRevisionRecipes.map((recipe) => {
                const approvalStatus = recipe.approvalStatus || 'pending';
                const hasAuditLogs = recipe.moderationHistory && recipe.moderationHistory.length > 0;
                const isAuditExpanded = expandedAuditId === recipe.id;

                return (
                  <div
                    key={recipe.id}
                    className="p-5 sm:p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all space-y-4 shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      {/* Left: Recipe Preview Info */}
                      <div className="flex items-start gap-4">
                        <img
                          src={recipe.coverImage}
                          alt={recipe.title}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-zinc-950 shrink-0 border border-zinc-800"
                        />
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Approval Status Tag */}
                            {approvalStatus === 'pending' && (
                              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Pendiente de Aprobación
                              </span>
                            )}
                            {approvalStatus === 'approved' && (
                              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Aprobada por Editor
                              </span>
                            )}
                            {approvalStatus === 'rejected' && (
                              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                Desaprobada
                              </span>
                            )}

                            <span className="text-[11px] text-zinc-400 uppercase font-semibold">
                              {recipe.category}
                            </span>
                            <span className="text-[11px] text-zinc-500">
                              · {recipe.prepTimeMin + recipe.cookTimeMin} min
                            </span>
                          </div>

                          <h3 className="font-bold text-lg text-zinc-100 line-clamp-1 font-serif-display">
                            {recipe.title}
                          </h3>

                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                            {recipe.description}
                          </p>

                          <div className="flex items-center gap-3 text-xs text-zinc-400 pt-1">
                            <span>Autor: <strong className="text-zinc-200">{recipe.authorName}</strong></span>
                            <span>·</span>
                            <span>{recipe.ingredients.length} ingredientes</span>
                            <span>·</span>
                            <span>{recipe.steps.length} pasos</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                        {/* Edit Recipe Button */}
                        {onEditRecipe && (
                          <button
                            type="button"
                            onClick={() => onEditRecipe(recipe)}
                            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-zinc-700"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Editar como Editor</span>
                          </button>
                        )}

                        {/* Approve Button */}
                        <button
                          type="button"
                          onClick={() => reviewRecipeApproval(recipe.id, 'approved')}
                          disabled={approvalStatus === 'approved'}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                            approvalStatus === 'approved'
                              ? 'bg-emerald-950 text-emerald-500 border border-emerald-800 cursor-default opacity-60'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Aprobar</span>
                        </button>

                        {/* Reject Button */}
                        <button
                          type="button"
                          onClick={() => setRejectNoteModal({ recipeId: recipe.id, title: recipe.title })}
                          disabled={approvalStatus === 'rejected'}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                            approvalStatus === 'rejected'
                              ? 'bg-rose-950 text-rose-500 border border-rose-800 cursor-default opacity-60'
                              : 'bg-rose-700 hover:bg-rose-600 text-white'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Desaprobar</span>
                        </button>
                      </div>
                    </div>

                    {/* Last Editor Intervention Audit Bar */}
                    {recipe.lastEditedBy && (
                      <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <History className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>
                            Última intervención por <strong className="text-amber-400">{recipe.lastEditedBy.editorName}</strong> ({new Date(recipe.lastEditedBy.timestamp).toLocaleString('es-ES')})
                          </span>
                        </div>
                        <div className="text-zinc-400 text-[11px] italic">
                          Acción: <span className="uppercase text-zinc-300 font-semibold">{recipe.lastEditedBy.action}</span>
                          {recipe.lastEditedBy.note && ` — "${recipe.lastEditedBy.note}"`}
                        </div>
                      </div>
                    )}

                    {/* Toggle Audit Trail History Button */}
                    {hasAuditLogs && (
                      <div>
                        <button
                          type="button"
                          onClick={() => setExpandedAuditId(isAuditExpanded ? null : recipe.id)}
                          className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>{isAuditExpanded ? 'Ocultar historial de auditoría' : `Ver historial de intervenciones (${recipe.moderationHistory?.length})`}</span>
                        </button>

                        {isAuditExpanded && (
                          <div className="mt-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 animate-fade-in">
                            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                              Registro Histórico de Auditoría Editorial
                            </h4>
                            <div className="space-y-2">
                              {recipe.moderationHistory?.map((log) => (
                                <div key={log.id} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 flex items-start justify-between gap-3 text-xs">
                                  <div>
                                    <span className="font-bold text-zinc-200">{log.editorName}</span>
                                    <span className="text-zinc-400"> dictaminó </span>
                                    <span className={`font-bold uppercase text-[11px] px-1.5 py-0.5 rounded ${
                                      log.action === 'approved' ? 'bg-emerald-950 text-emerald-400' :
                                      log.action === 'rejected' ? 'bg-rose-950 text-rose-400' : 'bg-amber-950 text-amber-400'
                                    }`}>
                                      {log.action}
                                    </span>
                                    {log.note && (
                                      <p className="text-zinc-400 mt-1 italic">"{log.note}"</p>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-zinc-500 shrink-0">
                                    {new Date(log.timestamp).toLocaleString('es-ES')}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DENUNCIAS DE USUARIOS */}
      {activeTab === 'denuncias' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
            <span className="text-xs font-bold text-zinc-300 uppercase">
              Filtrar por estado de denuncia:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  filterStatus === 'pending'
                    ? 'bg-red-800 text-white border-red-700'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                Pendientes ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('resolved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  filterStatus === 'resolved'
                    ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                Sancionados ({removedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('dismissed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  filterStatus === 'dismissed'
                    ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                Desestimadas ({dismissedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  filterStatus === 'all'
                    ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                Todas ({safeReports.length})
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <div className="bg-zinc-900 p-12 rounded-3xl text-center border border-zinc-800 space-y-3">
                <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="font-bold text-zinc-100 text-base">
                  No hay reportes en esta categoría
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  La plataforma no tiene denuncias pendientes bajo este filtro.
                </p>
              </div>
            ) : (
              filteredReports.map((report) => {
                const badge = getReasonBadge(report.reason);
                const isPending = report.status === 'pending';
                const createdDate = new Date(report.createdAt);

                return (
                  <div
                    key={report.id}
                    className={`p-6 rounded-3xl border transition-all ${
                      isPending
                        ? 'bg-zinc-900 border-red-900/60'
                        : 'bg-zinc-900/80 border-zinc-800 opacity-90'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 uppercase">
                          {report.targetType === 'recipe' ? 'Receta' : 'Perfil de Usuario'}
                        </span>
                        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{createdDate.toLocaleDateString('es-ES')}</span>
                        </span>
                      </div>

                      <div>
                        {report.status === 'resolved_removed' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-950/80 text-red-300 border border-red-800 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-red-400" />
                            Contenido Eliminado
                          </span>
                        )}
                        {report.status === 'dismissed' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-400">
                            Desestimado
                          </span>
                        )}
                        {isPending && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
                            Pendiente
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="text-sm font-bold text-zinc-100">
                        Elemento afectado:{' '}
                        <span className="text-amber-400 font-serif-display font-bold">
                          "{report.targetTitleOrName}"
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-1">
                        <div className="font-semibold text-zinc-200">
                          Motivo reportado por {report.reporterName}:
                        </div>
                        <p className="leading-relaxed text-zinc-400">
                          {report.details}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-zinc-800 flex flex-wrap items-center justify-end gap-3">
                      {isPending ? (
                        <>
                          <button
                            type="button"
                            onClick={() => resolveReport(report.id, 'dismissed')}
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Desestimar Denuncia
                          </button>

                          <button
                            type="button"
                            onClick={() => resolveReport(report.id, 'removed')}
                            className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
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
                        <div className="text-xs text-zinc-500 italic">
                          Acción de auditoría registrada.
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

      {/* TAB 3: POLÍTICAS EDITORIALES */}
      {activeTab === 'politicas' && (
        <div className="bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-800 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-100">
                Políticas de Seguridad y Convivencia Culinaria
              </h3>
              <p className="text-xs text-zinc-400">
                Lineamientos editoriales para autores, editores y comensales en Gusto
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-300 leading-relaxed">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <h4 className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-amber-400">copyright</span>
                Protección contra el Plagio Culinario
              </h4>
              <p className="text-zinc-400">
                Toda receta debe ser de autoría propia o atribuir de forma clara los colaboradores o cocineros involucrados mediante la opción de co-autoría.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <h4 className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-orange-400">warning</span>
                Seguridad e Inocuidad Alimentaria
              </h4>
              <p className="text-zinc-400">
                No se permiten preparaciones que incluyan ingredientes tóxicos o técnicas de cocción con peligro microbiológico sin advertencias claras.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SEEDER */}
      {activeTab === 'seeder' && <AdminSeederPanel />}

      {/* Rejection Reason Modal */}
      {rejectNoteModal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-zinc-100 text-base">
                Motivo de Desaprobación Editorial
              </h3>
              <button
                type="button"
                onClick={() => setRejectNoteModal(null)}
                className="text-zinc-400 hover:text-zinc-100 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Por favor indica la razón por la cual la receta <strong className="text-amber-400">"{rejectNoteModal.title}"</strong> fue desaprobada. Esta nota será enviada al autor.
            </p>

            <textarea
              rows={3}
              value={rejectNoteText}
              onChange={(e) => setRejectNoteText(e.target.value)}
              placeholder="Ej: Faltan detalles en las cantidades de especias y la ortografía del título contiene errores..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectNoteModal(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-xl text-xs font-bold"
              >
                Confirmar Desaprobación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
