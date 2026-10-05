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
import { FeaturedRecipesPanel } from './components/FeaturedRecipesPanel';
import { CommunityForumView } from './components/CommunityForumView';
import { UserProfileView } from './components/UserProfileView';
import { ModerationAdminPanel } from './components/ModerationAdminPanel';
import { PrintRecipeView } from './components/PrintRecipeView';
import { AuthModals } from './components/AuthModals';
import { ReportModal } from './components/ReportModal';
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

  // Search & Filter State (RF-07, RF-16)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [selectedTags, setSelectedTags] = useState<DietaryTag[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('todas');
  const [maxTime, setMaxTime] = useState(180);
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'time' | 'calories'>('popular');

  // Modals state
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState<Recipe | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  
  // Report modal state (RF-11, RF-20)
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
      if (recipe.status === 'draft' && recipe.authorId !== currentUser.id) {
        return false;
      }

      // Search query filter (RF-16: keyword, ingredient, title)
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

      // Dietary tags filter (RF-07: vegetarian, vegan, celiac, diabetic, keto...)
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
    setRecipeToEdit(recipe);
    setIsEditorOpen(true);
  };

  const handleCreateNewRecipe = () => {
    setRecipeToEdit(null);
    setIsEditorOpen(true);
  };

  // If printable recipe is triggered (RF-31), render full screen print preview!
  if (printableRecipe) {
    return (
      <PrintRecipeView
        recipe={printableRecipe}
        onClose={() => setPrintableRecipe(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/60 text-stone-800 flex flex-col justify-between">
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
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        {/* VIEW 1: Explorar Recetas (Catálogo con filtros avanzados) */}
        {activeView === 'explorar' && (
          <div className="space-y-6">
            {/* Hero Welcome Banner */}
            <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 rounded-3xl p-6 sm:p-10 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-amber-100">
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  Gusto • Tu Cocina Inteligente
                </div>
                <h1 className="text-2xl sm:text-4xl font-bold font-serif-display leading-tight">
                  Descubre, cocina y comparte recetas extraordinarias
                </h1>
                <p className="text-amber-100 text-xs sm:text-sm leading-relaxed">
                  Filtros nutricionales avanzados (Sin TACC, Vegano, Keto, Diabéticos), compra directa de ingredientes en tiendas de cercanía, comparación lado a lado y comunidad gastronómica.
                </p>
              </div>
              <div className="absolute right-[-20px] bottom-[-20px] w-64 h-64 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
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
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Catálogo Gastronómico ({filteredRecipes.length} recetas encontradas)
                </h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-amber-700 hover:underline font-semibold"
                  >
                    Restablecer filtros
                  </button>
                )}
              </div>

              {filteredRecipes.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/90 space-y-3">
                  <ChefHat className="w-12 h-12 text-stone-300 mx-auto" />
                  <h3 className="font-bold text-stone-800 text-base">No se encontraron recetas</h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Prueba ajustando los filtros dietéticos, ampliando el tiempo de cocción o buscando otros ingredientes.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Limpiar todos los filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onOpenDetail={(r) => setSelectedRecipeDetail(r)}
                      onOpenReport={(r) => handleOpenReport('recipe', r.id, r.title)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: Recetas Destacadas (RF-05) */}
        {activeView === 'destacadas' && (
          <FeaturedRecipesPanel
            onOpenDetail={(r) => setSelectedRecipeDetail(r)}
          />
        )}

        {/* VIEW 3: Sistema de Foros de la Comunidad */}
        {activeView === 'foro' && (
          <CommunityForumView />
        )}

        {/* VIEW 4: Comparador de Recetas (RF-18) */}
        {activeView === 'comparar' && (
          <RecipeCompareView
            onOpenDetail={(r) => setSelectedRecipeDetail(r)}
            onExploreMore={() => setActiveView('explorar')}
          />
        )}

        {/* VIEW 5: Mi Espacio Personal & Perfil (RF-03, RF-06, RF-24, RF-30) */}
        {activeView === 'perfil' && (
          <UserProfileView
            onOpenDetail={(r) => setSelectedRecipeDetail(r)}
            onOpenReport={handleOpenReport}
            onEditRecipe={handleEditRecipe}
            onCreateRecipe={handleCreateNewRecipe}
          />
        )}

        {/* VIEW 6: Panel de Moderación (RF-11, RF-20) */}
        {activeView === 'moderacion' && (
          <ModerationAdminPanel />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-8 mt-12 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-stone-900 font-serif-display text-sm">Gusto</span>
            <span>— Sistema Integral de Gestión de Recetas & Comunidad Gastronómica</span>
          </div>

          <div className="flex items-center gap-4 text-stone-600">
            <span>Cumple Requisitos Funcionales RF-01 al RF-31</span>
            <span>•</span>
            <button
              onClick={() => setActiveView('moderacion')}
              className="hover:text-red-700 font-semibold"
            >
              Políticas de Seguridad
            </button>
          </div>
        </div>
      </footer>

      {/* Modals and Drawers */}
      <RecipeDetailModal
        recipe={selectedRecipeDetail}
        onClose={() => setSelectedRecipeDetail(null)}
        onEditRecipe={handleEditRecipe}
        onOpenReport={(r) => handleOpenReport('recipe', r.id, r.title)}
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
