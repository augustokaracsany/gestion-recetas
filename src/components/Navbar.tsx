import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Crown } from 'lucide-react';

interface NavbarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenCreateRecipe: () => void;
  onOpenCart: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenSubscription: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  onOpenCreateRecipe,
  onOpenCart,
  onOpenAuth,
  onOpenSubscription,
}) => {
  const {
    currentUser,
    hasPremiumAccess,
    hasEditorAccess,
    logoutUser,
    comparingRecipeIds,
    cart,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { label: 'Admin', color: 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold' };
      case 'editor':
        return { label: 'Editor', color: 'bg-purple-950/80 text-purple-300 border border-purple-800/60 font-bold' };
      case 'premium':
        return { label: 'Premium', color: 'bg-amber-950/80 text-amber-300 border border-amber-800/60 font-bold' };
      default:
        return { label: 'Comensal', color: 'bg-zinc-800 text-zinc-300 border border-zinc-700 font-medium' };
    }
  };

  const roleBadge = currentUser ? getRoleBadge(currentUser.role) : null;

  return (
    <header className="sticky top-0 left-0 w-full z-50">
      <nav className="bg-zinc-950/95 backdrop-blur-md text-zinc-100 border-b border-zinc-900 shadow-2xl">
        <div className="h-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-6 lg:gap-8">
            <button
              onClick={() => setActiveView('explorar')}
              className="flex items-center gap-2.5 cursor-pointer focus:outline-none group"
              type="button"
            >
              <span
                className="material-symbols-outlined text-[30px] text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.45)] group-hover:scale-110 transition-transform"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                room_service
              </span>
              <span className="font-display text-2xl font-extrabold tracking-tight text-zinc-100 leading-none">
                Gusto<span className="text-amber-400">.</span>
              </span>
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1.5">
              <button
                onClick={() => setActiveView('explorar')}
                className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeView === 'explorar'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                }`}
                type="button"
              >
                Explorar
              </button>

              <button
                onClick={() => setActiveView('destacadas')}
                className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeView === 'destacadas'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                }`}
                type="button"
              >
                Destacadas
              </button>

              <button
                onClick={() => setActiveView('foro')}
                className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeView === 'foro'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                }`}
                type="button"
              >
                Foro y comunidad
              </button>

              <button
                onClick={() => setActiveView('planificador')}
                className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'planificador'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                }`}
                type="button"
              >
                <span>Plan Semanal</span>
                <Crown className={`w-3.5 h-3.5 ${activeView === 'planificador' ? 'text-zinc-950' : 'text-amber-400'}`} />
              </button>

              <button
                onClick={() => setActiveView('comparar')}
                className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'comparar'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                }`}
                type="button"
              >
                <span>Comparar</span>
                {comparingRecipeIds.length > 0 && (
                  <span
                    className={`min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold flex items-center justify-center ${
                      activeView === 'comparar'
                        ? 'bg-zinc-950 text-amber-400'
                        : 'bg-amber-500 text-zinc-950'
                    }`}
                  >
                    {comparingRecipeIds.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveView('perfil')}
                className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeView === 'perfil'
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                }`}
                type="button"
              >
                Mi perfil
              </button>

              {hasEditorAccess && (
                <button
                  onClick={() => setActiveView('moderacion')}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeView === 'moderacion'
                      ? 'bg-amber-500 text-zinc-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                  }`}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  <span>Moderación</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* If NOT logged in, show Iniciar Sesión / Registrarse */}
            {!currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 transition-all cursor-pointer"
                  type="button"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all cursor-pointer"
                  type="button"
                >
                  Registrarse
                </button>
              </div>
            ) : (
              <>
                {/* Nueva Receta Button */}
                <button
                  onClick={onOpenCreateRecipe}
                  className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer transform hover:-translate-y-0.5"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span className="hidden sm:inline">Nueva receta</span>
                </button>

                {/* Shopping Cart Button */}
                <button
                  onClick={onOpenCart}
                  aria-label="Carrito de compras"
                  title="Carrito de compras"
                  className="relative p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 hover:text-amber-400 transition-all text-zinc-300 cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[22px]">shopping_cart</span>
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-amber-500 text-zinc-950 text-[11px] font-bold rounded-full shadow-sm">
                      {cart.length}
                    </span>
                  )}
                </button>

                {/* Notifications Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifMenu(!showNotifMenu);
                      setShowRoleMenu(false);
                    }}
                    aria-label="Notificaciones"
                    title="Notificaciones"
                    className="relative p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 hover:text-amber-400 transition-all text-zinc-300 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[22px]">notifications</span>
                    {unreadNotifs.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-zinc-950"></span>
                    )}
                  </button>

                  {/* Notification Popover Dropdown */}
                  {showNotifMenu && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 py-3 z-50 text-zinc-200 animate-fade-in">
                      <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-100 uppercase tracking-wide">
                          Notificaciones
                        </span>
                        {unreadNotifs.length > 0 && (
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="text-[11px] text-amber-400 hover:underline font-semibold cursor-pointer"
                            type="button"
                          >
                            Marcar todas como leídas
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800/80">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-zinc-500">
                            No tienes notificaciones por ahora.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => markNotificationAsRead(notif.id)}
                              className={`p-3.5 hover:bg-zinc-800/60 cursor-pointer transition-colors ${
                                !notif.read ? 'bg-amber-500/10' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-zinc-100">{notif.title}</span>
                                <span className="text-[10px] text-zinc-500">
                                  {new Date(notif.createdAt).toLocaleDateString('es-ES')}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-400 leading-snug">{notif.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Upgrade to Premium Button for Basic Users without Premium access */}
                {!hasPremiumAccess && (
                  <button
                    onClick={onOpenSubscription}
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-zinc-950 font-bold text-xs shadow-sm transition-all cursor-pointer"
                    type="button"
                    title="Subir a Chef Premium"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Mejorar a Premium</span>
                  </button>
                )}

                {/* Profile Avatar & Account Menu Trigger */}
                <div className="relative">
                  <div
                    onClick={() => {
                      setShowRoleMenu(!showRoleMenu);
                      setShowNotifMenu(false);
                    }}
                    className="flex items-center gap-1.5 pl-1 cursor-pointer group"
                    title="Menu de usuario"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-9 h-9 rounded-xl object-cover ring-2 ring-zinc-700 group-hover:ring-amber-500 transition-all"
                    />
                    <span className="material-symbols-outlined text-zinc-400 group-hover:text-amber-400 text-[20px] transition-transform group-hover:translate-y-0.5">
                      keyboard_arrow_down
                    </span>
                  </div>

                  {/* User Account / Role Switcher Popover */}
                  {showRoleMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 p-3 z-50 text-zinc-200 space-y-2 animate-fade-in">
                      <div className="px-3 py-2 border-b border-zinc-800">
                        <div className="font-bold text-sm text-zinc-100">{currentUser.name}</div>
                        <div className="text-xs text-zinc-400">@{currentUser.username} • {currentUser.email}</div>
                        {roleBadge && (
                          <div className="text-[11px] font-medium text-amber-400 mt-1.5 flex items-center justify-between">
                            <span>Rango:</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadge.color}`}>
                              {roleBadge.label}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Subscription upgrade CTA only if basic user without premium access */}
                      {!hasPremiumAccess && (
                        <div className="p-3 rounded-xl bg-zinc-950 border border-amber-500/30 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            <span>Plan Actual: Nivel Básico</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-snug">
                            Sube a Chef Premium ingresando un método de pago ($ ARS) para desbloquear recetas destacadas y beneficios.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              onOpenSubscription();
                              setShowRoleMenu(false);
                            }}
                            className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <Crown className="w-3.5 h-3.5" />
                            <span>Subir a Chef Premium</span>
                          </button>
                        </div>
                      )}

                      <div className="pt-2 border-t border-zinc-800 flex items-center justify-between px-2 text-xs">
                        <button
                          onClick={() => {
                            setActiveView('perfil');
                            setShowRoleMenu(false);
                          }}
                          className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                          type="button"
                        >
                          Mi Perfil
                        </button>
                        <button
                          onClick={() => {
                            logoutUser();
                            setShowRoleMenu(false);
                          }}
                          className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer bg-red-950/40 hover:bg-red-950/70 border border-red-900/50 px-2.5 py-1 rounded-lg transition-colors"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">logout</span>
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex flex-wrap items-center justify-center gap-1.5 py-2.5 px-3 bg-zinc-900 border-t border-zinc-800 text-zinc-300 text-xs font-semibold">
          <button
            onClick={() => setActiveView('explorar')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeView === 'explorar'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
            type="button"
          >
            Explorar
          </button>
          <button
            onClick={() => setActiveView('destacadas')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeView === 'destacadas'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
            type="button"
          >
            Destacadas
          </button>
          <button
            onClick={() => setActiveView('foro')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeView === 'foro'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
            type="button"
          >
            Foro
          </button>
          <button
            onClick={() => setActiveView('planificador')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              activeView === 'planificador'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
            type="button"
          >
            <span>Plan Semanal</span>
            <Crown className="w-3 h-3 text-amber-400" />
          </button>
          <button
            onClick={() => setActiveView('comparar')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeView === 'comparar'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
            type="button"
          >
            Comparar ({comparingRecipeIds.length})
          </button>
          <button
            onClick={() => setActiveView('perfil')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              activeView === 'perfil'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
            type="button"
          >
            Mi perfil
          </button>
          {hasEditorAccess && (
            <button
              onClick={() => setActiveView('moderacion')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeView === 'moderacion'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`}
              type="button"
            >
              Moderación
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};
