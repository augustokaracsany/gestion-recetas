import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Recipe, UserProfile, DietaryTag, SubProfile } from '../types';
import { RecipeCard } from './RecipeCard';
import { ScrollableFilterBar } from './ScrollableFilterBar';

interface UserProfileViewProps {
  onOpenDetail: (recipe: Recipe) => void;
  onOpenReport: (targetType: 'recipe' | 'profile', targetId: string, title: string) => void;
  onEditRecipe: (recipe: Recipe) => void;
  onCreateRecipe: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  onOpenDetail,
  onOpenReport,
  onEditRecipe,
  onCreateRecipe,
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
    switchActiveSubProfile,
    followUserToggle,
    selectSpecificUser,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'creadas' | 'borradores' | 'programadas' | 'colecciones' | 'deseos' | 'explorar_cocineros'
  >('creadas');
  const [profileSearchQuery, setProfileSearchQuery] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Edit profile state
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [specialtiesText, setSpecialtiesText] = useState(currentUser.specialties.join(', '));

  // Add subprofile state (RF-03)
  const [showAddSubProfile, setShowAddSubProfile] = useState(false);
  const [subName, setSubName] = useState('');
  const [subRelation, setSubRelation] = useState('Familiar');
  const [subDiet, setSubDiet] = useState<DietaryTag[]>([]);

  // Create collection state (RF-24, RF-30)
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [colName, setColName] = useState('');
  const [colDesc, setColDesc] = useState('');

  // Filter recipes for user
  const myCreated = recipes.filter((r) => r.authorId === currentUser.id && r.status === 'published');
  const myDrafts = recipes.filter((r) => r.authorId === currentUser.id && r.status === 'draft');
  const myScheduled = recipes.filter((r) => r.authorId === currentUser.id && r.status === 'scheduled');
  const myWishlist = recipes.filter((r) => currentUser.wishlistRecipeIds.includes(r.id));
  const myCollections = collections.filter((c) => c.userId === currentUser.id);

  // Pinned recipe if exists (RF-17)
  const pinnedRecipe = recipes.find((r) => r.id === currentUser.pinnedRecipeId);

