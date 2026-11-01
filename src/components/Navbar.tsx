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
        return { label: 'Admin', color: 'bg-red-100 text-red-800' };
      case 'editor':
        return { label: 'Editor', color: 'bg-purple-100 text-purple-800' };
      case 'premium':
        return { label: 'Premium', color: 'bg-amber-100 text-amber-900' };
      default:
        return { label: 'Usuario', color: 'bg-stone-100 text-stone-700' };
    }
  };

  const roleBadge = currentUser ? getRoleBadge(currentUser.role) : null;

  return (
    <header className="sticky top-0 left-0 w-full z-50">
      <nav className="bg-[#E09F3E] text-white shadow-[0_4px_20px_-2px_rgba(197,130,38,0.25)]">
        <div className="h-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-6 lg:gap-8">
            <button
              onClick={() => setActiveView('explorar')}
              className="flex items-center gap-2 cursor-pointer focus:outline-none"
              type="button"
            >
              <span
                className="material-symbols-outlined text-[28px] text-white"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                room_service
              </span>
              <span className="font-display text-2xl font-bold tracking-tight text-white leading-none">
                Gusto
              </span>
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1.5">
              <button
                onClick={() => setActiveView('explorar')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                  activeView === 'explorar'
                    ? 'bg-white text-[#5A3900] shadow-[0_2px_8px_rgba(0,0,0,0.08)] font-bold'
                    : 'text-white hover:bg-white/20'
                }`}
                type="button"
              >
                Explorar
              </button>

              <button
                onClick={() => setActiveView('destacadas')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                  activeView === 'destacadas'
                    ? 'bg-white text-[#5A3900] shadow-[0_2px_8px_rgba(0,0,0,0.08)] font-bold'
                    : 'text-white hover:bg-white/20'
                }`}
                type="button"
              >
                Destacadas
              </button>

              <button
                onClick={() => setActiveView('foro')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                  activeView === 'foro'
                    ? 'bg-white text-[#5A3900] shadow-[0_2px_8px_rgba(0,0,0,0.08)] font-bold'
                    : 'text-white hover:bg-white/20'
                }`}
                type="button"
              >
                Foro y comunidad
              </button>

              <button
                onClick={() => setActiveView('comparar')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'comparar'
                    ? 'bg-white text-[#5A3900] shadow-[0_2px_8px_rgba(0,0,0,0.08)] font-bold'
                    : 'text-white hover:bg-white/20'
                }`}
                type="button"
              >
                <span>Comparar</span>
                {comparingRecipeIds.length > 0 && (
                  <span
                    className={`min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold flex items-center justify-center ${
                      activeView === 'comparar'
                        ? 'bg-[#E09F3E] text-white'
                        : 'bg-white text-[#5A3900]'
                    }`}
                  >
                    {comparingRecipeIds.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveView('perfil')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                  activeView === 'perfil'
                    ? 'bg-white text-[#5A3900] shadow-[0_2px_8px_rgba(0,0,0,0.08)] font-bold'
                    : 'text-white hover:bg-white/20'
                }`}
                type="button"
              >
                Mi espacio
              </button>

              <button
                onClick={() => setActiveView('moderacion')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'moderacion'
                    ? 'bg-white text-[#5A3900] shadow-[0_2px_8px_rgba(0,0,0,0.08)] font-bold'
                    : 'text-white hover:bg-white/20'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span>Moderación</span>
              </button>
            </div>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* If NOT logged in, show Iniciar Sesión / Registrarse */}
            {!currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-white hover:bg-white/20 transition-all cursor-pointer"
                  type="button"
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-white text-[#835500] hover:bg-[#FFF8F0] shadow-sm transition-all cursor-pointer"
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
                  className="inline-flex items-center gap-1.5 bg-white text-[#835500] font-semibold text-sm px-4 py-2 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:bg-[#FFF8F0] hover:text-[#5A3900] transition-all cursor-pointer"
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
                  className="relative p-2 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
                  {cart.length > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-white text-[#835500] text-[11px] font-bold rounded-full shadow-sm">
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
                    className="relative p-2 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[24px]">notifications</span>
                    {unreadNotifs.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#FF8A84] rounded-full ring-2 ring-[#E09F3E]"></span>
                    )}
                  </button>

                  {/* Notification Popover Dropdown */}
                  {showNotifMenu && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-stone-200 py-3 z-50 text-[#333333]">
                      <div className="px-4 py-2 border-b border-stone-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                          Notificaciones
                        </span>
                        {unreadNotifs.length > 0 && (
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="text-[11px] text-[#835500] hover:underline font-semibold cursor-pointer"
                            type="button"
                          >
                            Marcar todas como leídas
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-xs text-stone-400">
                            No tienes notificaciones por ahora.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => markNotificationAsRead(notif.id)}
                              className={`p-3.5 hover:bg-[#F6F3F2] cursor-pointer transition-colors ${
                                !notif.read ? 'bg-[#FFDDB9]/20' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-stone-900">{notif.title}</span>
                                <span className="text-[10px] text-stone-400">
                                  {new Date(notif.createdAt).toLocaleDateString('es-ES')}
                                </span>
                              </div>
                              <p className="text-xs text-stone-600 leading-snug">{notif.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Upgrade to Premium Button for Basic Users */}
                {currentUser.role === 'usuario' && (
                  <button
                    onClick={onOpenSubscription}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#835500] hover:bg-amber-50 font-bold text-xs shadow-sm transition-all cursor-pointer"
                    type="button"
                    title="Subir a Chef Premium"
                  >
                    <Crown className="w-3.5 h-3.5 text-[#E09F3E]" />
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
                    className="flex items-center gap-1 pl-1 cursor-pointer group"
                    title="Menu de usuario"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover shadow-[0_0_0_2px_rgba(255,255,255,0.6)]"
                    />
                    <span className="material-symbols-outlined text-white text-[20px] transition-transform group-hover:translate-y-0.5">
                      keyboard_arrow_down
                    </span>
                  </div>

                  {/* User Account / Role Switcher Popover */}
                  {showRoleMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-stone-200 p-3 z-50 text-[#333333] space-y-2">
                      <div className="px-3 py-2 border-b border-stone-100">
                        <div className="font-bold text-sm text-stone-900">{currentUser.name}</div>
                        <div className="text-xs text-stone-500">@{currentUser.username} • {currentUser.email}</div>
                        {roleBadge && (
                          <div className="text-[11px] font-medium text-[#835500] mt-1.5 flex items-center justify-between">
                            <span>Rol: <strong>{currentUser.role.toUpperCase()}</strong></span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleBadge.color}`}>
                              {roleBadge.label}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Subscription upgrade CTA if basic user */}
                      {currentUser.role === 'usuario' && (
                        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#835500]">
                            <Crown className="w-3.5 h-3.5 text-[#E09F3E]" />
                            <span>Plan Actual: Nivel Básico</span>
                          </div>
                          <p className="text-[11px] text-stone-600 leading-snug">
                            Sube a Chef Premium ingresando un método de pago ($ ARS) para desbloquear recetas destacadas y beneficios.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              onOpenSubscription();
                              setShowRoleMenu(false);
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#E09F3E] to-[#835500] hover:from-[#d58e2d] hover:to-[#704800] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                          >
                            <Crown className="w-3.5 h-3.5 text-amber-200" />
                            <span>⭐ Subir a Chef Premium</span>
                          </button>
                        </div>
                      )}

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between px-2 text-xs">
                        <button
                          onClick={() => {
                            setActiveView('perfil');
                            setShowRoleMenu(false);
                          }}
                          className="text-[#835500] hover:text-[#5A3900] font-semibold cursor-pointer"
                          type="button"
                        >
                          Mi Perfil
                        </button>
                        <button
                          onClick={() => {
                            logoutUser();
                            setShowRoleMenu(false);
                          }}
                          className="text-[#AB3333] hover:text-[#801318] font-bold flex items-center gap-1 cursor-pointer bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors"
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
        <div className="lg:hidden flex items-center justify-around py-2 px-2 bg-[#D08F2E] text-white text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveView('explorar')}
            className={`px-3 py-1 rounded-full transition-all shrink-0 cursor-pointer ${
              activeView === 'explorar'
                ? 'bg-white text-[#5A3900] shadow-sm font-bold'
                : 'text-white hover:bg-white/20'
            }`}
            type="button"
          >
            Explorar
          </button>
          <button
            onClick={() => setActiveView('destacadas')}
            className={`px-3 py-1 rounded-full transition-all shrink-0 cursor-pointer ${
              activeView === 'destacadas'
                ? 'bg-white text-[#5A3900] shadow-sm font-bold'
                : 'text-white hover:bg-white/20'
            }`}
            type="button"
          >
            Destacadas
          </button>
          <button
            onClick={() => setActiveView('foro')}
            className={`px-3 py-1 rounded-full transition-all shrink-0 cursor-pointer ${
              activeView === 'foro'
                ? 'bg-white text-[#5A3900] shadow-sm font-bold'
                : 'text-white hover:bg-white/20'
            }`}
            type="button"
          >
            Foro
          </button>
          <button
            onClick={() => setActiveView('comparar')}
            className={`px-3 py-1 rounded-full transition-all shrink-0 cursor-pointer ${
              activeView === 'comparar'
                ? 'bg-white text-[#5A3900] shadow-sm font-bold'
                : 'text-white hover:bg-white/20'
            }`}
            type="button"
          >
            Comparar ({comparingRecipeIds.length})
          </button>
          <button
            onClick={() => setActiveView('perfil')}
            className={`px-3 py-1 rounded-full transition-all shrink-0 cursor-pointer ${
              activeView === 'perfil'
                ? 'bg-white text-[#5A3900] shadow-sm font-bold'
                : 'text-white hover:bg-white/20'
            }`}
            type="button"
          >
            Mi espacio
          </button>
          <button
            onClick={() => setActiveView('moderacion')}
            className={`px-3 py-1 rounded-full transition-all shrink-0 cursor-pointer ${
              activeView === 'moderacion'
                ? 'bg-white text-[#5A3900] shadow-sm font-bold'
                : 'text-white hover:bg-white/20'
            }`}
            type="button"
          >
            Moderación
          </button>
        </div>
      </nav>
    </header>
  );
};
