import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Recipe, UserProfile, DietaryTag, SubProfile, UserAddress, PurchaseOrder } from '../types';
import { RecipeCard } from './RecipeCard';
import { ScrollableFilterBar } from './ScrollableFilterBar';
import { OrderTrackingModal } from './OrderTrackingModal';
import {
  Upload,
  User,
  AtSign,
  MapPin,
  Tag,
  Plus,
  X,
  Check,
  Sparkles,
  Trash2,
  ChefHat,
  Heart,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  Shield,
  Smile,
  ShoppingCart,
  Truck,
  Home,
  Building2,
  Clock,
  RotateCw,
  Receipt,
  AlertCircle,
  ShoppingBag
} from 'lucide-react';
import { formatARS } from '../utils/currency';

interface UserProfileViewProps {
  onOpenDetail: (recipe: Recipe) => void;
  onOpenReport: (targetType: 'recipe' | 'profile', targetId: string, title: string) => void;
  onEditRecipe: (recipe: Recipe) => void;
  onCreateRecipe: () => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

const PRESET_AVATARS = [
  { label: 'Chef Clásico', url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=160&auto=format&fit=crop&q=80' },
  { label: 'Nutricionista', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80' },
  { label: 'Repostera Creativa', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80' },
  { label: 'Chef Ejecutivo', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80' },
  { label: 'Panadero Rústico', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80' },
];

const SUGGESTED_SPECIALTIES = [
  'Panadería artesanal',
  'Sin TACC / Celíacos',
  'Pastelería francesa',
  'Cocina Vegana',
  'Cocina Italiana',
  'Fermentación & Masa Madre',
  'Keto & Low-Carb',
  'Meal Prep',
  'Parrilla & Ahumados',
  'Bajo en Sodio',
  'Platos para Diabéticos',
  'Cocina Asiática',
  'Postres sin Azúcar',
  'Cocina Saludable'
];

const DIETARY_OPTIONS: { id: DietaryTag; label: string }[] = [
  { id: 'celiaco', label: 'Sin TACC (Celíaco)' },
  { id: 'vegano', label: 'Vegano' },
  { id: 'vegetariano', label: 'Vegetariano' },
  { id: 'diabetico', label: 'Diabético' },
  { id: 'keto', label: 'Keto' },
  { id: 'sin_lactosa', label: 'Sin Lactosa' },
  { id: 'bajo_sodio', label: 'Bajo en Sodio' },
];

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  onOpenDetail,
  onOpenReport,
  onEditRecipe,
  onCreateRecipe,
  onOpenAuth,
}) => {
  const {
    currentUser,
    allUsers,
    recipes,
    collections,
    createCollection,
    exportCollectionPackage,
    updateUserProfile,
    addSubProfile,
    deleteSubProfile,
    switchActiveSubProfile,
    followUserToggle,
    selectSpecificUser,
    moveWishlistIngredientToCart,
    removeWishlistIngredient,
    addAllWishlistIngredientsToCart,
    addRecipeIngredientsToCart,
    userAddresses,
    activeDeliveryAddress,
    addUserAddress,
    updateUserAddress,
    deleteUserAddress,
    setDefaultAddress,
    orders,
    selectedOrderForTracking,
    setSelectedOrderForTracking,
    advanceOrderStatus,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'creadas' | 'borradores' | 'programadas' | 'colecciones' | 'deseos' | 'explorar_cocineros' | 'direcciones' | 'pedidos'
  >('creadas');
  const [wishlistSubTab, setWishlistSubTab] = useState<'recetas' | 'ingredientes'>('recetas');
  const [profileSearchQuery, setProfileSearchQuery] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Address modal / form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrAlias, setAddrAlias] = useState('Casa');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrNumber, setAddrNumber] = useState('');
  const [addrApartment, setAddrApartment] = useState('');
  const [addrCity, setAddrCity] = useState('CABA');
  const [addrProvince, setAddrProvince] = useState('Buenos Aires');
  const [addrPostalCode, setAddrPostalCode] = useState('1414');
  const [addrNotes, setAddrNotes] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  // Tracking modal state
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  // Edit profile state
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editUsername, setEditUsername] = useState(currentUser?.username || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editLocation, setEditLocation] = useState(currentUser?.location || 'Argentina');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || PRESET_AVATARS[0].url);
  const [editSpecialties, setEditSpecialties] = useState<string[]>(currentUser?.specialties || []);
  const [customSpecialtyInput, setCustomSpecialtyInput] = useState('');
  const [editDietary, setEditDietary] = useState<DietaryTag[]>(currentUser?.dietaryPreferences || []);

  // Update edit form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditUsername(currentUser.username);
      setEditBio(currentUser.bio);
      setEditLocation(currentUser.location || 'Argentina');
      setEditAvatar(currentUser.avatar);
      setEditSpecialties(currentUser.specialties || []);
      setEditDietary(currentUser.dietaryPreferences || []);
    }
  }, [currentUser]);

  // Add subprofile state
  const [showAddSubProfile, setShowAddSubProfile] = useState(false);
  const [subName, setSubName] = useState('');
  const [subRelation, setSubRelation] = useState('Hijo/a');
  const [subDiet, setSubDiet] = useState<DietaryTag[]>([]);

  // Create collection state
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [colName, setColName] = useState('');
  const [colDesc, setColDesc] = useState('');

  // GUEST STATE: If user is not logged in
  if (!currentUser) {
    return (
      <div className="w-full flex flex-col gap-8 pb-16">
        {/* Guest Welcome Bento Card */}
        <div className="relative bg-zinc-900 rounded-3xl shadow-xl p-8 sm:p-12 overflow-hidden border border-zinc-800 text-center max-w-3xl mx-auto text-zinc-100">
          <div className="w-20 h-20 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <ChefHat className="w-10 h-10" />
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
            Tu Espacio Culinario Personal en Gusto
          </h2>
          
          <p className="text-sm sm:text-base text-zinc-400 mt-2 max-w-xl mx-auto leading-relaxed">
            Inicia sesión o regístrate para publicar recetas de autor, programar publicaciones, guardar colecciones de cocina, gestionar subperfiles dietéticos para tu familia y conectar con la comunidad gastronómica.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => onOpenAuth?.('login')}
              className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Iniciar Sesión</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth?.('register')}
              className="px-6 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold text-sm border border-zinc-700 shadow-sm transition-all cursor-pointer"
            >
              Crear Cuenta Gratis
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-zinc-800 text-left">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-400 text-[24px]">menu_book</span>
              <div>
                <h4 className="font-bold text-xs text-zinc-200">Recetas & Videos</h4>
                <p className="text-[11px] text-zinc-400">Publica pasos con fotos, videos y porciones exactas.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-400 text-[24px]">group</span>
              <div>
                <h4 className="font-bold text-xs text-zinc-200">Subperfiles Familiares</h4>
                <p className="text-[11px] text-zinc-400">Personaliza dietas para celíacos, veganos o diabéticos.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-400 text-[24px]">shopping_cart</span>
              <div>
                <h4 className="font-bold text-xs text-zinc-200">Compra de Ingredientes</h4>
                <p className="text-[11px] text-zinc-400">Envía ingredientes al carrito con precios estimados.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Explore Cooks Section for Guests */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold text-zinc-100">
              Chefs y Creadores de la Comunidad
            </h3>
            <span className="text-xs text-zinc-500">{allUsers.length} cocineros activos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {allUsers.map((user) => (
              <div key={user.id} className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 shadow-xl flex flex-col justify-between text-zinc-100">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/40" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-zinc-100 truncate">{user.name}</h4>
                      <p className="text-xs text-amber-400 font-medium">@{user.username}</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 mb-3">{user.bio}</p>
                  <div className="flex flex-wrap gap-1">
                    {user.specialties.slice(0, 2).map((s, idx) => (
                      <span key={idx} className="text-[10px] bg-zinc-950 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    selectSpecificUser(user.id);
                  }}
                  className="mt-4 w-full py-1.5 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-amber-400 text-xs font-bold border border-zinc-700 transition-colors cursor-pointer text-center"
                >
                  Probar perfil como {user.name.split(' ')[0]}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Filter recipes for logged-in user
  const myCreated = recipes.filter((r) => r.authorId === currentUser.id && r.status === 'published');
  const myDrafts = recipes.filter((r) => r.authorId === currentUser.id && r.status === 'draft');
  const myScheduled = recipes.filter((r) => r.authorId === currentUser.id && r.status === 'scheduled');
  const myWishlist = recipes.filter((r) => currentUser.wishlistRecipeIds.includes(r.id));
  const myCollections = collections.filter((c) => c.userId === currentUser.id);

  // Pinned recipe if exists
  const pinnedRecipe = recipes.find((r) => r.id === currentUser.pinnedRecipeId);

  // Profile search
  const filteredUsers = allUsers.filter((u) => {
    return (
      u.name.toLowerCase().includes(profileSearchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(profileSearchQuery.toLowerCase()) ||
      u.specialties.some((s) => s.toLowerCase().includes(profileSearchQuery.toLowerCase()))
    );
  });

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('El nombre no puede estar vacío.');
      return;
    }
    const cleanAlias = editUsername.trim().replace(/^@/, '').toLowerCase().replace(/\s+/g, '_');
    if (!cleanAlias) {
      showToast('Por favor introduce un alias válido.');
      return;
    }

    updateUserProfile({
      name: editName.trim(),
      username: cleanAlias,
      bio: editBio.trim(),
      location: editLocation.trim(),
      avatar: editAvatar,
      specialties: editSpecialties,
      dietaryPreferences: editDietary,
    });
    setIsEditingProfile(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditAvatar(reader.result);
          showToast('Foto cargada desde tu equipo.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCustomSpecialty = () => {
    const trimmed = customSpecialtyInput.trim();
    if (trimmed && !editSpecialties.includes(trimmed)) {
      setEditSpecialties([...editSpecialties, trimmed]);
      setCustomSpecialtyInput('');
    }
  };

  const handleRemoveSpecialty = (item: string) => {
    setEditSpecialties(editSpecialties.filter((s) => s !== item));
  };

  const handleToggleSuggestedSpecialty = (spec: string) => {
    if (editSpecialties.includes(spec)) {
      setEditSpecialties(editSpecialties.filter((s) => s !== spec));
    } else {
      setEditSpecialties([...editSpecialties, spec]);
    }
  };

  const toggleEditDietaryTag = (tag: DietaryTag) => {
    setEditDietary(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleAddSubProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return;
    addSubProfile(subName, subRelation, subDiet);
    setSubName('');
    setSubDiet([]);
    setShowAddSubProfile(false);
  };

  const handleCreateCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colName.trim()) return;
    createCollection(colName, colDesc, []);
    setColName('');
    setColDesc('');
    setShowCreateCollection(false);
  };

  const toggleSubDietTag = (tag: DietaryTag) => {
    setSubDiet((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Address helpers
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddrAlias('Casa');
    setAddrStreet('');
    setAddrNumber('');
    setAddrApartment('');
    setAddrCity('Palermo, CABA');
    setAddrProvince('CABA');
    setAddrPostalCode('1414');
    setAddrNotes('');
    setAddrIsDefault(userAddresses.length === 0);
    setShowAddressForm(true);
  };

  const handleOpenEditAddress = (addr: UserAddress) => {
    setEditingAddressId(addr.id);
    setAddrAlias(addr.alias || 'Mi Domicilio');
    setAddrStreet(addr.street);
    setAddrNumber(addr.number);
    setAddrApartment(addr.apartment || '');
    setAddrCity(addr.city);
    setAddrProvince(addr.province);
    setAddrPostalCode(addr.postalCode);
    setAddrNotes(addr.notes || '');
    setAddrIsDefault(!!addr.isDefault);
    setShowAddressForm(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrStreet.trim() || !addrNumber.trim() || !addrPostalCode.trim()) {
      showToast('Por favor completa la calle, número y código postal.');
      return;
    }
    if (editingAddressId) {
      updateUserAddress(editingAddressId, {
        alias: addrAlias.trim(),
        street: addrStreet.trim(),
        number: addrNumber.trim(),
        apartment: addrApartment.trim() || undefined,
        city: addrCity.trim(),
        province: addrProvince.trim(),
        postalCode: addrPostalCode.trim(),
        notes: addrNotes.trim() || undefined,
        isDefault: addrIsDefault,
      });
    } else {
      addUserAddress({
        alias: addrAlias.trim(),
        street: addrStreet.trim(),
        number: addrNumber.trim(),
        apartment: addrApartment.trim() || undefined,
        city: addrCity.trim(),
        province: addrProvince.trim(),
        postalCode: addrPostalCode.trim(),
        notes: addrNotes.trim() || undefined,
        isDefault: addrIsDefault,
      });
    }
    setShowAddressForm(false);
  };

  const myOrders = orders.filter(o => o.userId === currentUser?.id || o.userId === 'guest');

  return (
    <div className="w-full flex flex-col gap-8 pb-16">
      {/* Profile Showcase Bento Header */}
      <div className="relative bg-zinc-900 rounded-3xl shadow-xl p-6 sm:p-8 overflow-hidden border border-zinc-800 text-zinc-100">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start justify-between gap-6 relative z-10">
          {/* Left: Avatar & Bio details */}
          <div className="flex flex-col md:flex-row items-start gap-6 max-w-4xl">
            {/* Chef Portrait with Verified Cloche Badge */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden shadow-xl ring-4 ring-amber-500/30">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-md font-bold"
                title="Chef Verificado"
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  restaurant_menu
                </span>
              </div>
            </div>

            {/* Bio & Credentials */}
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
                  {currentUser.name}
                </h1>
                {currentUser.role === 'admin' && (
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold px-3 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
                {currentUser.role === 'editor' && (
                  <span className="bg-purple-950/80 text-purple-300 border border-purple-800/60 text-xs font-bold px-3 py-0.5 rounded-full">
                    Editor
                  </span>
                )}
                {currentUser.role === 'premium' && (
                  <span className="bg-amber-950/80 text-amber-300 border border-amber-800/60 text-xs font-bold px-3 py-0.5 rounded-full">
                    Premium
                  </span>
                )}
                {currentUser.role === 'usuario' && (
                  <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-medium px-3 py-0.5 rounded-full">
                    Comensal
                  </span>
                )}
                {currentUser.activeSubProfileId && (
                  <span className="bg-sky-950 text-sky-300 border border-sky-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    Subperfil Activo
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">
                  location_on
                </span>
                <span>{currentUser.location || 'Argentina'}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700 mx-1"></span>
                <span className="text-amber-400 font-bold">@{currentUser.username}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700 mx-1"></span>
                <span className="text-zinc-500">{currentUser.email}</span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 mt-1 leading-relaxed max-w-2xl">
                {currentUser.bio}
              </p>

              {/* Specialties / Tags */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentUser.specialties.map((spec, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-950 border border-zinc-800 text-amber-400"
                  >
                    ✦ {spec}
                  </span>
                ))}
                {currentUser.dietaryPreferences.map((diet, i) => (
                  <span
                    key={`diet-${i}`}
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                  >
                    🥗 {diet}
                  </span>
                ))}
              </div>

              {/* Metrics Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 pt-3 border-t border-zinc-800">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-zinc-100">
                    {currentUser.followersCount || 1420}
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                    Seguidores
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-zinc-100">
                    {currentUser.followingUserIds.length || 12}
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                    Seguidos
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-zinc-100">
                    {myCreated.length}
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                    Recetas Creadas
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-zinc-100">4.9</span>
                    <span
                      className="material-symbols-outlined text-amber-400 text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                    Valoración Media
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions Cluster & Subprofile switcher */}
          <div className="flex flex-col gap-2.5 w-full lg:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span>{isEditingProfile ? 'Cerrar edición' : 'Editar perfil completo'}</span>
            </button>

            {/* Subprofiles Box */}
            <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-800 space-y-2.5 text-xs min-w-[260px] text-zinc-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-100 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-amber-400">
                    group
                  </span>
                  Subperfiles Familiares
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddSubProfile(!showAddSubProfile)}
                  className="text-[11px] text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar
                </button>
              </div>

              {/* Subprofiles list */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => switchActiveSubProfile(null)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center justify-between ${
                    !currentUser.activeSubProfileId
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-xs'
                      : 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                  }`}
                >
                  <span>Principal ({currentUser.name})</span>
                  {!currentUser.activeSubProfileId && (
                    <span className="material-symbols-outlined text-[16px] text-amber-400">check</span>
                  )}
                </button>

                {currentUser.subprofiles?.map((sp: SubProfile) => (
                  <div
                    key={sp.id}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-colors border ${
                      currentUser.activeSubProfileId === sp.id
                        ? 'bg-amber-500/20 text-amber-300 font-bold border-amber-500/40 shadow-xs'
                        : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => switchActiveSubProfile(sp.id)}
                      className="text-left flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="truncate">{sp.name} ({sp.relation})</div>
                      <div className="text-[10px] text-zinc-500 font-normal truncate">
                        {sp.dietaryRestrictions.length > 0 ? sp.dietaryRestrictions.join(', ') : 'Sin restricciones'}
                      </div>
                    </button>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {currentUser.activeSubProfileId === sp.id && (
                        <span className="material-symbols-outlined text-[16px] text-amber-400">check</span>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteSubProfile(sp.id)}
                        title="Eliminar subperfil"
                        className="p-1 text-zinc-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FULL PROFILE EDITOR DRAWER */}
        {isEditingProfile && (
          <form onSubmit={handleProfileSave} className="mt-6 pt-6 border-t border-zinc-800 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-zinc-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">manage_accounts</span>
                Configuración & Edición del Perfil
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="text-zinc-400 hover:text-zinc-100 p-1 rounded-lg hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Management: Upload from device / Preset chef avatars / Custom URL */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <label className="block text-xs font-bold text-amber-400">
                Foto de Perfil & Avatar
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={editAvatar}
                  alt="Vista previa"
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-amber-500/40 shrink-0"
                />

                <div className="flex-1 space-y-2 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-bold text-zinc-200 cursor-pointer shadow-xs transition-colors">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Subir foto desde mi equipo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <span className="text-[11px] text-zinc-500">o elige un avatar predeterminado:</span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pt-1">
                    {PRESET_AVATARS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditAvatar(p.url)}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                          editAvatar === p.url ? 'border-amber-400 ring-2 ring-amber-500/50 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                        title={p.label}
                      >
                        <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>

                  <div className="pt-1">
                    <input
                      type="url"
                      placeholder="O pega una URL de imagen externa (https://...)"
                      value={editAvatar.startsWith('data:') ? '' : editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:ring-2 focus:ring-amber-500/30 outline-none placeholder-zinc-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Info: Name, Alias, Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-200 mb-1">Nombre Completo</label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-semibold focus:ring-2 focus:ring-amber-500/30 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-200 mb-1">
                  Alias / Username (@)
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-semibold focus:ring-2 focus:ring-amber-500/30 outline-none"
                    required
                  />
                </div>
                <span className="text-[10px] text-zinc-500 mt-0.5 block">
                  Enlace público: gusto.app/@{editUsername.replace(/^@/, '')}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-200 mb-1">Ubicación / Ciudad</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-semibold focus:ring-2 focus:ring-amber-500/30 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bio textarea */}
            <div>
              <label className="block text-xs font-bold text-zinc-200 mb-1">Biografía Culinaria</label>
              <textarea
                rows={2}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Cuéntale a la comunidad sobre tu experiencia, pasiones gastronómicas y estilo de cocina..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:ring-2 focus:ring-amber-500/30 outline-none resize-none placeholder-zinc-500"
              />
            </div>

            {/* INTUITIVE SPECIALTIES / TAGS MANAGER */}
            <div className="space-y-2 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
              <label className="block text-xs font-bold text-zinc-200">
                Especialidades & Tags Culinarios
              </label>
              <p className="text-[11px] text-zinc-400">
                Agrega etiquetas que describan tus puntos fuertes. Haz clic en las sugerencias o escribe las tuyas.
              </p>

              {/* Active Tags Chips */}
              <div className="flex flex-wrap items-center gap-1.5 min-h-[32px] p-2 bg-zinc-900 rounded-xl border border-zinc-800">
                {editSpecialties.length === 0 ? (
                  <span className="text-xs text-zinc-500 italic">No has agregado tags aún.</span>
                ) : (
                  editSpecialties.map((spec) => (
                    <span
                      key={spec}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-zinc-950 shadow-xs"
                    >
                      <span>{spec}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialty(spec)}
                        className="hover:bg-zinc-950/20 rounded-full p-0.5 cursor-pointer"
                        title="Eliminar tag"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Input for custom tags */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Escribe una nueva especialidad (ej. Chocolatería, Pizzas a la leña) y pulsa Enter"
                  value={customSpecialtyInput}
                  onChange={(e) => setCustomSpecialtyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSpecialty();
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs focus:ring-2 focus:ring-amber-500/30 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSpecialty}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar</span>
                </button>
              </div>

              {/* Suggested Tags Quick-Add Cloud */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-zinc-400 block mb-1.5">
                  Sugerencias Populares (clic para añadir/quitar):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_SPECIALTIES.map((spec) => {
                    const isSelected = editSpecialties.includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => handleToggleSuggestedSpecialty(spec)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                            : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        <span>{spec}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dietary Preferences (Personal) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-200">
                Preferencias Dietéticas Predeterminadas (Filtros automáticos):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DIETARY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleEditDietaryTag(opt.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      editDietary.includes(opt.id)
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-zinc-950 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {editDietary.includes(opt.id) ? '✓ ' : '+ '}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-5 py-2 rounded-full text-xs font-semibold text-zinc-400 hover:bg-zinc-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </form>
        )}

        {/* Add Subprofile Form Modal/Drawer */}
        {showAddSubProfile && (
          <form onSubmit={handleAddSubProfileSubmit} className="mt-4 p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3.5 animate-in fade-in duration-150 text-zinc-100">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs sm:text-sm text-amber-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">family_restroom</span>
                Nuevo Subperfil Familiar / Dietético
              </h4>
              <button
                type="button"
                onClick={() => setShowAddSubProfile(false)}
                className="text-zinc-400 hover:text-zinc-100 p-0.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">Nombre</label>
                <input
                  type="text"
                  placeholder="Ej. Lucas, Valentina, Abuela Elena"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 text-xs text-zinc-100 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">Parentesco / Relación</label>
                <select
                  value={subRelation}
                  onChange={(e) => setSubRelation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 text-xs text-zinc-100 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="Hijo/a">Hijo/a</option>
                  <option value="Pareja">Pareja</option>
                  <option value="Padre/Madre">Padre/Madre</option>
                  <option value="Abuelo/a">Abuelo/a</option>
                  <option value="Compañero/a">Compañero/a de piso</option>
                  <option value="Invitado/a">Invitado/a habitual</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-amber-400">
                Restricciones dietéticas específicas de este subperfil:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DIETARY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleSubDietTag(opt.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      subDiet.includes(opt.id)
                        ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                        : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {subDiet.includes(opt.id) ? '✓ ' : '+ '}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddSubProfile(false)}
                className="px-4 py-1.5 rounded-full text-xs text-zinc-400 hover:bg-zinc-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-sm cursor-pointer"
              >
                Guardar Subperfil
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Quick Stats Bento Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stat 1: Top Recipe */}
        <div className="bg-zinc-900 rounded-3xl p-5 shadow-xl flex items-center gap-4 border border-zinc-800 text-zinc-100">
          <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-amber-400 shrink-0">
            <span className="material-symbols-outlined text-[26px]">local_fire_department</span>
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold block">
              Receta destacada propia
            </span>
            <p className="text-sm font-bold text-zinc-100 truncate">
              {myCreated[0]?.title || 'Aún sin recetas'}
            </p>
            <span className="text-xs text-amber-400 font-semibold">
              {myCreated[0]?.likesCount ? `${myCreated[0].likesCount} votos positivos` : 'Comienza a cocinar'}
            </span>
          </div>
        </div>

        {/* Stat 2: Total Reach / Collections */}
        <div className="bg-zinc-900 rounded-3xl p-5 shadow-xl flex items-center gap-4 border border-zinc-800 text-zinc-100">
          <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-amber-400 shrink-0">
            <span className="material-symbols-outlined text-[26px]">collections_bookmark</span>
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold block">
              Colecciones Culinarias
            </span>
            <p className="text-sm font-bold text-zinc-100 truncate">
              {myCollections.length} Colecciones creadas
            </p>
            <span className="text-xs text-zinc-400 font-medium">Exportación en PDF</span>
          </div>
        </div>

        {/* Stat 3: Wishlist items */}
        <div className="bg-zinc-900 rounded-3xl p-5 shadow-xl flex items-center gap-4 border border-zinc-800 text-zinc-100">
          <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-amber-400 shrink-0">
            <span className="material-symbols-outlined text-[26px]">favorite</span>
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold block">
              Lista de Deseos
            </span>
            <p className="text-sm font-bold text-zinc-100 truncate">
              {myWishlist.length} Recetas guardadas
            </p>
            <span className="text-xs text-amber-400 font-medium">Listas para preparar</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Section */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 gap-3">
        <ScrollableFilterBar className="flex-1 min-w-0" gradientBg="from-zinc-900 via-zinc-900/90">
          <button
            type="button"
            onClick={() => setActiveTab('creadas')}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'creadas'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            <span>Mis recetas</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${activeTab === 'creadas' ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>
              {myCreated.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('borradores')}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'borradores'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">draft</span>
            <span>Borradores</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${activeTab === 'borradores' ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>
              {myDrafts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('programadas')}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'programadas'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">event_note</span>
            <span>Programadas</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${activeTab === 'programadas' ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>
              {myScheduled.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('colecciones')}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'colecciones'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">collections_bookmark</span>
            <span>Colecciones</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${activeTab === 'colecciones' ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>
              {myCollections.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('deseos')}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'deseos'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">favorite</span>
            <span>Lista de Deseos</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${activeTab === 'deseos' ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>
              {myWishlist.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('direcciones')}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'direcciones'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Mis Direcciones</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${activeTab === 'direcciones' ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>
              {userAddresses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pedidos')}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'pedidos'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Mis Compras</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${activeTab === 'pedidos' ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-300'}`}>
              {myOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('explorar_cocineros')}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'explorar_cocineros'
                ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">explore</span>
            <span>Explorar Cocineros</span>
          </button>
        </ScrollableFilterBar>

        {activeTab === 'creadas' && (
          <button
            type="button"
            onClick={onCreateRecipe}
            className="hidden sm:inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold px-4 py-2 rounded-full transition-all cursor-pointer shrink-0 shadow-md shadow-amber-500/20"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Nueva receta</span>
          </button>
        )}

        {activeTab === 'colecciones' && (
          <button
            type="button"
            onClick={() => setShowCreateCollection(!showCreateCollection)}
            className="hidden sm:inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold px-4 py-2 rounded-full transition-all cursor-pointer shrink-0 shadow-md shadow-amber-500/20"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Crear colección</span>
          </button>
        )}

        {activeTab === 'direcciones' && (
          <button
            type="button"
            onClick={handleOpenAddAddress}
            className="hidden sm:inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold px-4 py-2 rounded-full transition-all cursor-pointer shrink-0 shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Dirección</span>
          </button>
        )}
      </div>

      {/* TAB CONTENT 1: CREADAS */}
      {activeTab === 'creadas' && (
        <div className="space-y-6">
          {/* Pinned Recipe Highlight if present */}
          {pinnedRecipe && (
            <div className="bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 p-5 rounded-3xl border border-amber-500/30 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  push_pin
                </span>
                <span>Receta Fijada por el Chef</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={pinnedRecipe.coverImage}
                    alt={pinnedRecipe.title}
                    className="w-16 h-16 rounded-2xl object-cover shadow-sm ring-1 ring-zinc-800"
                  />
                  <div>
                    <h3 className="font-bold text-base text-zinc-100">
                      {pinnedRecipe.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-1">
                      {pinnedRecipe.description}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenDetail(pinnedRecipe)}
                  className="px-4 py-2 rounded-full bg-amber-500 text-zinc-950 text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer shrink-0"
                >
                  Ver Receta Fijada
                </button>
              </div>
            </div>
          )}

          {myCreated.length === 0 ? (
            <div className="bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-800 space-y-3">
              <span className="material-symbols-outlined text-[48px] text-zinc-600">
                restaurant
              </span>
              <h3 className="font-bold text-zinc-100 text-base">Aún no has publicado recetas</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Comparte tu pasión gastronómica con la comunidad. Puedes agregar fotos, pasos detallados, videos y tiendas de ingredientes.
              </p>
              <button
                type="button"
                onClick={onCreateRecipe}
                className="mt-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-full text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Crear Mi Primera Receta
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myCreated.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onOpenDetail={onOpenDetail}
                  onOpenReport={() => onOpenReport('recipe', recipe.id, recipe.title)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: BORRADORES */}
      {activeTab === 'borradores' && (
        <div>
          {myDrafts.length === 0 ? (
            <div className="bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-800 space-y-3">
              <span className="material-symbols-outlined text-[48px] text-zinc-600">draft</span>
              <h3 className="font-bold text-zinc-100 text-base">No tienes borradores guardados</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Cuando estés preparando una receta y no quieras publicarla aún, puedes guardarla como borrador privado.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myDrafts.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onOpenDetail={onOpenDetail}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: PROGRAMADAS */}
      {activeTab === 'programadas' && (
        <div>
          {myScheduled.length === 0 ? (
            <div className="bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-800 space-y-3">
              <span className="material-symbols-outlined text-[48px] text-zinc-600">event_note</span>
              <h3 className="font-bold text-zinc-100 text-base">No hay recetas programadas</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Puedes programar la fecha y hora de publicación de tus recetas para lanzarlas automáticamente.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myScheduled.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onOpenDetail={onOpenDetail}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: COLECCIONES */}
      {activeTab === 'colecciones' && (
        <div className="space-y-6">
          {showCreateCollection && (
            <form onSubmit={handleCreateCollectionSubmit} className="p-4 rounded-2xl bg-zinc-900 border border-amber-500/30 space-y-3">
              <h4 className="font-bold text-xs text-amber-400">Nueva Colección Culinaria</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nombre de la colección (ej. Postres de Domingo)"
                  value={colName}
                  onChange={(e) => setColName(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-zinc-950 text-xs border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Descripción breve..."
                  value={colDesc}
                  onChange={(e) => setColDesc(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-zinc-950 text-xs border border-zinc-800 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCollection(false)}
                  className="px-3 py-1 rounded-full text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold cursor-pointer"
                >
                  Guardar colección
                </button>
              </div>
            </form>
          )}

          {myCollections.length === 0 ? (
            <div className="bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-800 space-y-3">
              <span className="material-symbols-outlined text-[48px] text-zinc-600">collections_bookmark</span>
              <h3 className="font-bold text-zinc-100 text-base">Aún no has creado colecciones</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Organiza tus recetas en álbumes temáticos: "Cenas Rápidas", "Platos sin TACC", "Pastelería Francesa".
              </p>
              <button
                type="button"
                onClick={() => setShowCreateCollection(true)}
                className="mt-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-full text-xs font-bold cursor-pointer"
              >
                Crear Mi Primera Colección
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCollections.map((col) => (
                <div key={col.id} className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-amber-400 uppercase">
                        {col.recipeIds.length} recetas incluidas
                      </span>
                      <button
                        type="button"
                        onClick={() => exportCollectionPackage(col)}
                        className="text-[11px] font-semibold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                        title="Exportar recetas como PDF"
                      >
                        <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                        Exportar (PDF)
                      </button>
                    </div>
                    <h4 className="font-bold text-base text-zinc-100">{col.name}</h4>
                    <p className="text-xs text-zinc-400 mt-1">{col.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                    <span>{col.isPrivate ? 'Privada' : 'Pública'}</span>
                    <span className="font-medium text-amber-400">Álbum Culinario</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 5: LISTA DE DESEOS */}
      {activeTab === 'deseos' && (
        <div className="space-y-5">
          {/* Sub-tabs: Recetas vs Ingredientes */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWishlistSubTab('recetas')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  wishlistSubTab === 'recetas'
                    ? 'bg-amber-500 text-zinc-950 shadow-xs'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                Recetas Guardadas ({myWishlist.length})
              </button>
              <button
                type="button"
                onClick={() => setWishlistSubTab('ingredientes')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  wishlistSubTab === 'ingredientes'
                    ? 'bg-amber-500 text-zinc-950 shadow-xs'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                Ingredientes Guardados ({currentUser?.wishlistIngredientItems?.length || 0})
              </button>
            </div>

            {wishlistSubTab === 'ingredientes' && (currentUser?.wishlistIngredientItems?.length || 0) > 0 && (
              <button
                type="button"
                onClick={addAllWishlistIngredientsToCart}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Comprar Todos ({currentUser?.wishlistIngredientItems?.length})
              </button>
            )}
          </div>

          {/* Sub-tab 1: Recetas */}
          {wishlistSubTab === 'recetas' && (
            <div>
              {myWishlist.length === 0 ? (
                <div className="bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-800 space-y-3">
                  <span className="material-symbols-outlined text-[48px] text-zinc-600">favorite</span>
                  <h3 className="font-bold text-zinc-100 text-base">Tu lista de recetas deseadas está vacía</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Explora el catálogo y pulsa el corazón o marcador para guardar las recetas que deseas cocinar en el futuro.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {myWishlist.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onOpenDetail={onOpenDetail}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub-tab 2: Ingredientes */}
          {wishlistSubTab === 'ingredientes' && (
            <div>
              {!currentUser?.wishlistIngredientItems || currentUser.wishlistIngredientItems.length === 0 ? (
                <div className="bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-800 space-y-3">
                  <span className="material-symbols-outlined text-[48px] text-zinc-600">bookmark</span>
                  <h3 className="font-bold text-zinc-100 text-base">No tienes ingredientes guardados</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    En cualquier receta, pulsa el icono de marcador junto a cualquier ingrediente individual para guardarlo en tu lista de compras futuras.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentUser.wishlistIngredientItems.map((wishItem) => (
                    <div
                      key={wishItem.id}
                      className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 shadow-xs flex flex-col justify-between gap-3 hover:border-zinc-700 transition-all"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-zinc-100 leading-snug">
                            {wishItem.ingredient.quantity} {wishItem.ingredient.unit} {wishItem.ingredient.name}
                          </h4>
                          <span className="text-xs font-bold text-emerald-400 shrink-0">
                            {formatARS(wishItem.ingredient.estimatedPrice)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">
                          Receta: <span className="font-semibold text-zinc-200">{wishItem.recipeTitle}</span>
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          Tienda sugerida: {wishItem.ingredient.storeName}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800">
                        <button
                          type="button"
                          onClick={() => moveWishlistIngredientToCart(wishItem.id)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Mover al Carrito
                        </button>
                        <button
                          type="button"
                          onClick={() => removeWishlistIngredient(wishItem.id)}
                          className="text-xs text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 6: EXPLORAR COCINEROS */}
      {activeTab === 'explorar_cocineros' && (
        <div className="space-y-4">
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 shadow-xs flex items-center gap-3">
            <span className="material-symbols-outlined text-zinc-500">search</span>
            <input
              type="text"
              placeholder="Buscar por nombre de chef, alias (@usuario) o especialidad culinaria..."
              value={profileSearchQuery}
              onChange={(e) => setProfileSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm bg-transparent text-zinc-100 placeholder-zinc-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => {
              const isMe = user.id === currentUser.id;
              const isFollowing = currentUser.followingUserIds.includes(user.id);

              return (
                <div
                  key={user.id}
                  className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/40"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-zinc-100 truncate">{user.name}</h4>
                          {isMe && (
                            <span className="bg-zinc-800 text-zinc-300 text-[9px] font-bold px-1.5 py-0.5 rounded">
                              Tú
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-amber-400 font-medium">@{user.username}</p>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
                      {user.bio}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {user.specialties.map((s, idx) => (
                        <span key={idx} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700/60">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500">
                      {user.followersCount} seguidores
                    </span>

                    {!isMe ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenReport('profile', user.id, user.name)}
                          className="p-1 text-zinc-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                          title="Denunciar perfil"
                        >
                          <span className="material-symbols-outlined text-[16px]">report</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => followUserToggle(user.id)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            isFollowing
                              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                              : 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
                          }`}
                        >
                          {isFollowing ? 'Siguiendo' : '+ Seguir'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] font-semibold text-amber-400">Tu Perfil</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 7: MIS DIRECCIONES */}
      {activeTab === 'direcciones' && (
        <div className="space-y-6">
          {/* Informative coverage card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-zinc-100">
                  Direcciones y Cobertura de Envíos en Argentina
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5 max-w-2xl leading-relaxed">
                  Tu dirección predeterminada se utiliza para sincronizar automáticamente el stock en supermercados asociados (Coto, Jumbo, Carrefour, Vea) y calcular los costos de delivery exactos en pesos ($ ARS).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenAddAddress}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Dirección</span>
            </button>
          </div>

          {/* Addresses list */}
          {userAddresses.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900 rounded-3xl border border-zinc-800 p-8 space-y-3">
              <Home className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-zinc-100">No tienes direcciones guardadas</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Registra tu domicilio para poder comprar los ingredientes de tus recetas favoritas con entrega a domicilio.
              </p>
              <button
                type="button"
                onClick={handleOpenAddAddress}
                className="mt-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs cursor-pointer shadow-sm"
              >
                Agregar mi primera dirección
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`bg-zinc-900 rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                    addr.isDefault
                      ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                      : 'border-zinc-800 shadow-2xs hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-100 text-sm">
                          {addr.alias || 'Domicilio'}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-500/30">
                            <Check className="w-3 h-3 text-amber-400" /> Predeterminada
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-400 font-mono">
                        CP {addr.postalCode}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-200 font-semibold leading-snug">
                      {addr.street} {addr.number}
                      {addr.apartment && <span className="font-normal text-zinc-400"> ({addr.apartment})</span>}
                    </p>

                    <p className="text-xs text-zinc-400">
                      {addr.city}, {addr.province}
                    </p>

                    {addr.notes && (
                      <p className="text-[11px] text-zinc-400 bg-zinc-950 p-2 rounded-xl border border-zinc-800 italic">
                        Nota: "{addr.notes}"
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-zinc-800 flex items-center justify-between gap-2 text-xs">
                    <div>
                      {!addr.isDefault ? (
                        <button
                          type="button"
                          onClick={() => setDefaultAddress(addr.id)}
                          className="text-amber-400 hover:underline font-semibold cursor-pointer"
                        >
                          Fijar como predeterminada
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-medium text-[11px] flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Activa para compras
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditAddress(addr)}
                        className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors cursor-pointer"
                      >
                        Editar
                      </button>
                      {userAddresses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('¿Eliminar esta dirección de entrega?')) {
                              deleteUserAddress(addr.id);
                            }
                          }}
                          className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Eliminar dirección"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add / Edit Address Form Modal */}
          {showAddressForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
              <div className="relative w-full max-w-lg bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden my-auto flex flex-col animate-in fade-in zoom-in-95 duration-150">
                <div className="px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-zinc-950 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-zinc-950" />
                    <h3 className="font-bold text-base font-display text-zinc-950">
                      {editingAddressId ? 'Editar Dirección' : 'Nueva Dirección de Entrega'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="p-1 text-zinc-900 hover:text-black rounded-xl hover:bg-black/10 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveAddress} className="p-6 space-y-3.5 text-xs">
                  {/* Presets */}
                  <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 block uppercase">
                      Autocompletar zonas populares:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
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
                            setAddrStreet(p.street);
                            setAddrNumber(p.number);
                            setAddrApartment(p.apt);
                            setAddrCity(p.city);
                            setAddrProvince(p.prov);
                            setAddrPostalCode(p.cp);
                          }}
                          className="text-[10px] bg-zinc-900 text-amber-400 font-semibold px-2 py-0.5 rounded-md border border-zinc-700/80 hover:bg-amber-500 hover:text-zinc-950 cursor-pointer transition-colors"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Alias / Etiqueta de la dirección</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Casa, Trabajo, Taller Culinario"
                      value={addrAlias}
                      onChange={(e) => setAddrAlias(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-8">
                      <label className="block text-zinc-300 font-bold mb-1">Calle / Avenida</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Av. Santa Fe"
                        value={addrStreet}
                        onChange={(e) => setAddrStreet(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-zinc-300 font-bold mb-1">Número</label>
                      <input
                        type="text"
                        required
                        placeholder="3420"
                        value={addrNumber}
                        onChange={(e) => setAddrNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4">
                      <label className="block text-zinc-300 font-bold mb-1">Piso / Depto</label>
                      <input
                        type="text"
                        placeholder="4B (opcional)"
                        value={addrApartment}
                        onChange={(e) => setAddrApartment(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div className="col-span-5">
                      <label className="block text-zinc-300 font-bold mb-1">Ciudad / Barrio</label>
                      <input
                        type="text"
                        required
                        placeholder="Palermo, CABA"
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-zinc-300 font-bold mb-1">C. Postal</label>
                      <input
                        type="text"
                        required
                        placeholder="1414"
                        value={addrPostalCode}
                        onChange={(e) => setAddrPostalCode(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Provincia</label>
                    <input
                      type="text"
                      required
                      placeholder="CABA o Buenos Aires"
                      value={addrProvince}
                      onChange={(e) => setAddrProvince(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Notas o Aclaraciones de Entrega</label>
                    <input
                      type="text"
                      placeholder="Timbre 4B, dejar en portería, entre calles..."
                      value={addrNotes}
                      onChange={(e) => setAddrNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <label className="flex items-center gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addrIsDefault}
                      onChange={(e) => setAddrIsDefault(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-zinc-950 border-zinc-700"
                    />
                    <span className="font-semibold text-zinc-200">
                      Establecer como dirección predeterminada para envíos
                    </span>
                  </label>

                  <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold cursor-pointer shadow-sm transition-colors"
                    >
                      Guardar Dirección
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 8: MIS COMPRAS / HISTORIAL & SEGUIMIENTO */}
      {activeTab === 'pedidos' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Truck className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-zinc-100">
                  Historial de Compras y Seguimiento de Ingredientes
                </h4>
                <p className="text-xs text-zinc-400">
                  Trazabilidad en tiempo real de tus pedidos en supermercados asociados.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-zinc-950 border border-zinc-800 px-3 py-1 rounded-full">
              {myOrders.length} {myOrders.length === 1 ? 'pedido' : 'pedidos'}
            </span>
          </div>

          {myOrders.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900 rounded-3xl border border-zinc-800 p-8 space-y-3">
              <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-base font-bold text-zinc-100">Aún no tienes compras realizadas</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Cuando compres ingredientes de cualquier receta desde el carrito virtual, podrás seguir aquí el estado de preparación y despacho hasta tu puerta.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((ord) => {
                const isDelivered = ord.status === 'entregado';
                const isCancelled = ord.status === 'cancelado';

                return (
                  <div
                    key={ord.id}
                    className="bg-zinc-900 rounded-3xl p-5 border border-zinc-800 shadow-2xs hover:border-zinc-700 transition-all space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-extrabold text-sm text-zinc-100">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[11px] font-bold bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                          {ord.storeName}
                        </span>
                        <span className="text-xs text-zinc-400">
                          {new Date(ord.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} hs
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCancelled ? (
                          <span className="text-xs font-bold text-red-400 bg-red-950/60 border border-red-800 px-3 py-1 rounded-full">
                            Cancelado
                          </span>
                        ) : isDelivered ? (
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Entregado
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                            <Clock className="w-3.5 h-3.5" /> {ord.status.replace('_', ' ').toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[11px] text-zinc-500 font-medium block mb-0.5">
                          Destino de Entrega:
                        </span>
                        <p className="font-semibold text-zinc-200">
                          {ord.deliveryAddress.street} {ord.deliveryAddress.number}
                          {ord.deliveryAddress.apartment && ` (${ord.deliveryAddress.apartment})`}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          {ord.deliveryAddress.city} — CP {ord.deliveryAddress.postalCode}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] text-zinc-500 font-medium block mb-0.5">
                          Ingredientes ({ord.items.length}):
                        </span>
                        <p className="text-zinc-300 line-clamp-2 leading-relaxed">
                          {ord.items.slice(0, 3).map(i => i.name).join(', ')}
                          {ord.items.length > 3 && ` (+${ord.items.length - 3} más)`}
                        </p>
                        <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
                          Llegada: {ord.estimatedDeliveryTime}
                        </p>
                      </div>

                      <div className="sm:text-right flex sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                        <div>
                          <span className="text-[11px] text-zinc-500 font-medium block">
                            Total Pagado ($ ARS):
                          </span>
                          <span className="font-mono text-base sm:text-lg font-bold text-amber-400">
                            {formatARS(ord.totalARS)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {!isCancelled && !isDelivered && (
                          <button
                            type="button"
                            onClick={() => advanceOrderStatus(ord.id)}
                            className="text-xs bg-zinc-950 hover:bg-zinc-800 text-amber-400 font-bold px-3 py-1.5 rounded-xl border border-zinc-800 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Simular paso del delivery"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            <span>Simular avance de estado</span>
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrderForTracking(ord);
                          setIsTrackingModalOpen(true);
                        }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Ver Detalle y Seguimiento</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Live Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        order={selectedOrderForTracking}
      />
    </div>
  );
};