  // Profile search (RF-21)
  const filteredUsers = allUsers.filter((u) => {
    return (
      u.name.toLowerCase().includes(profileSearchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(profileSearchQuery.toLowerCase()) ||
      u.specialties.some((s) => s.toLowerCase().includes(profileSearchQuery.toLowerCase()))
    );
  });

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      bio,
      specialties: specialtiesText
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    });
    setIsEditingProfile(false);
    showToast('Perfil actualizado correctamente');
  };

  const handleAddSubProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return;
    addSubProfile(subName, subRelation, subDiet);
    setSubName('');
    setSubDiet([]);
    setShowAddSubProfile(false);
    showToast(`Subperfil ${subName} creado exitosamente`);
  };

  const handleCreateCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colName.trim()) return;
    createCollection(colName, colDesc, []);
    setColName('');
    setColDesc('');
    setShowCreateCollection(false);
    showToast('Nueva colección culinaria creada');
  };

  const toggleSubDietTag = (tag: DietaryTag) => {
    setSubDiet((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="w-full flex flex-col gap-8 pb-16">
      {/* Profile Showcase Bento */}
      <div className="relative bg-white rounded-3xl shadow-[0_4px_24px_-2px_rgba(197,130,38,0.08)] p-6 sm:p-8 overflow-hidden border border-stone-200/50">
        {/* Ambient warm glow accent in top corner */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#E09F3E]/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start justify-between gap-6 relative z-10">
          {/* Left: Avatar & Bio details */}
          <div className="flex flex-col md:flex-row items-start gap-6 max-w-4xl">
            {/* Chef Portrait with Verified Cloche Badge */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden shadow-[0_8px_24px_rgba(131,85,0,0.18)] ring-4 ring-[#E09F3E]/20">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#E09F3E] text-white flex items-center justify-center shadow-md"
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
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1B1C1C] tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="bg-[#FFDDB4] text-[#291800] text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Rol {currentUser.role}
                </span>
                {currentUser.activeSubProfileId && (
                  <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    Subperfil Activo
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#514536] font-medium">
                <span className="material-symbols-outlined text-[#835500] text-[18px]">
                  location_on
                </span>
                <span>{currentUser.location || 'Madrid, España'}</span>
                <span className="w-1 h-1 rounded-full bg-stone-300 mx-1"></span>
                <span className="text-[#865300]">@{currentUser.username}</span>
              </div>

              <p className="text-xs sm:text-sm text-[#514536] mt-1 leading-relaxed max-w-2xl">
                {currentUser.bio}
              </p>

              {/* Specialties */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentUser.specialties.map((spec, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F6F3F2] text-[#514536]"
                  >
                    ✦ {spec}
                  </span>
                ))}
              </div>

              {/* Metrics Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 pt-3 border-t border-stone-100">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-[#1B1C1C]">
                    {currentUser.followersCount || 1420}
                  </span>
                  <span className="text-[10px] text-[#514536] uppercase tracking-wider font-semibold">
                    Seguidores
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-[#1B1C1C]">
                    {currentUser.followingUserIds.length || 12}
                  </span>
                  <span className="text-[10px] text-[#514536] uppercase tracking-wider font-semibold">
                    Seguidos
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-[#1B1C1C]">
                    {myCreated.length}
                  </span>
                  <span className="text-[10px] text-[#514536] uppercase tracking-wider font-semibold">
                    Recetas Creadas
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-[#1B1C1C]">4.9</span>
                    <span
                      className="material-symbols-outlined text-[#E09F3E] text-[18px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  </div>
                  <span className="text-[10px] text-[#514536] uppercase tracking-wider font-semibold">
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
              className="inline-flex items-center justify-center gap-2 bg-[#E09F3E] hover:bg-[#835500] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full shadow-[0_4px_14px_rgba(224,159,62,0.35)] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span>Editar perfil</span>
            </button>

            {/* Subprofiles dropdown button */}
            <div className="bg-[#F6F3F2] p-3 rounded-2xl border border-stone-200/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1B1C1C] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#835500]">
                    group
                  </span>
                  Subperfiles
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddSubProfile(!showAddSubProfile)}
                  className="text-[11px] text-[#835500] font-bold hover:underline cursor-pointer"
                >
                  + Agregar
                </button>
              </div>

              {/* Subprofiles list */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => switchActiveSubProfile(null)}
                  className={`w-full text-left px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
                    currentUser.activeSubProfileId === null
                      ? 'bg-[#FFDDB9] text-[#2B1700] font-bold'
                      : 'hover:bg-white text-stone-700'
                  }`}
                >
                  Principal: {currentUser.name}
                </button>
                {currentUser.subprofiles?.map((sp: SubProfile) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => switchActiveSubProfile(sp.id)}
                    className={`w-full text-left px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
                      currentUser.activeSubProfileId === sp.id
                        ? 'bg-[#FFDDB9] text-[#2B1700] font-bold'
                        : 'hover:bg-white text-stone-700'
                    }`}
                  >
                    {sp.name} ({sp.relation}) - {sp.dietaryRestrictions.join(', ') || 'Sin restricción'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Form drawer/toggle */}
        {isEditingProfile && (
          <form onSubmit={handleProfileSave} className="mt-6 pt-6 border-t border-stone-100 space-y-4">
            <h3 className="font-bold text-sm text-[#1B1C1C]">Editar Datos Personales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F3F3F3] text-xs focus:ring-2 focus:ring-[#E09F3E] outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Especialidades</label>
                <input
                  type="text"
                  value={specialtiesText}
                  onChange={(e) => setSpecialtiesText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F3F3F3] text-xs focus:ring-2 focus:ring-[#E09F3E] outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">Biografía</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F3F3F3] text-xs focus:ring-2 focus:ring-[#E09F3E] outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-full bg-[#E09F3E] hover:bg-[#835500] text-white text-xs font-bold shadow-sm"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        )}

        {/* Add Subprofile Form Modal/Drawer */}
        {showAddSubProfile && (
          <form onSubmit={handleAddSubProfileSubmit} className="mt-4 p-4 rounded-2xl bg-[#FFF8F0] border border-amber-200 space-y-3">
            <h4 className="font-bold text-xs text-[#835500]">Nuevo Subperfil Familiar / Dietético</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nombre del familiar (ej. Lucas)"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white text-xs border border-amber-200 focus:outline-none"
                required
              />
              <input
                type="text"
                placeholder="Parentesco (ej. Hijo, Pareja)"
                value={subRelation}
                onChange={(e) => setSubRelation(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white text-xs border border-amber-200 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#835500]">Restricciones dietéticas:</label>
              <div className="flex flex-wrap gap-1.5">
                {(['celiaco', 'vegano', 'vegetariano', 'diabetico', 'keto', 'sin_lactosa'] as DietaryTag[]).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleSubDietTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      subDiet.includes(tag)
                        ? 'bg-[#835500] text-white font-bold'
                        : 'bg-white text-stone-700 border border-stone-200'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddSubProfile(false)}
                className="px-3 py-1 rounded-full text-xs text-stone-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-full bg-[#835500] text-white text-xs font-bold"
              >
                Crear subperfil
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Quick Stats Bento Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stat 1: Top Recipe */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4 border border-stone-200/50">
          <div className="w-12 h-12 rounded-2xl bg-[#FFDDB9] flex items-center justify-center text-[#835500] shrink-0">
            <span className="material-symbols-outlined text-[26px]">local_fire_department</span>
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-[#514536] uppercase tracking-wider font-bold block">
              Receta destacada propia
            </span>
            <p className="text-sm font-bold text-[#1B1C1C] truncate">
              {myCreated[0]?.title || 'Aún sin recetas'}
            </p>
            <span className="text-xs text-[#835500] font-semibold">
              {myCreated[0]?.likesCount ? `${myCreated[0].likesCount} votos positivos` : 'Comienza a cocinar'}
            </span>
          </div>
        </div>

        {/* Stat 2: Total Reach / Collections */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4 border border-stone-200/50">
          <div className="w-12 h-12 rounded-2xl bg-[#FFDDB4] flex items-center justify-center text-[#633F00] shrink-0">
            <span className="material-symbols-outlined text-[26px]">collections_bookmark</span>
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-[#514536] uppercase tracking-wider font-bold block">
              Colecciones Culinarias
            </span>
            <p className="text-sm font-bold text-[#1B1C1C] truncate">
              {myCollections.length} Colecciones creadas
            </p>
            <span className="text-xs text-[#514536] font-medium">Exportación JSON / PDF</span>
          </div>
        </div>

        {/* Stat 3: Wishlist items */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4 border border-stone-200/50">
          <div className="w-12 h-12 rounded-2xl bg-[#F6F3F2] flex items-center justify-center text-[#1B1C1C] shrink-0">
            <span className="material-symbols-outlined text-[26px]">favorite</span>
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-[#514536] uppercase tracking-wider font-bold block">
              Lista de Deseos
            </span>
            <p className="text-sm font-bold text-[#1B1C1C] truncate">
              {myWishlist.length} Recetas guardadas
            </p>
            <span className="text-xs text-[#835500] font-medium">Listas para preparar</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Section */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2 gap-3">
        <ScrollableFilterBar className="flex-1 min-w-0" gradientBg="from-white via-white/95">
          <button
            type="button"
            onClick={() => setActiveTab('creadas')}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'creadas'
                ? 'bg-[#E09F3E] text-white shadow-sm'
                : 'text-[#514536] hover:bg-stone-100'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            <span>Mis recetas</span>
            <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[11px]">
              {myCreated.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('borradores')}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'borradores'
                ? 'bg-[#E09F3E] text-white shadow-sm'
                : 'text-[#514536] hover:bg-stone-100'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">draft</span>
            <span>Borradores</span>
            <span className="bg-stone-200 text-stone-800 px-1.5 py-0.2 rounded-full text-[11px]">
              {myDrafts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('programadas')}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'programadas'
                ? 'bg-[#E09F3E] text-white shadow-sm'
                : 'text-[#514536] hover:bg-stone-100'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">event_note</span>
            <span>Programadas</span>
            <span className="bg-stone-200 text-stone-800 px-1.5 py-0.2 rounded-full text-[11px]">
              {myScheduled.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('colecciones')}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'colecciones'
                ? 'bg-[#E09F3E] text-white shadow-sm'
                : 'text-[#514536] hover:bg-stone-100'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">collections_bookmark</span>
            <span>Colecciones</span>
            <span className="bg-stone-200 text-stone-800 px-1.5 py-0.2 rounded-full text-[11px]">
              {myCollections.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('deseos')}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'deseos'
                ? 'bg-[#E09F3E] text-white shadow-sm'
                : 'text-[#514536] hover:bg-stone-100'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">favorite</span>
            <span>Lista de deseos</span>
            <span className="bg-stone-200 text-stone-800 px-1.5 py-0.2 rounded-full text-[11px]">
              {myWishlist.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('explorar_cocineros')}
            className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'explorar_cocineros'
                ? 'bg-[#E09F3E] text-white shadow-sm'
                : 'text-[#514536] hover:bg-stone-100'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">person_search</span>
            <span>Buscar cocineros</span>
          </button>
        </ScrollableFilterBar>

        <button
          type="button"
          onClick={onCreateRecipe}
          className="shrink-0 hidden md:inline-flex items-center gap-1.5 bg-[#835500] hover:bg-[#865300] text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Crear nueva</span>
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. MIS RECETAS CREADAS */}
      {activeTab === 'creadas' && (
        <div className="space-y-6">
          {/* Pinned recipe highlight if exists */}
          {pinnedRecipe && (
            <div className="p-4 rounded-3xl bg-[#FFDDB9]/40 border border-[#E09F3E]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-full bg-[#E09F3E] text-white">
                  <span className="material-symbols-outlined text-[20px]">push_pin</span>
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#835500]">
                    Receta Fijada en tu Perfil
                  </span>
                  <h4 className="text-sm font-bold text-[#1B1C1C]">{pinnedRecipe.title}</h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenDetail(pinnedRecipe)}
                className="px-4 py-1.5 rounded-full bg-white text-[#835500] text-xs font-bold shadow-xs hover:bg-[#F6F3F2]"
              >
                Ver destacada
              </button>
            </div>
          )}

          {myCreated.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-stone-200/60 space-y-3">
              <span className="material-symbols-outlined text-[48px] text-stone-300">menu_book</span>
              <h3 className="font-bold text-stone-800 text-sm sm:text-base">Aún no has publicado recetas</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Comparte tu pasión gastronómica creando tu primera receta pública en Gusto.
              </p>
              <button
                type="button"
                onClick={onCreateRecipe}
                className="mt-2 px-5 py-2 rounded-full bg-[#E09F3E] text-white text-xs font-bold shadow-sm"
              >
                Crear mi primera receta
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCreated.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onOpenDetail={onOpenDetail}
                  onOpenReport={(r) => onOpenReport('recipe', r.id, r.title)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. BORRADORES */}
      {activeTab === 'borradores' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1B1C1C]">
              Tus borradores en proceso de redacción
            </h3>
            <button
              type="button"
              onClick={onCreateRecipe}
              className="text-xs font-bold text-[#835500] hover:underline"
            >
              + Nuevo borrador
            </button>
          </div>

          {myDrafts.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/60 text-xs text-stone-400">
              No tienes recetas en borrador actualmente.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myDrafts.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200/60 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                        Borrador privado
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {recipe.prepTimeMin + recipe.cookTimeMin} mins
                      </span>
                    </div>
                    <h4 className="font-bold text-base text-stone-900 mb-1">{recipe.title}</h4>
                    <p className="text-xs text-stone-500 line-clamp-2">{recipe.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onEditRecipe(recipe)}
                      className="px-4 py-1.5 rounded-full bg-[#E09F3E] text-white text-xs font-bold shadow-xs hover:bg-[#835500]"
                    >
                      Continuar editando
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenDetail(recipe)}
                      className="text-xs font-semibold text-stone-500 hover:text-stone-900"
                    >
                      Previsualizar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. PROGRAMADAS */}
      {activeTab === 'programadas' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#1B1C1C]">
            Recetas programadas para publicación automática
          </h3>
          {myScheduled.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/60 text-xs text-stone-400">
              No tienes recetas programadas actualmente. Puedes programar la fecha de publicación al crear o editar una receta.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myScheduled.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onOpenDetail={onOpenDetail}
                  onOpenReport={(r) => onOpenReport('recipe', r.id, r.title)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. COLECCIONES CULINARIAS */}
      {activeTab === 'colecciones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1B1C1C]">
              Tus colecciones y paquetes culinarios
            </h3>
            <button
              type="button"
              onClick={() => setShowCreateCollection(!showCreateCollection)}
              className="text-xs font-bold text-[#835500] hover:underline"
            >
              + Nueva colección
            </button>
          </div>

          {showCreateCollection && (
            <form
              onSubmit={handleCreateCollectionSubmit}
              className="p-5 rounded-3xl bg-white border border-[#E09F3E]/40 shadow-sm space-y-3"
            >
              <h4 className="text-xs font-bold text-[#835500]">Crear Nueva Colección Culinaria</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nombre de la colección (ej. Postres de Otoño)"
                  value={colName}
                  onChange={(e) => setColName(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#F3F3F3] text-xs focus:ring-2 focus:ring-[#E09F3E] outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Descripción breve de la colección"
                  value={colDesc}
                  onChange={(e) => setColDesc(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#F3F3F3] text-xs focus:ring-2 focus:ring-[#E09F3E] outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCollection(false)}
                  className="px-3 py-1.5 rounded-full text-xs text-stone-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-full bg-[#E09F3E] text-white text-xs font-bold shadow-xs"
                >
                  Guardar Colección
                </button>
              </div>
            </form>
          )}

          {myCollections.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/60 text-xs text-stone-400">
              Aún no has creado colecciones. ¡Agrupa tus recetas favoritas para compartirlas o exportarlas en paquete!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCollections.map((col) => (
                <div
                  key={col.id}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200/60 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="p-2 rounded-2xl bg-[#FFDDB9] text-[#835500]">
                        <span className="material-symbols-outlined text-[20px]">
                          collections_bookmark
                        </span>
                      </span>
                      <span className="text-xs text-stone-400 font-semibold">
                        {col.recipeIds.length} recetas
                      </span>
                    </div>
                    <h4 className="font-bold text-base text-stone-900 mb-1">{col.name}</h4>
                    <p className="text-xs text-stone-500 line-clamp-2">{col.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => exportCollectionPackage(col)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#835500] hover:underline"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      <span>Exportar paquete JSON</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. LISTA DE DESEOS */}
      {activeTab === 'deseos' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#1B1C1C]">
            Tu lista de recetas deseadas
          </h3>
          {myWishlist.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-stone-200/60 text-xs text-stone-400">
              No tienes recetas en tu lista de deseos todavía. Puedes guardar recetas haciendo clic en el marcador de favoritos de cualquier tarjeta.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myWishlist.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onOpenDetail={onOpenDetail}
                  onOpenReport={(r) => onOpenReport('recipe', r.id, r.title)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. BUSCAR COCINEROS */}
      {activeTab === 'explorar_cocineros' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-stone-200/60 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#835500] text-[22px]">search</span>
            <input
              type="text"
              placeholder="Buscar cocineros por nombre, alias (@usuario) o especialidades..."
              value={profileSearchQuery}
              onChange={(e) => setProfileSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm bg-transparent outline-none text-[#1B1C1C]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => {
              const isFollowing = currentUser.followingUserIds.includes(user.id);

              return (
                <div
                  key={user.id}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200/60 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#E09F3E]/40"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-[#1B1C1C] truncate">{user.name}</h4>
                      <p className="text-xs text-[#865300] truncate">@{user.username}</p>
                      <span className="text-[10px] text-stone-400 capitalize">{user.role}</span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 mb-3">{user.bio}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                    {user.id !== currentUser.id ? (
                      <button
                        type="button"
                        onClick={() => followUserToggle(user.id)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          isFollowing
                            ? 'bg-[#FFDDB9] text-[#2B1700]'
                            : 'bg-[#835500] text-white hover:bg-[#865300]'
                        }`}
                      >
                        {isFollowing ? 'Siguiendo' : 'Seguir'}
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-stone-400">Tu cuenta actual</span>
                    )}

                    {user.id !== currentUser.id && (
                      <button
                        type="button"
                        onClick={() => onOpenReport('profile', user.id, user.name)}
                        className="text-[11px] text-[#AB3333] hover:underline flex items-center gap-0.5"
                      >
                        <span className="material-symbols-outlined text-[14px]">flag</span>
                        <span>Denunciar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Curated Collection Section (Editorial Split Banner) */}
      <div className="bg-[#F6F3F2] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-stone-200/60">
        <div className="flex flex-col gap-2 max-w-xl">
          <span className="text-xs text-[#865300] font-bold uppercase tracking-widest">
            Colección Destacada
          </span>
          <h3 className="font-display text-2xl font-bold text-[#1B1C1C]">
            "Secretos del Mediterráneo Cálido"
          </h3>
          <p className="text-xs sm:text-sm text-[#514536] leading-relaxed">
            Un compendio gastronómico que reúne técnicas explicadas paso a paso con video-clases y selección de maridajes.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={onCreateRecipe}
              className="bg-[#E09F3E] hover:bg-[#835500] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-sm transition-all"
            >
              Explorar Colección
            </button>
            <span className="text-xs text-[#514536]">Acceso libre para la comunidad</span>
          </div>
        </div>

        <div className="relative w-full md:w-72 h-44 rounded-2xl overflow-hidden shadow-md shrink-0 bg-stone-200">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjtg8uxMpkO_4IfikjzGYpBgXERFojTBDeCVyChAmNyZJ61u9wpysjeWZGTayajB-8aINSkZyfB0XaoVM_id2TcYlaP5EDloOHLWsLe1VGVrJXjUtAQPZB2YaHPkovvE83oj6SG8HXITieYiWg-Ij4VlD8b7R6WdlYI4XE0STDnmZCnKEAnZ3sjIQqQBtDQYLQ_m5DUEE08ljhqpmRHEs705ik9TPFPLC_ZbuXlU0q42K_hYU7tQ"
            alt="Ingredientes mediterráneos"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#835500]/20 mix-blend-multiply"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md text-[#835500] flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-[28px] pl-0.5">play_arrow</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
