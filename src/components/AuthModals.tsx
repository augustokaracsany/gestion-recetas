import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, DietaryTag } from '../types';
import {
  X,
  KeyRound,
  Mail,
  User,
  ShieldCheck,
  Sparkles,
  ChefHat,
  CheckCircle2,
  ArrowRight,
  Upload,
  Lock,
  AtSign,
  AlertCircle,
  Clock,
  ExternalLink,
  Compass,
  MapPin,
  Home,
  Building2
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'recovery' | 'new_password';
}

const PRESET_AVATARS = [
  { label: 'Chef Clásico', url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=160&auto=format&fit=crop&q=80' },
  { label: 'Chef Saludable', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80' },
  { label: 'Aficionada Repostera', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80' },
  { label: 'Chef Gourmet', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80' },
];

const DIETARY_OPTIONS: { id: DietaryTag; label: string }[] = [
  { id: 'celiaco', label: 'Sin TACC / Celíaco' },
  { id: 'vegano', label: 'Vegano' },
  { id: 'vegetariano', label: 'Vegetariano' },
  { id: 'diabetico', label: 'Diabético' },
  { id: 'keto', label: 'Keto' },
  { id: 'sin_lactosa', label: 'Sin Lactosa' },
  { id: 'bajo_sodio', label: 'Bajo en Sodio' },
];

export const AuthModals: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const {
    allUsers,
    currentUser,
    selectSpecificUser,
    loginUser,
    registerUser,
    loginWithProvider,
    resetSimulation,
    requestPasswordReset,
    resetPasswordWithToken,
    clearResetSimulation,
    showToast
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'recovery' | 'new_password'>(initialMode);
  
  // Sync initialMode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('password123');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPassConfirm, setRegPassConfirm] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('usuario');
  const [regAvatar, setRegAvatar] = useState(PRESET_AVATARS[0].url);
  const [regBio, setRegBio] = useState('');
  const [regDietary, setRegDietary] = useState<DietaryTag[]>([]);
  const [regError, setRegError] = useState('');

  // Address fields for registration
  const [regStreet, setRegStreet] = useState('Av. Santa Fe');
  const [regNumber, setRegNumber] = useState('3420');
  const [regApartment, setRegApartment] = useState('4B');
  const [regCity, setRegCity] = useState('Palermo, CABA');
  const [regProvince, setRegProvince] = useState('CABA');
  const [regPostalCode, setRegPostalCode] = useState('1414');
  const [regAddressNotes, setRegAddressNotes] = useState('Timbre 4B, frente al parque');

  // Password reset state
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    if (resetSimulation?.token) {
      setTokenInput(resetSimulation.token);
    }
  }, [resetSimulation]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim()) {
      setLoginError('Por favor introduce tu correo electrónico.');
      return;
    }
    const res = await loginUser(loginEmail, loginPass);
    if (res.success) {
      onClose();
    } else {
      setLoginError(res.message);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim()) {
      setRegError('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!regUsername.trim()) {
      setRegError('Por favor elige un alias o nombre de usuario (ej: @chef_pablo).');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('Por favor ingresa un correo electrónico.');
      return;
    }
    if (regPass.length < 6) {
      setRegError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (regPass !== regPassConfirm) {
      setRegError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }
    if (!regStreet.trim() || !regNumber.trim() || !regPostalCode.trim()) {
      setRegError('Por favor completa la dirección (Calle, Número y Código Postal) para calcular stock y envíos.');
      return;
    }

    const res = await registerUser({
      name: regName,
      username: regUsername,
      email: regEmail,
      password: regPass,
      role: regRole,
      avatar: regAvatar,
      bio: regBio,
      dietaryPreferences: regDietary,
      address: {
        street: regStreet.trim(),
        number: regNumber.trim(),
        apartment: regApartment.trim() || undefined,
        city: regCity.trim() || 'CABA',
        province: regProvince.trim() || 'Buenos Aires',
        postalCode: regPostalCode.trim() || '1414',
        notes: regAddressNotes.trim() || undefined,
      }
    });

    if (res.success) {
      onClose();
    } else {
      setRegError(res.message);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setRegAvatar(reader.result);
          showToast('Foto de perfil cargada desde tu equipo.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleDietTag = (tag: DietaryTag) => {
    setRegDietary(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    if (!recoveryEmail.trim()) {
      setResetError('Por favor ingresa el correo registrado.');
      return;
    }
    const res = requestPasswordReset(recoveryEmail);
    if (!res.success) {
      setResetError(res.message);
    }
  };

  const handleNewPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    const targetTokenOrEmail = tokenInput.trim() || (resetSimulation ? resetSimulation.token : recoveryEmail.trim());
    if (!targetTokenOrEmail) {
      setResetError('Por favor ingresa el token o correo electrónico asociado.');
      return;
    }
    if (newPassword.length < 6) {
      setResetError('La contraseña nueva debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setResetError('Las contraseñas no coinciden.');
      return;
    }

    const res = resetPasswordWithToken(targetTokenOrEmail, newPassword);
    if (res.success) {
      onClose();
    } else {
      setResetError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#E09F3E] to-[#835500] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight font-display">
                {mode === 'login' && 'Iniciar Sesión en Gusto'}
                {mode === 'register' && 'Crear Nueva Cuenta'}
                {mode === 'recovery' && 'Recuperar Contraseña'}
                {mode === 'new_password' && 'Establecer Nueva Contraseña'}
              </h3>
              <p className="text-[11px] text-amber-100/90">
                Gestión Integral de Recetas & Comunidad Gastronómica
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

        {/* Tab Toggle Navigation */}
        <div className="flex border-b border-stone-200 bg-[#F6F3F2] px-6 pt-3 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLoginError('');
            }}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              mode === 'login'
                ? 'border-[#E09F3E] text-[#835500]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setRegError('');
            }}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              mode === 'register'
                ? 'border-[#E09F3E] text-[#835500]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Registrarse
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('recovery');
              setResetError('');
            }}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              mode === 'recovery' || mode === 'new_password'
                ? 'border-[#E09F3E] text-[#835500]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Recuperar Clave
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* EXTERNAL AUTH PROVIDERS (Google & Apple ID) */}
          {(mode === 'login' || mode === 'register') && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={async () => {
                  await loginWithProvider('google');
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-stone-300 rounded-xl bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-xs transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continuar con Google</span>
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-stone-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-stone-400 font-semibold absolute">
                  o con tu correo
                </span>
              </div>
            </div>
          )}

          {/* MODE 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="ej. mateo.rossi@gusto.app"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#E09F3E] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-700">Contraseña</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('recovery');
                      setResetError('');
                    }}
                    className="text-xs font-semibold text-[#835500] hover:underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#E09F3E] focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#E09F3E] hover:bg-[#835500] text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <span>Ingresar a Gusto</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-xs text-stone-600 pt-2 border-t border-stone-100">
                ¿No tienes cuenta aún?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-[#835500] hover:underline cursor-pointer"
                >
                  Crear una nueva cuenta
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              {regError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Nombre Completo</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Sofía Martínez"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#E09F3E] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Alias / Username</label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="sofia_chef"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#E09F3E] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="sofia@ejemplo.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#E09F3E] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Contraseña</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#E09F3E] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Confirmar Contraseña</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      placeholder="Repetir contraseña"
                      value={regPassConfirm}
                      onChange={(e) => setRegPassConfirm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#E09F3E] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-2.5">
                <ChefHat className="w-5 h-5 text-[#835500] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-stone-800 flex items-center gap-2">
                    <span>Nivel de Cuenta: Básico</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-stone-200 text-stone-700 rounded-full">
                      Gratuito
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
                    Tu cuenta se creará en el nivel básico. Para subir a <strong>Chef Premium</strong> podrás ingresar tus datos de pago en cualquier momento desde tu perfil o barra superior.
                  </p>
                </div>
              </div>

              {/* Photo Upload & Presets */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <label className="block text-xs font-bold text-stone-700">Foto de Perfil</label>
                <div className="flex items-center gap-3">
                  <img
                    src={regAvatar}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[#E09F3E]"
                  />
                  <div className="flex-1 space-y-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-[#835500]" />
                      <span>Subir foto de mi equipo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                    <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                      {PRESET_AVATARS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setRegAvatar(p.url)}
                          className={`w-7 h-7 rounded-full overflow-hidden border-2 cursor-pointer transition-transform ${
                            regAvatar === p.url ? 'border-[#E09F3E] scale-110' : 'border-transparent opacity-70'
                          }`}
                          title={p.label}
                        >
                          <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Argentine Delivery Address Section */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#E09F3E]" />
                    <span>Dirección Principal de Entrega</span>
                  </label>
                  <span className="text-[10px] font-medium text-[#835500] bg-amber-100 px-2 py-0.5 rounded-full">
                    Obligatoria para envíos
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Configura tu domicilio para calcular stock real en supermercados cercanos y tarifas de entrega en pesos argentinos ($ ARS).
                </p>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] font-bold text-stone-500">Ejemplos:</span>
                  {[
                    { label: 'Palermo, CABA', street: 'Av. Santa Fe', number: '3420', apt: '4B', city: 'Palermo, CABA', prov: 'CABA', cp: '1414' },
                    { label: 'Belgrano, CABA', street: 'Av. Cabildo', number: '2150', apt: '8A', city: 'Belgrano, CABA', prov: 'CABA', cp: '1428' },
                    { label: 'Córdoba Centro', street: 'Bv. Chacabuco', number: '620', apt: '2D', city: 'Córdoba Capital', prov: 'Córdoba', cp: '5000' },
                    { label: 'Rosario Centro', street: 'Bv. Oroño', number: '1120', apt: '', city: 'Rosario', prov: 'Santa Fe', cp: '2000' },
                  ].map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setRegStreet(p.street);
                        setRegNumber(p.number);
                        setRegApartment(p.apt);
                        setRegCity(p.city);
                        setRegProvince(p.prov);
                        setRegPostalCode(p.cp);
                      }}
                      className="text-[10px] bg-white hover:bg-amber-100 text-[#835500] font-semibold px-2 py-0.5 rounded-lg border border-amber-200 transition-colors cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-8">
                    <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Calle / Avenida</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Av. Santa Fe"
                      value={regStreet}
                      onChange={(e) => setRegStreet(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-[#E09F3E] focus:outline-hidden"
                    />
                  </div>
                  <div className="col-span-4">
                    <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Número</label>
                    <input
                      type="text"
                      required
                      placeholder="3420"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-[#E09F3E] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-4">
                    <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Piso / Depto</label>
                    <input
                      type="text"
                      placeholder="4B (opcional)"
                      value={regApartment}
                      onChange={(e) => setRegApartment(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-[#E09F3E] focus:outline-hidden"
                    />
                  </div>
                  <div className="col-span-5">
                    <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Ciudad / Barrio</label>
                    <input
                      type="text"
                      required
                      placeholder="Palermo, CABA"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-[#E09F3E] focus:outline-hidden"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-[11px] font-bold text-stone-700 mb-0.5">C. Postal (CP)</label>
                    <input
                      type="text"
                      required
                      placeholder="1414"
                      value={regPostalCode}
                      onChange={(e) => setRegPostalCode(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-[#E09F3E] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Aclaraciones de entrega (opcional)</label>
                  <input
                    type="text"
                    placeholder="Timbre, piso, entre calles, o dejar en portería"
                    value={regAddressNotes}
                    onChange={(e) => setRegAddressNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-[#E09F3E] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Initial Dietary Preferences */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Preferencias Dietéticas Iniciales:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DIETARY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleDietTag(opt.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                        regDietary.includes(opt.id)
                          ? 'bg-[#835500] text-white shadow-2xs'
                          : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {regDietary.includes(opt.id) ? '✓ ' : '+ '}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#E09F3E] hover:bg-[#835500] text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2 mt-2"
              >
                <span>Completar Registro & Empezar a Cocinar</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center text-xs text-stone-600 pt-2 border-t border-stone-100">
                ¿Ya tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-[#835500] hover:underline cursor-pointer"
                >
                  Inicia sesión aquí
                </button>
              </div>
            </form>
          )}

          {/* MODE 3: PASSWORD RECOVERY SIMULATION */}
          {mode === 'recovery' && (
            <div className="space-y-4">
              {resetSimulation ? (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="font-bold text-sm">¡Enlace seguro generado exitosamente!</span>
                  </div>
                  
                  <p className="text-xs text-emerald-900 leading-relaxed">
                    Hemos generado el enlace de un solo uso para blanquear la contraseña de la cuenta <strong className="font-bold">{resetSimulation.email}</strong> perteneciente a <strong>{resetSimulation.userName}</strong>.
                  </p>

                  {/* Interactive simulated email inbox */}
                  <div className="bg-white p-3.5 rounded-xl border border-emerald-300 shadow-xs space-y-2 text-xs">
                    <div className="flex items-center justify-between text-stone-500 text-[10px] pb-1 border-b border-stone-100">
                      <span>De: <strong>seguridad@gusto.app</strong></span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#E09F3E]" /> Expira a las {resetSimulation.expiresAt}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-stone-800 block text-xs">
                        Restablecimiento de credenciales para Gusto
                      </span>
                      <p className="text-stone-600 text-[11px] mt-0.5">
                        Token temporal: <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-800 font-mono">{resetSimulation.token}</code>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMode('new_password');
                        setResetError('');
                      }}
                      className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Hacer clic en el enlace y cambiar contraseña ahora</span>
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        clearResetSimulation();
                        setRecoveryEmail('');
                      }}
                      className="text-stone-500 hover:text-stone-800 underline cursor-pointer"
                    >
                      Solicitar para otro correo
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-[#835500] font-bold hover:underline cursor-pointer"
                    >
                      Volver a iniciar sesión
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRecoverySubmit} className="space-y-4">
                  {resetError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{resetError}</span>
                    </div>
                  )}

                  <p className="text-xs text-stone-600 leading-relaxed">
                    Ingresa el correo electrónico asociado a tu cuenta de Gusto. Generaremos un enlace temporal seguro con token de recuperación para que puedas restablecer tu clave inmediatamente.
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Correo Electrónico Registrado
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="ej. mateo.rossi@gusto.app"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#E09F3E] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-[11px] text-stone-600 space-y-1">
                    <span className="font-bold text-stone-800 block">Correos demo disponibles:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-stone-600">
                      <li><code>mateo.rossi@gusto.app</code></li>
                      <li><code>lucia.valenzuela@gusto.app</code></li>
                      <li><code>camila.rios@gusto.app</code></li>
                      <li><code>admin@gusto.app</code></li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#E09F3E] hover:bg-[#835500] text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2"
                  >
                    <span>Generar Enlace de Recuperación</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
                    >
                      Cancelar y volver a login
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* MODE 4: ENTER NEW PASSWORD */}
          {mode === 'new_password' && (
            <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
              {resetError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{resetError}</span>
                </div>
              )}

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold block">Restableciendo contraseña para:</span>
                <span className="font-medium">{resetSimulation?.userName || 'Usuario Gusto'} ({resetSimulation?.email || recoveryEmail || 'correo verificado'})</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Código de Seguridad / Token Temporal
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-[#E09F3E] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ej: GST-84920"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-[#E09F3E] focus:outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-stone-500 mt-1">
                  Código de 6 caracteres enviado a tu casilla o autocompletado desde el enlace.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#E09F3E] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Repite la nueva contraseña"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-[#E09F3E] focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Actualizar Contraseña e Iniciar Sesión</span>
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
