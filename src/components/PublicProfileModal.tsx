import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Recipe, UserProfile } from '../types';
import { RecipeCard } from './RecipeCard';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import {
  X,
  MapPin,
  ChefHat,
  UserPlus,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Sparkles,
  UtensilsCrossed,
  Users
} from 'lucide-react';

interface PublicProfileModalProps {
  authorId: string | null;
  onClose: () => void;
  onOpenRecipeDetail: (recipe: Recipe) => void;
  onOpenReport?: (targetType: 'recipe' | 'profile', targetId: string, title: string) => void;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({
  authorId,
  onClose,
  onOpenRecipeDetail,
  onOpenReport,
}) => {
  const { currentUser, allUsers, recipes, followUserToggle, showToast } = useApp();

  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [authorRecipes, setAuthorRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!authorId) {
      setProfileUser(null);
      setAuthorRecipes([]);
      return;
    }

    let isMounted = true;

    async function loadAuthorProfileAndRecipes() {
      setIsLoading(true);
      try {
        // 1. Fetch User Document from Firestore users/{authorId}
        const userDocRef = doc(db, 'users', authorId!);
        const userSnap = await getDoc(userDocRef);

        let userFound: UserProfile | null = null;
        if (userSnap.exists()) {
          userFound = userSnap.data() as UserProfile;
        } else {
          // Fallback to local allUsers state
          userFound = allUsers.find((u) => u.id === authorId) || null;
        }

        if (isMounted && userFound) {
          setProfileUser(userFound);
        }

        // 2. Fetch Author Recipes from Firestore where authorId == authorId
        try {
          const recipesQuery = query(
            collection(db, 'recipes'),
            where('authorId', '==', authorId!)
          );
          const recipesSnap = await getDocs(recipesQuery);

          if (!recipesSnap.empty) {
            const fetched = recipesSnap.docs.map((d) => d.data() as Recipe);
            // Filter published (or drafts if current user is owner)
            const filtered = fetched.filter(
              (r) => r.status === 'published' || (currentUser && r.authorId === currentUser.id)
            );
            if (isMounted) setAuthorRecipes(filtered);
          } else {
            // Fallback to local recipes state
            const local = recipes.filter(
              (r) => r.authorId === authorId && (r.status === 'published' || (currentUser && r.authorId === currentUser.id))
            );
            if (isMounted) setAuthorRecipes(local);
          }
        } catch (recipesErr) {
          console.warn('[PublicProfileModal] Offline/network note when fetching recipes:', recipesErr);
          const local = recipes.filter(
            (r) => r.authorId === authorId && (r.status === 'published' || (currentUser && r.authorId === currentUser.id))
          );
          if (isMounted) setAuthorRecipes(local);
        }
      } catch (err) {
        console.warn('[PublicProfileModal] Offline/network note when fetching profile:', err);
        const localUser = allUsers.find((u) => u.id === authorId) || null;
        if (isMounted && localUser) setProfileUser(localUser);
        const localRecs = recipes.filter(
          (r) => r.authorId === authorId && (r.status === 'published' || (currentUser && r.authorId === currentUser.id))
        );
        if (isMounted) setAuthorRecipes(localRecs);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAuthorProfileAndRecipes();

    return () => {
      isMounted = false;
    };
  }, [authorId, allUsers, recipes, currentUser]);

  if (!authorId) return null;

  const isFollowing = currentUser && profileUser ? currentUser.followingUserIds.includes(profileUser.id) : false;
  const isMe = currentUser && profileUser ? currentUser.id === profileUser.id : false;

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrador', style: 'bg-red-950/80 text-red-300 border-red-800' };
      case 'editor':
        return { label: 'Editor Chef', style: 'bg-purple-950/80 text-purple-300 border-purple-800' };
      case 'premium':
        return { label: 'Chef Premium', style: 'bg-amber-950/80 text-amber-300 border-amber-800' };
      default:
        return { label: 'Chef Creador', style: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    }
  };

  const roleBadge = getRoleBadge(profileUser?.role);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto cursor-pointer animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden my-auto max-h-[92vh] flex flex-col cursor-default text-zinc-100"
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-20 bg-zinc-900/95 backdrop-blur-md px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <ChefHat className="w-4 h-4 text-amber-400" />
            <span>Perfil Público del Chef</span>
          </div>

