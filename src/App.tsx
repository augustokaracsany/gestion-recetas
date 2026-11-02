/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DietaryTag, Recipe } from './types';
import { Navbar } from './components/Navbar';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { RecipeEditorModal } from './components/RecipeEditorModal';
import { RecipeFilterBar } from './components/RecipeFilterBar';
import { RecipeCompareView } from './components/RecipeCompareView';
import { ShoppingCartDrawer } from './components/ShoppingCartDrawer';
import { MultiRecipeShoppingModal } from './components/MultiRecipeShoppingModal';
import { FeaturedRecipesPanel } from './components/FeaturedRecipesPanel';
import { CommunityForumView } from './components/CommunityForumView';
import { UserProfileView } from './components/UserProfileView';
import { ModerationAdminPanel } from './components/ModerationAdminPanel';
import { PrintRecipeView } from './components/PrintRecipeView';
import { AuthModals } from './components/AuthModals';
import { ReportModal } from './components/ReportModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { PublicProfileModal } from './components/PublicProfileModal';
import {
  Sparkles,
  ChefHat,
  Search,
  Filter,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  ShoppingBag,
  HeartHandshake
} from 'lucide-react';

function AppContent() {
  const {
    recipes,
    currentUser,
    printableRecipe,
    setPrintableRecipe,
    toast,
  } = useApp();

  // Navigation view: 'explorar' | 'destacadas' | 'foro' | 'comparar' | 'perfil' | 'moderacion'
  const [activeView, setActiveView] = useState<string>('explorar');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [selectedTags, setSelectedTags] = useState<DietaryTag[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('todas');
  const [maxTime, setMaxTime] = useState(180);
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'time' | 'calories' | 'comentarios'>('popular');

  // Modals state
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState<Recipe | null>(null);
  const [selectedPublicAuthorId, setSelectedPublicAuthorId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMultiRecipeOpen, setIsMultiRecipeOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  
  // Report modal state
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    type: 'recipe' | 'profile';
    id: string;
    title: string;
  }>({ type: 'recipe', id: '', title: '' });

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = selectedTags.length;
    if (selectedCategory !== 'todas') count += 1;
    if (selectedDifficulty !== 'todas') count += 1;
    if (maxTime < 180) count += 1;
    if (searchQuery.trim().length > 0) count += 1;
    return count;
  }, [selectedTags, selectedCategory, selectedDifficulty, maxTime, searchQuery]);

  const handleClearFilters = () => {
    setSelectedTags([]);
    setSelectedCategory('todas');
    setSelectedDifficulty('todas');
    setMaxTime(180);
    setSearchQuery('');
  };

  // Filter recipes logic
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      // If exploring, hide drafts unless current user is author
      if (recipe.status === 'draft' && (!currentUser || recipe.authorId !== currentUser.id)) {
        return false;
      }

      // Search query filter (keyword, ingredient, title)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = recipe.title.toLowerCase().includes(q);
        const matchesDesc = recipe.description.toLowerCase().includes(q);
        const matchesIngredient = recipe.ingredients.some((ing) =>
          ing.name.toLowerCase().includes(q)
        );
        const matchesAuthor = recipe.authorName.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesIngredient && !matchesAuthor) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'todas' && recipe.category !== selectedCategory) {
        return false;
      }

      // Dietary tags filter (vegetarian, vegan, celiac, diabetic, keto...)
      if (selectedTags.length > 0) {
        const hasAllTags = selectedTags.every((tag) => recipe.tags.includes(tag));
        if (!hasAllTags) return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== 'todas' && recipe.difficulty !== selectedDifficulty) {
        return false;
      }

      // Time filter
      const totalTime = recipe.prepTimeMin + recipe.cookTimeMin;
      if (totalTime > maxTime) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') return b.likesCount - a.likesCount;
      if (sortBy === 'comentarios') return (b.commentsCount || 0) - (a.commentsCount || 0);
      if (sortBy === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'time') return (a.prepTimeMin + a.cookTimeMin) - (b.prepTimeMin + b.cookTimeMin);
      if (sortBy === 'calories') return a.nutrition.calories - b.nutrition.calories;
      return 0;
    });
  }, [recipes, searchQuery, selectedCategory, selectedTags, selectedDifficulty, maxTime, sortBy, currentUser]);

  const handleOpenReport = (type: 'recipe' | 'profile', id: string, title: string) => {
    setReportTarget({ type, id, title });
    setIsReportOpen(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    if (!currentUser) {
      setAuthInitialMode('login');
      setIsAuthOpen(true);
      return;
    }
    setRecipeToEdit(recipe);
    setIsEditorOpen(true);
  };

  const handleCreateNewRecipe = () => {
    if (!currentUser) {
      setAuthInitialMode('login');
      setIsAuthOpen(true);
      return;
    }
    setRecipeToEdit(null);
    setIsEditorOpen(true);
  };

  // If printable recipe is triggered, render full screen print preview!
  if (printableRecipe) {
    return (
      <PrintRecipeView
        recipe={printableRecipe}
        onClose={() => setPrintableRecipe(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-amber-500 selection:text-zinc-950">
      {/* Navbar with role switcher, notifications, cart badge */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenCreateRecipe={handleCreateNewRecipe}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={(mode) => {
          setAuthInitialMode(mode || 'login');
          setIsAuthOpen(true);
        }}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 flex-1 w-full animate-fade-in">
        {/* VIEW 1: Explorar Recetas (Catálogo con filtros avanzados) */}
        {activeView === 'explorar' && (
          <div className="space-y-6">
            {/* Hero / Title Header with Gourmet Dark Aesthetic */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>Colección Culinaria Exclusiva</span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight text-zinc-100 font-bold">
                  Explorar Recetas <span className="text-amber-400 font-serif-display italic font-normal">de Autor</span>
                </h1>
                <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
                  Descubre creaciones gastronómicas minuciosamente detalladas por chefs independientes y apasionados del buen comer.
                </p>
              </div>

              {/* Quick Metrics Counter Badge */}
              <div className="flex items-center gap-4 bg-zinc-900/90 px-5 py-3.5 rounded-2xl border border-zinc-800 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.6)] self-start md:self-auto glow-amber-hover">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">soup_kitchen</span>
                </div>
                <div>
                  <span className="block text-xl font-bold text-zinc-100 leading-none">2,840+</span>
                  <span className="text-xs text-zinc-400">Recetas verificadas</span>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <RecipeFilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              selectedDifficulty={selectedDifficulty}
              setSelectedDifficulty={setSelectedDifficulty}
              maxTime={maxTime}
              setMaxTime={setMaxTime}
              sortBy={sortBy}
              setSortBy={setSortBy}
              activeFilterCount={activeFilterCount}
              onClearFilters={handleClearFilters}
            />

            {/* Recipe Grid */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Catálogo Gastronómico ({filteredRecipes.length} recetas disponibles)</span>
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsMultiRecipeOpen(true)}
                    className="text-xs font-bold text-zinc-950 bg-amber-500 hover:bg-amber-400 px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transform hover:-translate-y-0.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-zinc-950" />
                    <span>Compra Multi-Receta Consolidada</span>
                  </button>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={handleClearFilters}
                      className="text-xs text-amber-400 hover:text-amber-300 hover:underline font-semibold cursor-pointer"
                    >
                      Restablecer filtros
                    </button>
                  )}
                </div>
              </div>

              {filteredRecipes.length === 0 ? (
                <div className="bg-zinc-900/80 rounded-3xl p-12 text-center border border-zinc-800 space-y-4">
                  <span className="material-symbols-outlined text-[48px] text-zinc-600">dinner_dining</span>
                  <h3 className="font-bold text-zinc-200 text-lg">No se encontraron recetas</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
                    Prueba ajustando los filtros dietéticos, ampliando el tiempo de cocción o buscando otros ingredientes.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    Limpiar todos los filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onOpenDetail={(r) => setSelectedRecipeDetail(r)}
                      onOpenAuthorProfile={(id) => setSelectedPublicAuthorId(id)}
                      onOpenReport={(r) => handleOpenReport('recipe', r.id, r.title)}
                    />
                  ))}
                </div>
              )}

              {/* Bottom Pagination Info */}
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 py-6 border-t border-zinc-800/80">
                <div className="flex items-center gap-2 text-zinc-400 text-xs sm:text-sm">
                  <span>Mostrando <strong className="text-zinc-200">1 - {filteredRecipes.length}</strong> de <strong className="text-zinc-200">{recipes.length}</strong> recetas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-400 font-semibold tracking-wider">Gusto · Cocina de Autor</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Recetas Destacadas */}
        {activeView === 'destacadas' && (
          <FeaturedRecipesPanel
            onOpenDetail={(r) => setSelectedRecipeDetail(r)}
            onOpenAuthorProfile={(id) => setSelectedPublicAuthorId(id)}
            onCreateRecipe={handleCreateNewRecipe}
          />
        )}

        {/* VIEW 3: Sistema de Foros de la Comunidad */}
        {activeView === 'foro' && (
          <CommunityForumView
            onOpenAuthorProfile={(id) => setSelectedPublicAuthorId(id)}
          />
        )}

        {/* VIEW 4: Comparador de Recetas */}
        {activeView === 'comparar' && (
          <RecipeCompareView
            onOpenDetail={(r) => setSelectedRecipeDetail(r)}
            onExploreMore={() => setActiveView('explorar')}
          />
        )}

        {/* VIEW 5: Mi Espacio Personal & Perfil */}
        {activeView === 'perfil' && (
          <UserProfileView
            onOpenDetail={(r) => setSelectedRecipeDetail(r)}
            onOpenReport={handleOpenReport}
            onEditRecipe={handleEditRecipe}
            onCreateRecipe={handleCreateNewRecipe}
            onOpenAuth={(mode) => {
              setAuthInitialMode(mode || 'login');
              setIsAuthOpen(true);
            }}
          />
        )}

        {/* VIEW 6: Panel de Moderación */}
        {activeView === 'moderacion' && (
          currentUser?.role === 'admin' ? (
            <ModerationAdminPanel />
          ) : (
            <div className="bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-800 space-y-4 max-w-lg mx-auto my-12 shadow-2xl">
              <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto" />
              <h3 className="font-bold text-zinc-100 text-lg">Acceso Restringido</h3>
              <p className="text-xs text-zinc-400">
                La sección de moderación está reservada exclusivamente para administradores de la plataforma.
              </p>
              <button
                type="button"
                onClick={() => setActiveView('explorar')}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Volver a Explorar
              </button>
            </div>
          )
        )}
      </main>

      {/* Footer in Gourmet Dark */}
      <footer className="w-full bg-zinc-950 border-t border-zinc-900 py-10 mt-16 text-zinc-400">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className="material-symbols-outlined text-amber-400 text-[28px] drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                room_service
              </span>
              <h2 className="font-display text-xl font-bold text-zinc-100 tracking-tight">Gusto</h2>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Sistema integral de gestión de recetas & Comunidad gastronómica
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-zinc-500">Plataforma Gastronómica de Recetas</span>
            <button
              onClick={() => setActiveView('moderacion')}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 font-medium transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-amber-400 text-[18px]">verified_user</span>
              <span>Políticas de seguridad</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals and Drawers */}
      <RecipeDetailModal
        recipe={selectedRecipeDetail}
        onClose={() => setSelectedRecipeDetail(null)}
        onEditRecipe={handleEditRecipe}
        onOpenAuthorProfile={(id) => setSelectedPublicAuthorId(id)}
        onOpenReport={(r) => handleOpenReport('recipe', r.id, r.title)}
      />

      <PublicProfileModal
        authorId={selectedPublicAuthorId}
        onClose={() => setSelectedPublicAuthorId(null)}
        onOpenRecipeDetail={(r) => setSelectedRecipeDetail(r)}
        onOpenReport={handleOpenReport}
      />

      <RecipeEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setRecipeToEdit(null);
        }}
        recipeToEdit={recipeToEdit}
      />

      <ShoppingCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpenMultiRecipe={() => setIsMultiRecipeOpen(true)}
      />

      <MultiRecipeShoppingModal
        isOpen={isMultiRecipeOpen}
        onClose={() => setIsMultiRecipeOpen(false)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <AuthModals
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authInitialMode}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType={reportTarget.type}
        targetId={reportTarget.id}
        targetTitle={reportTarget.title}
      />

      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
      />

      {/* Toast Notification Popup */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-stone-700 text-xs sm:text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
