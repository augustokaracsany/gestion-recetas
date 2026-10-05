import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Recipe, UserProfile, DietaryTag } from '../types';
import { RecipeCard } from './RecipeCard';
import {
  User,
  Users,
  Bookmark,
  Pin,
  Calendar,
  FileText,
  Heart,
  FolderHeart,
  Plus,
  ShieldAlert,
  Search,
  UserCheck,
  UserPlus,
  Settings,
  Sparkles,
  Download,
  Share2,
  Check
} from 'lucide-react';

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
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'creadas' | 'borradores' | 'programadas' | 'colecciones' | 'deseos' | 'explorar_cocineros'>('creadas');
  const [profileSearchQuery, setProfileSearchQuery] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Edit profile state
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [specialtiesText, setSpecialtiesText] = useState(currentUser.specialties.join(', '));

  // Add subprofile state
  const [showAddSubProfile, setShowAddSubProfile] = useState(false);
  const [subName, setSubName] = useState('');
  const [subRelation, setSubRelation] = useState('Familiar');
  const [subDiet, setSubDiet] = useState<DietaryTag[]>([]);

  // Create collection state
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
      specialties: specialtiesText.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
    });
    setIsEditingProfile(false);
  };

  const handleAddSubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return;
    addSubProfile(subName, subRelation, subDiet);
    setSubName('');
    setShowAddSubProfile(false);
  };

  const handleCreateCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colName.trim()) return;
    // initial recipes can be all my published or wishlist
    createCollection(colName, colDesc, myCreated.map((r) => r.id).slice(0, 3));
    setColName('');
    setColDesc('');
    setShowCreateCollection(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-amber-100 shadow-md"
              />
              <span className="absolute -bottom-1.5 -right-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-600 text-white shadow-xs">
                {currentUser.role}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-serif-display text-stone-900">
                  {currentUser.name}
                </h2>
                <span className="text-xs text-stone-400">@{currentUser.username}</span>
              </div>
              <p className="text-xs text-stone-600 max-w-lg leading-relaxed">
                {currentUser.bio}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentUser.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700"
                  >
                    🍴 {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Followers count and settings */}
          <div className="flex items-center sm:flex-col gap-3 shrink-0 sm:items-end">
            <div className="flex items-center gap-4 text-xs font-semibold text-stone-600">
              <span>
                <strong className="text-stone-900">{currentUser.followersCount}</strong> seguidores
              </span>
              <span>
                <strong className="text-stone-900">{currentUser.followingUserIds.length}</strong> seguidos
              </span>
            </div>

            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              Editar Perfil (RF-03)
            </button>
          </div>
        </div>

        {/* Edit profile form modal */}
        {isEditingProfile && (
          <form onSubmit={handleProfileSave} className="mt-6 pt-6 border-t border-stone-100 space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Especialidades (coma)</label>
                <input
                  type="text"
                  value={specialtiesText}
                  onChange={(e) => setSpecialtiesText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Biografía</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-3 py-1.5 text-xs text-stone-600 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold"
              >
                Guardar Perfil
              </button>
            </div>
          </form>
        )}

        {/* Subprofiles Bar (RF-03: Subperfiles familiares / dietéticos) */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-stone-700 uppercase">
              Subperfiles Familiares (RF-03):
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => switchActiveSubProfile(null)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                !currentUser.activeSubProfileId
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-stone-50 text-stone-700 border-stone-200'
              }`}
            >
              Principal (Tú)
            </button>

            {currentUser.subprofiles.map((sub) => (
              <button
                key={sub.id}
                onClick={() => switchActiveSubProfile(sub.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  currentUser.activeSubProfileId === sub.id
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-stone-50 text-stone-700 border-stone-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${sub.avatarColor}`} />
                <span>{sub.name} ({sub.relation})</span>
              </button>
            ))}

            <button
              onClick={() => setShowAddSubProfile(!showAddSubProfile)}
              className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-100 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Añadir Subperfil
            </button>
          </div>
        </div>

        {/* Add Subprofile Form */}
        {showAddSubProfile && (
          <form onSubmit={handleAddSubSubmit} className="mt-3 p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-3">
            <h4 className="text-xs font-bold text-amber-950 uppercase">Nuevo Subperfil Familiar</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Nombre (ej. Niños, Abuela)"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                className="px-3 py-1.5 bg-white rounded-xl border border-stone-300 text-xs"
              />
              <input
                type="text"
                placeholder="Relación (ej. Hijos, Padres)"
                value={subRelation}
                onChange={(e) => setSubRelation(e.target.value)}
                className="px-3 py-1.5 bg-white rounded-xl border border-stone-300 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddSubProfile(false)}
                className="px-3 py-1 text-xs text-stone-600 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold"
              >
                Crear Subperfil
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Profile Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-stone-200">
        <button
          onClick={() => setActiveTab('creadas')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'creadas'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Mis Recetas ({myCreated.length})
        </button>

        <button
          onClick={() => setActiveTab('borradores')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'borradores'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Borradores (RF-08: {myDrafts.length})
        </button>

        <button
          onClick={() => setActiveTab('programadas')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'programadas'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Programadas (RF-09: {myScheduled.length})
        </button>

        <button
          onClick={() => setActiveTab('colecciones')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'colecciones'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <FolderHeart className="w-4 h-4" />
          Colecciones & Packs (RF-30)
        </button>

        <button
          onClick={() => setActiveTab('deseos')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'deseos'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Lista de Deseos (RF-24: {myWishlist.length})
        </button>

        <button
          onClick={() => setActiveTab('explorar_cocineros')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'explorar_cocineros'
              ? 'border-amber-600 text-amber-800'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Search className="w-4 h-4" />
          Buscar Cocineros (RF-21)
        </button>
      </div>

      {/* Pinned Recipe at top of Profile (RF-17) */}
      {pinnedRecipe && activeTab === 'creadas' && (
        <div className="p-4 rounded-3xl bg-amber-50 border-2 border-amber-300 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase">
            <Pin className="w-4 h-4 text-amber-700" />
            Receta Estrella Fijada en Perfil (RF-17)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-white p-4 rounded-2xl border border-amber-200">
            <img
              src={pinnedRecipe.coverImage}
              alt={pinnedRecipe.title}
              className="w-full h-44 rounded-xl object-cover"
            />
            <div className="space-y-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 uppercase">
                {pinnedRecipe.category}
              </span>
              <h3 className="font-bold font-serif-display text-lg text-stone-900">
                {pinnedRecipe.title}
              </h3>
              <p className="text-xs text-stone-600 line-clamp-2">{pinnedRecipe.description}</p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => onOpenDetail(pinnedRecipe)}
                  className="px-4 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold"
                >
                  Ver Receta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Creadas */}
      {activeTab === 'creadas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-700 uppercase">
              Recetas Publicadas por Ti
            </h3>
            <button
              onClick={onCreateRecipe}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-amber-700"
            >
              <Plus className="w-4 h-4" />
              Nueva Receta
            </button>
          </div>

          {myCreated.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-stone-200 text-stone-500 text-xs">
              Aún no has publicado recetas. ¡Crea tu primera obra culinaria!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Tab: Borradores (RF-08, RF-13) */}
      {activeTab === 'borradores' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-stone-700 uppercase">
            Borradores Privados en Desarrollo (RF-08)
          </h3>
          {myDrafts.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-stone-200 text-stone-500 text-xs">
              No tienes borradores pendientes. Al crear una receta puedes elegir "Guardar como borrador" para continuar editándola después.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myDrafts.map((recipe) => (
                <div key={recipe.id} className="relative">
                  <RecipeCard
                    recipe={recipe}
                    onOpenDetail={onOpenDetail}
                  />
                  <div className="p-3 bg-stone-100 rounded-b-2xl -mt-4 border border-stone-200 flex justify-end">
                    <button
                      onClick={() => onEditRecipe(recipe)}
                      className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs"
                    >
                      Continuar Editando
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Programadas (RF-09) */}
      {activeTab === 'programadas' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-stone-700 uppercase">
            Publicaciones Automatizadas con Fecha y Hora (RF-09)
          </h3>
          {myScheduled.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-stone-200 text-stone-500 text-xs">
              No tienes recetas programadas actualmente. Al redactar una receta puedes seleccionar "Programar Lanzamiento" y fijar la fecha futura.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Tab: Colecciones & Exportación Semanal (RF-06, RF-30) */}
      {activeTab === 'colecciones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-700 uppercase">
                Colecciones & Planificadores Semanales (RF-30)
              </h3>
              <p className="text-xs text-stone-500">
                Agrupa tus recetas para menús familiares y descárgalos como paquetes
              </p>
            </div>
            <button
              onClick={() => setShowCreateCollection(!showCreateCollection)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-amber-700"
            >
              <Plus className="w-4 h-4" />
              Nueva Colección
            </button>
          </div>

          {showCreateCollection && (
            <form onSubmit={handleCreateCollectionSubmit} className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-stone-800 uppercase">Crear Colección Culinaria</h4>
              <input
                type="text"
                required
                placeholder="Nombre de la colección (ej. Cenas Rápidas Sin Gluten)"
                value={colName}
                onChange={(e) => setColName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
              <textarea
                rows={2}
                placeholder="Descripción del recetario..."
                value={colDesc}
                onChange={(e) => setColDesc(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCollection(false)}
                  className="px-3 py-1.5 text-xs text-stone-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-xl"
                >
                  Guardar Colección
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myCollections.map((col) => {
              const colRecipes = recipes.filter((r) => col.recipeIds.includes(r.id));
              return (
                <div key={col.id} className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-base text-stone-900 font-serif-display">{col.name}</h4>
                      <p className="text-xs text-stone-500 mt-0.5">{col.description}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                      {col.recipeIds.length} recetas
                    </span>
                  </div>

                  <div className="flex gap-2 overflow-x-auto py-1">
                    {colRecipes.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => onOpenDetail(r)}
                        className="w-24 shrink-0 rounded-xl overflow-hidden border border-stone-200 cursor-pointer hover:opacity-90"
                      >
                        <img src={r.coverImage} alt={r.title} className="w-full h-16 object-cover" />
                        <div className="p-1 text-[10px] font-semibold truncate text-stone-800">{r.title}</div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400">
                      Formato de descarga semanal disponible
                    </span>
                    <button
                      onClick={() => exportCollectionPackage(col)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Exportar Paquete JSON (RF-30)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Lista de Deseos (RF-24) */}
      {activeTab === 'deseos' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-stone-700 uppercase">
            Recetas en tu Lista de Deseos (RF-24)
          </h3>
          {myWishlist.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-stone-200 text-stone-500 text-xs">
              No tienes recetas guardadas en tu lista de deseos. Presiona el icono de marcador en cualquier receta para guardarla para más tarde.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Tab: Explorar y Buscar Cocineros (RF-21, RF-19, RF-20) */}
      {activeTab === 'explorar_cocineros' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-stone-700 uppercase">
                Búsqueda de Perfiles & Comunidad (RF-21)
              </h3>
              <p className="text-xs text-stone-500">
                Encuentra otros creadores culinarios, síguelos y personaliza tu feed (RF-19)
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por alias o especialidad..."
                value={profileSearchQuery}
                onChange={(e) => setProfileSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredUsers.map((user) => {
              const isFollowing = currentUser.followingUserIds.includes(user.id);
              const isMe = user.id === currentUser.id;
              return (
                <div
                  key={user.id}
                  className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-amber-200"
                      />
                      <div className="truncate">
                        <div className="font-bold text-sm text-stone-900 truncate">{user.name}</div>
                        <div className="text-[11px] text-stone-400">@{user.username}</div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 uppercase">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {user.bio}
                    </p>

                    <div className="text-[11px] text-stone-500">
                      <strong>{user.followersCount}</strong> seguidores
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 mt-3">
                    {!isMe ? (
                      <>
                        <button
                          onClick={() => followUserToggle(user.id)}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            isFollowing
                              ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                              : 'bg-amber-600 text-white hover:bg-amber-700'
                          }`}
                        >
                          {isFollowing ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              Siguiendo
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              Seguir
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => onOpenReport('profile', user.id, user.name)}
                          title="Denunciar perfil de usuario (RF-20)"
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-stone-400 font-semibold italic">
                        Tu perfil activo
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