          <div className="flex items-center gap-2">
            {profileUser && onOpenReport && !isMe && (
              <button
                type="button"
                onClick={() => onOpenReport('profile', profileUser.id, profileUser.name)}
                title="Denunciar perfil"
                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-xs text-zinc-400">Cargando perfil público del autor...</p>
            </div>
          ) : !profileUser ? (
            <div className="py-16 text-center space-y-3">
              <UtensilsCrossed className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-lg font-bold text-zinc-200">Usuario no encontrado</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                No fue posible recuperar los datos del perfil solicitado.
              </p>
            </div>
          ) : (
            <>
              {/* Profile Card Header */}
              <div className="bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-zinc-800/80 shadow-md space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 sm:gap-5">
                    <img
                      src={
                        profileUser.avatar ||
                        'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=160&auto=format&fit=crop&q=80'
                      }
                      alt={profileUser.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-amber-500/30 border-2 border-zinc-900 shadow-xl shrink-0"
                    />

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-2xl sm:text-3xl font-bold text-zinc-100">
                          {profileUser.name}
                        </h2>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${roleBadge.style}`}
                        >
                          {roleBadge.label}
                        </span>
                      </div>

                      <p className="text-sm text-amber-400 font-semibold">@{profileUser.username}</p>

                      {profileUser.location && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 pt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{profileUser.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Follow Button & Stats */}
                  <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                    {!isMe && (
                      <button
                        type="button"
                        onClick={() => {
                          followUserToggle(profileUser.id);
                          showToast(
                            isFollowing
                              ? `Dejaste de seguir a ${profileUser.name}`
                              : `¡Ahora sigues a ${profileUser.name}!`
                          );
                        }}
                        className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                          isFollowing
                            ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
                            : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="w-4 h-4" />
                            <span>Siguiendo</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            <span>+ Seguir Chef</span>
                          </>
                        )}
                      </button>
                    )}

                    <div className="flex items-center gap-4 text-xs text-zinc-400 font-medium">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          <strong className="text-zinc-100 font-bold">
                            {profileUser.followersCount || 0}
                          </strong>{' '}
                          seguidores
                        </span>
                      </div>
                      <span>•</span>
                      <div>
                        <strong className="text-zinc-100 font-bold">
                          {authorRecipes.length}
                        </strong>{' '}
                        recetas
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {profileUser.bio && (
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800/80">
                    "{profileUser.bio}"
                  </p>
                )}

                {/* Specialties & Dietary Preferences */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/80">
                  {profileUser.specialties && profileUser.specialties.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-zinc-500 uppercase mr-1">Especialidades:</span>
                      {profileUser.specialties.map((spec, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full border border-zinc-700/60 font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}

                  {profileUser.dietaryPreferences && profileUser.dietaryPreferences.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                      {profileUser.dietaryPreferences.map((pref, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-bold"
                        >
                          #{pref}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Published Recipes by this Author */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2 font-display">
                    <UtensilsCrossed className="w-5 h-5 text-amber-400" />
                    <span>Recetas Culinarias de {profileUser.name}</span>
                  </h3>
                  <span className="text-xs font-mono text-zinc-400 bg-zinc-950 border border-zinc-800 px-3 py-1 rounded-full">
                    {authorRecipes.length} {authorRecipes.length === 1 ? 'receta' : 'recetas'}
                  </span>
                </div>

                {authorRecipes.length === 0 ? (
                  <div className="bg-zinc-950 rounded-3xl p-12 text-center border border-zinc-800 space-y-3">
                    <ChefHat className="w-12 h-12 text-zinc-600 mx-auto" />
                    <h4 className="font-bold text-zinc-200 text-base">
                      Este autor aún no tiene recetas publicadas
                    </h4>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      Vuelve pronto para descubrir las próximas creaciones gastronómicas de este creador.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {authorRecipes.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onOpenDetail={(r) => {
                          onOpenRecipeDetail(r);
                        }}
                        onOpenReport={
                          onOpenReport ? (r) => onOpenReport('recipe', r.id, r.title) : undefined
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
