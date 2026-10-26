import React, { useState } from 'react';
import { Recipe, Ingredient, Step, DietaryTag, RecipeStatus } from '../types';
import { useApp } from '../context/AppContext';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Video,
  Sparkles,
  Users,
  Image as ImageIcon,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface RecipeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeToEdit?: Recipe | null;
}

const PRESET_COVERS = [
  { label: 'Pan Rústico', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80' },
  { label: 'Pasta Pesto', url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&auto=format&fit=crop&q=80' },
  { label: 'Bowl Saludable', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80' },
  { label: 'Postre / Cheesecake', url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&auto=format&fit=crop&q=80' },
  { label: 'Curry / Estofado', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80' },
  { label: 'Sopa Gourmet', url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80' },
];

export const RecipeEditorModal: React.FC<RecipeEditorModalProps> = ({
  isOpen,
  onClose,
  recipeToEdit,
}) => {
  const { currentUser, allUsers, createRecipe, updateRecipe, showToast } = useApp();

  const [title, setTitle] = useState(recipeToEdit?.title || '');
  const [description, setDescription] = useState(recipeToEdit?.description || '');
  const [coverImage, setCoverImage] = useState(recipeToEdit?.coverImage || PRESET_COVERS[0].url);
  const [prepTimeMin, setPrepTimeMin] = useState(recipeToEdit?.prepTimeMin || 20);
  const [cookTimeMin, setCookTimeMin] = useState(recipeToEdit?.cookTimeMin || 30);
  const [servings, setServings] = useState(recipeToEdit?.servings || 4);
  const [difficulty, setDifficulty] = useState<Recipe['difficulty']>(recipeToEdit?.difficulty || 'facil');
  const [category, setCategory] = useState<Recipe['category']>(recipeToEdit?.category || 'platos_fuertes');
  const [tags, setTags] = useState<DietaryTag[]>(recipeToEdit?.tags || ['vegetariano']);
  const [videoUrl, setVideoUrl] = useState(recipeToEdit?.videoUrl || '');
  const [coAuthorsText, setCoAuthorsText] = useState(recipeToEdit?.coAuthors.join(', ') || '');
  
  // Publication Status & Scheduling
  const [status, setStatus] = useState<RecipeStatus>(recipeToEdit?.status || 'published');
  const [scheduledDate, setScheduledDate] = useState(
    recipeToEdit?.scheduledPublishDate
      ? new Date(recipeToEdit.scheduledPublishDate).toISOString().slice(0, 16)
      : new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16)
  );

  // Ingredients
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipeToEdit?.ingredients || [
      {
        id: 'ing-custom-1',
        name: 'Aceite de oliva virgen extra',
        quantity: 30,
        unit: 'ml',
        estimatedPrice: 1.5,
        storeName: 'Supermercado Central Gourmet',
        storeLocation: 'Av. Libertador 880',
        inStock: true,
        stockLevel: 'alto',
        category: 'frescos'
      },
      {
        id: 'ing-custom-2',
        name: 'Ajo fresco triturado',
        quantity: 2,
        unit: 'dientes',
        estimatedPrice: 0.4,
        storeName: 'Mercado Fresco Orgánico',
        storeLocation: 'Paseo de la Ribera 45',
        inStock: true,
        stockLevel: 'alto',
        category: 'frescos'
      }
    ]
  );

  // Steps
  const [steps, setSteps] = useState<Step[]>(
    recipeToEdit?.steps || [
      {
        stepNumber: 1,
        title: 'Preparación y mise en place',
        description: 'Lavar y cortar todos los ingredientes frescos según las medidas indicadas.',
        durationMinutes: 10,
        tip: 'Tener todo pesado y listo antes de calentar sartenes u ollas.'
      },
      {
        stepNumber: 2,
        title: 'Cocción principal',
        description: 'Cocinar a fuego moderado removiendo constantemente hasta alcanzar el punto deseado.',
        durationMinutes: 20
      }
    ]
  );

  // Nutrition
  const [calories, setCalories] = useState(recipeToEdit?.nutrition.calories || 320);
  const [proteinG, setProteinG] = useState(recipeToEdit?.nutrition.proteinG || 12);
  const [carbsG, setCarbsG] = useState(recipeToEdit?.nutrition.carbsG || 35);
  const [fatG, setFatG] = useState(recipeToEdit?.nutrition.fatG || 14);
  const [fiberG, setFiberG] = useState(recipeToEdit?.nutrition.fiberG || 5);

  if (!isOpen) return null;

  const toggleTag = (tag: DietaryTag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddIngredient = () => {
    const newIng: Ingredient = {
      id: `ing-${Date.now()}`,
      name: '',
      quantity: 1,
      unit: 'unidad',
      estimatedPrice: 1.0,
      storeName: 'Mercado Fresco Orgánico',
      storeLocation: 'Centro',
      inStock: true,
      stockLevel: 'alto',
      category: 'frescos'
    };
    setIngredients((prev) => [...prev, newIng]);
  };

  const handleRemoveIngredient = (idx: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateIngredient = (idx: number, field: keyof Ingredient, value: any) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === idx ? { ...ing, [field]: value } : ing))
    );
  };

  const handleAddStep = () => {
    const nextStepNum = steps.length + 1;
    const newStep: Step = {
      stepNumber: nextStepNum,
      title: `Paso ${nextStepNum}`,
      description: '',
      durationMinutes: 10
    };
    setSteps((prev) => [...prev, newStep]);
  };

  const handleRemoveStep = (idx: number) => {
    setSteps((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, stepNumber: i + 1 }))
    );
  };

  const handleUpdateStep = (idx: number, field: keyof Step, value: any) => {
    setSteps((prev) =>
      prev.map((step, i) => (i === idx ? { ...step, [field]: value } : step))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Debes iniciar sesión para guardar o publicar una receta.');
      return;
    }
    if (!title.trim()) {
      showToast('Por favor introduce un título para la receta.');
      return;
    }

    const coAuthorsList = coAuthorsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const recipeData = {
      title,
      description,
      coverImage,
      authorId: recipeToEdit ? recipeToEdit.authorId : currentUser.id,
      authorName: recipeToEdit ? recipeToEdit.authorName : currentUser.name,
      authorAvatar: recipeToEdit ? recipeToEdit.authorAvatar : currentUser.avatar,
      coAuthors: coAuthorsList,
      status,
      scheduledPublishDate: status === 'scheduled' ? new Date(scheduledDate).toISOString() : undefined,
      prepTimeMin: Number(prepTimeMin),
      cookTimeMin: Number(cookTimeMin),
      servings: Number(servings),
      difficulty,
      category,
      tags,
      ingredients,
      steps,
      videoUrl: videoUrl.trim() || undefined,
      nutrition: {
        calories: Number(calories),
        proteinG: Number(proteinG),
        carbsG: Number(carbsG),
        fatG: Number(fatG),
        fiberG: Number(fiberG)
      }
    };

    if (recipeToEdit) {
      updateRecipe(recipeToEdit.id, recipeData);
    } else {
      createRecipe(recipeData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-amber-600 px-6 py-4 text-white flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-200" />
            <div>
              <h2 className="font-bold text-lg leading-tight">
                {recipeToEdit ? 'Editar Receta' : 'Nueva Creación Culinaria'}
              </h2>
              <p className="text-xs text-amber-100">
                Estructura ingredientes, paso a paso, etiquetas dietéticas y programación
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-200 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Título de la Receta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Tarta de Manzanas Caramelizadas Sin Gluten"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Descripción / Historia breve
                </label>
                <textarea
                  rows={3}
                  placeholder="Explica qué hace especial a este plato, texturas, aromas..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Recipe['category'])}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden capitalize"
                  >
                    <option value="platos_fuertes">Platos Fuertes</option>
                    <option value="pastas">Pastas</option>
                    <option value="panaderia">Panadería & Masas</option>
                    <option value="ensaladas">Ensaladas & Bowls</option>
                    <option value="sopas">Sopas & Cremas</option>
                    <option value="postres">Postres & Dulces</option>
                    <option value="desayunos">Desayunos & Brunch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Dificultad
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Recipe['difficulty'])}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden capitalize"
                  >
                    <option value="facil">Fácil</option>
                    <option value="media">Media</option>
                    <option value="dificil">Avanzada / Chef</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                    Prep (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={prepTimeMin}
                    onChange={(e) => setPrepTimeMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                    Cocción (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cookTimeMin}
                    onChange={(e) => setCookTimeMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                    Raciones
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={servings}
                    onChange={(e) => setServings(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Cover image & Co-authors */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  Foto de Portada (URL o Presets)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                    placeholder="https://..."
                  />
                </div>
                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {PRESET_COVERS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setCoverImage(preset.url)}
                      className={`text-[10px] px-2 py-1 rounded-lg border font-medium transition-colors ${
                        coverImage === preset.url
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                {/* Image preview */}
                <div className="mt-2 h-28 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                  <img src={coverImage} alt="Vista previa" className="w-full h-full object-cover" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  Co-autores Colaborativos
                </label>
                <input
                  type="text"
                  placeholder="Ej. Lucía Valenzuela, Camila Ríos (separados por coma)"
                  value={coAuthorsText}
                  onChange={(e) => setCoAuthorsText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[10px] text-stone-500 mt-1">
                  Permite compartir la autoría y atribución pública entre dos o más cocineros.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-red-600" />
                  Video Explicativo YouTube / TikTok (Premium)
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Dietary Tags */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80">
            <label className="block text-xs font-bold text-amber-950 uppercase mb-2">
              Etiquetas Dietéticas y Alérgenos
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'celiaco' as DietaryTag, label: '🌾 Sin TACC / Celíacos' },
                { id: 'vegano' as DietaryTag, label: '🌱 Vegano' },
                { id: 'vegetariano' as DietaryTag, label: '🧀 Vegetariano' },
                { id: 'diabetico' as DietaryTag, label: '🩺 Apto Diabéticos' },
                { id: 'keto' as DietaryTag, label: '🥑 Dieta Keto' },
                { id: 'sin_lactosa' as DietaryTag, label: '🥛 Sin Lactosa' },
                { id: 'bajo_sodio' as DietaryTag, label: '🧂 Bajo en Sodio' },
              ].map((item) => {
                const isSelected = tags.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleTag(item.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-100/50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Ingredients Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                  Ingredientes & Tiendas Asociadas
                </h3>
                <p className="text-xs text-stone-500">
                  Especifica cantidades, precio estimado y tienda para compra directa
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 rounded-xl text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar Ingrediente
              </button>
            </div>

            <div className="space-y-2">
              {ingredients.map((ing, idx) => (
                <div
                  key={ing.id}
                  className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-stone-50 border border-stone-200"
                >
                  <div className="col-span-4 sm:col-span-4">
                    <input
                      type="text"
                      required
                      placeholder="Nombre (ej. Harina de Almendras)"
                      value={ing.name}
                      onChange={(e) => handleUpdateIngredient(idx, 'name', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-stone-300 text-xs font-semibold focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-2">
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      placeholder="Cantidad"
                      value={ing.quantity}
                      onChange={(e) => handleUpdateIngredient(idx, 'quantity', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-stone-300 text-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Unidad (g, ml, u)"
                      value={ing.unit}
                      onChange={(e) => handleUpdateIngredient(idx, 'unit', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-stone-300 text-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="col-span-3 sm:col-span-3">
                    <select
                      value={ing.storeName}
                      onChange={(e) => handleUpdateIngredient(idx, 'storeName', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white rounded-lg border border-stone-300 text-[11px] focus:ring-1 focus:ring-amber-500 truncate"
                    >
                      <option value="Supermercado Central Gourmet">Supermercado Central</option>
                      <option value="Dietética El Trébol Verde">Dietética El Trébol</option>
                      <option value="Mercado Fresco Orgánico">Mercado Fresco</option>
                      <option value="Molino & Cereal San Jorge">Molino San Jorge</option>
                    </select>
                  </div>

                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      disabled={ingredients.length <= 1}
                      className="p-1 text-stone-400 hover:text-red-600 disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Steps Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                  Paso a Paso de la Elaboración
                </h3>
                <p className="text-xs text-stone-500">
                  Desglosa la receta con instrucciones claras y tiempos
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddStep}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 rounded-xl text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar Paso
              </button>
            </div>

            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-600 text-white">
                      Paso {step.stepNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <input
                          type="number"
                          min="1"
                          value={step.durationMinutes}
                          onChange={(e) => handleUpdateStep(idx, 'durationMinutes', Number(e.target.value))}
                          className="w-14 px-2 py-1 bg-white rounded-lg border border-stone-300 text-xs text-center"
                        />
                        <span className="text-stone-500">min</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        disabled={steps.length <= 1}
                        className="p-1 text-stone-400 hover:text-red-600 disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Título breve del paso (ej. Amasado y reposo)"
                    value={step.title}
                    onChange={(e) => handleUpdateStep(idx, 'title', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white rounded-xl border border-stone-300 text-xs font-semibold focus:ring-1 focus:ring-amber-500"
                  />

                  <textarea
                    rows={2}
                    required
                    placeholder="Instrucciones detalladas de este paso..."
                    value={step.description}
                    onChange={(e) => handleUpdateStep(idx, 'description', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white rounded-xl border border-stone-300 text-xs focus:ring-1 focus:ring-amber-500 resize-none"
                  />

                  <input
                    type="text"
                    placeholder="Consejo o truco opcional para el paso (ej. Humedece tus manos con agua)"
                    value={step.tip || ''}
                    onChange={(e) => handleUpdateStep(idx, 'tip', e.target.value)}
                    className="w-full px-3 py-1 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs text-amber-900 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Nutritional Info Estimation */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <h4 className="text-xs font-bold text-stone-700 uppercase mb-2">
              Información Nutricional por Porción
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-stone-500 block mb-0.5">Calorías (kcal)</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white rounded-lg border border-stone-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-500 block mb-0.5">Proteínas (g)</label>
                <input
                  type="number"
                  value={proteinG}
                  onChange={(e) => setProteinG(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white rounded-lg border border-stone-300 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-500 block mb-0.5">Carbohidratos (g)</label>
                <input
                  type="number"
                  value={carbsG}
                  onChange={(e) => setCarbsG(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white rounded-lg border border-stone-300 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-500 block mb-0.5">Grasas (g)</label>
                <input
                  type="number"
                  value={fatG}
                  onChange={(e) => setFatG(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white rounded-lg border border-stone-300 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-500 block mb-0.5">Fibra (g)</label>
                <input
                  type="number"
                  value={fiberG}
                  onChange={(e) => setFiberG(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-white rounded-lg border border-stone-300 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Publication Options: Draft vs Publish vs Schedule */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
            <h4 className="text-xs font-bold text-amber-950 uppercase flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-700" />
              Estado de Publicación & Programación
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label
                className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                  status === 'published'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-stone-700 border-amber-200'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={status === 'published'}
                  onChange={() => setStatus('published')}
                  className="sr-only"
                />
                <CheckCircle className="w-4 h-4 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold">Publicar Ahora</div>
                  <div className={`text-[10px] ${status === 'published' ? 'text-amber-100' : 'text-stone-500'}`}>
                    Visible de inmediato
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                  status === 'draft'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-stone-700 border-amber-200'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={() => setStatus('draft')}
                  className="sr-only"
                />
                <Save className="w-4 h-4 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold">Guardar Borrador</div>
                  <div className={`text-[10px] ${status === 'draft' ? 'text-amber-100' : 'text-stone-500'}`}>
                    Solo visible para ti
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                  status === 'scheduled'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-stone-700 border-amber-200'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="scheduled"
                  checked={status === 'scheduled'}
                  onChange={() => setStatus('scheduled')}
                  className="sr-only"
                />
                <Calendar className="w-4 h-4 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold">Programar Lanzamiento</div>
                  <div className={`text-[10px] ${status === 'scheduled' ? 'text-amber-100' : 'text-stone-500'}`}>
                    Fecha y hora exacta
                  </div>
                </div>
              </label>
            </div>

            {status === 'scheduled' && (
              <div className="p-3 bg-white rounded-xl border border-amber-300 flex flex-col sm:flex-row items-center gap-3">
                <span className="text-xs font-bold text-stone-700 shrink-0">
                  Fecha y Hora de Publicación Automática:
                </span>
                <input
                  type="datetime-local"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-semibold text-stone-800"
                />
              </div>
            )}
          </div>

          {/* Footer Submit Buttons */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:text-stone-800 text-xs font-semibold rounded-xl hover:bg-stone-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#E09F3E] hover:bg-[#835500] text-white text-xs sm:text-sm font-bold rounded-full shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {recipeToEdit ? 'Guardar Cambios' : 'Confirmar y Guardar Receta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
