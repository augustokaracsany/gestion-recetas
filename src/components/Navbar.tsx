import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  ChefHat,
  Search,
  Plus,
  Scale,
  ShoppingCart,
  Bell,
  User,
  Shield,
  MessageSquare,
  Sparkles,
  Trophy,
  LogOut,
  ChevronDown,
  Check,
  FolderHeart,
  Crown,
  ShieldAlert
} from 'lucide-react';

interface NavbarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onOpenCreateRecipe: () => void;
  onOpenCart: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  onOpenCreateRecipe,
  onOpenCart,
  onOpenAuth,
}) => {
  const {
    currentUser,
    allUsers,
    selectSpecificUser,
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
        return { label: 'Admin', color: 'bg-red-100 text-red-800 border-red-200' };
      case 'editor':
        return { label: 'Editor', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'premium':
        return { label: 'Premium', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: 'Usuario', color: 'bg-stone-100 text-stone-700 border-stone-200' };
    }
  };

  const roleBadge = getRoleBadge(currentUser.role);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo */}
          <div
            onClick={() => setActiveView('explorar')}
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-600/20">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <span className="font-serif-display font-extrabold text-2xl tracking-tight text-stone-900 block leading-none">
                Gusto<span className="text-amber-600">.</span>
              </span>
              <span className="text-[10px] font-semibold text-stone-400 tracking-wider uppercase">
                Gestión de Recetas
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-bold text-stone-600">
            <button
              onClick={() => setActiveView('explorar')}
              className={`px-3 py-2 rounded-xl transition-all ${
                activeView === 'explorar'
                  ? 'bg-amber-50 text-amber-900 font-extrabold'
                  : 'hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              🍲 Explorar
            </button>

            <button
              onClick={() => setActiveView('destacadas')}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                activeView === 'destacadas'
                  ? 'bg-amber-50 text-amber-900 font-extrabold'
                  : 'hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              Destacadas (RF-05)
            </button>

            <button
              onClick={() => setActiveView('foro')}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                activeView === 'foro'
                  ? 'bg-amber-50 text-amber-900 font-extrabold'
                  : 'hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              Foro & Comunidad
            </button>

            <button
              onClick={() => setActiveView('comparar')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                activeView === 'comparar'
                  ? 'bg-sky-50 text-sky-900 font-extrabold'
                  : 'hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-sky-600" />
              Comparar
              {comparingRecipeIds.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {comparingRecipeIds.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('perfil')}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                activeView === 'perfil'
                  ? 'bg-amber-50 text-amber-900 font-extrabold'
                  : 'hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-amber-600" />
              Mi Espacio
            </button>

            {(currentUser.role === 'admin' || currentUser.role === 'editor') && (
              <button
                onClick={() => setActiveView('moderacion')}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  activeView === 'moderacion'
                    ? 'bg-red-50 text-red-900 font-extrabold'
                    : 'hover:bg-red-50 hover:text-red-700 text-stone-500'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                Moderación (RF-11/20)
              </button>
            )}
          </nav>

          {/* Right Action Icons & User Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Create Recipe Button */}
            <button
              onClick={onOpenCreateRecipe}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm transition-all shadow-amber-600/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Receta</span>
            </button>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={onOpenCart}
              title="Carrito de compras de ingredientes (RF-22 / RF-23)"
              className="relative p-2.5 rounded-2xl bg-stone-100 hover:bg-amber-50 text-stone-700 hover:text-amber-800 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Notification Bell (RF-28) */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                title="Notificaciones en tiempo real (RF-28)"
                className="relative p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-stone-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
                      Notificaciones (RF-28)
                    </span>
                    {unreadNotifs.length > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[11px] text-amber-700 hover:underline font-semibold"
                      >
                        Marcar leídas
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
                          className={`p-3.5 hover:bg-stone-50 cursor-pointer transition-colors ${
                            !notif.read ? 'bg-amber-50/50' : ''
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

            {/* User Profile / Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-colors"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-xl object-cover"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-stone-900 leading-tight truncate max-w-[100px]">
                    {currentUser.name}
                  </div>
                  <div className={`text-[10px] font-semibold uppercase px-1 rounded-sm inline-block ${roleBadge.color}`}>
                    {roleBadge.label}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {/* User / Role Switcher Dropdown */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-stone-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-2">
                  <div className="px-3 py-2 border-b border-stone-100">
                    <div className="font-bold text-sm text-stone-900">{currentUser.name}</div>
                    <div className="text-xs text-stone-400">{currentUser.email}</div>
                    <div className="text-[11px] font-medium text-amber-700 mt-1">
                      Rol actual: <strong>{currentUser.role.toUpperCase()}</strong>
                    </div>
                  </div>

                  {/* Switch active persona for testing all functional requirements */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400 px-3 block">
                      Cambiar de Cuenta de Prueba:
                    </span>
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          selectSpecificUser(u.id);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                          u.id === currentUser.id
                            ? 'bg-amber-50 font-bold text-amber-900'
                            : 'hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                          <div className="truncate">
                            <div>{u.name}</div>
                            <div className="text-[10px] text-stone-400 capitalize">{u.role}</div>
                          </div>
                        </div>
                        {u.id === currentUser.id && <Check className="w-4 h-4 text-amber-600" />}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between px-2 text-xs">
                    <button
                      onClick={() => {
                        onOpenAuth('login');
                        setShowRoleMenu(false);
                      }}
                      className="text-stone-600 hover:text-stone-900 font-semibold"
                    >
                      Autenticación
                    </button>
                    <button
                      onClick={() => {
                        logoutUser();
                        setShowRoleMenu(false);
                      }}
                      className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Salir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Submenu Bar */}
      <div className="md:hidden flex items-center justify-around py-2.5 px-2 bg-stone-50 border-t border-stone-200 text-xs font-semibold text-stone-700">
        <button
          onClick={() => setActiveView('explorar')}
          className={`px-2.5 py-1 rounded-lg ${activeView === 'explorar' ? 'bg-amber-600 text-white' : ''}`}
        >
          Explorar
        </button>
        <button
          onClick={() => setActiveView('destacadas')}
          className={`px-2.5 py-1 rounded-lg ${activeView === 'destacadas' ? 'bg-amber-600 text-white' : ''}`}
        >
          Destacadas
        </button>
        <button
          onClick={() => setActiveView('foro')}
          className={`px-2.5 py-1 rounded-lg ${activeView === 'foro' ? 'bg-amber-600 text-white' : ''}`}
        >
          Foros
        </button>
        <button
          onClick={() => setActiveView('comparar')}
          className={`px-2.5 py-1 rounded-lg ${activeView === 'comparar' ? 'bg-sky-600 text-white' : ''}`}
        >
          Comparar ({comparingRecipeIds.length})
        </button>
        <button
          onClick={() => setActiveView('perfil')}
          className={`px-2.5 py-1 rounded-lg ${activeView === 'perfil' ? 'bg-amber-600 text-white' : ''}`}
        >
          Perfil
        </button>
      </div>
    </header>
  );
};
