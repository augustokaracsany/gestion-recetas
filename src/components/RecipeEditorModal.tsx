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
  Users,
  Save,
  CheckCircle,
  Upload,
  UserCheck
} from 'lucide-react';

interface RecipeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeToEdit?: Recipe | null;
}

export const RecipeEditorModal: React.FC<RecipeEditorModalProps> = ({
  isOpen,
  onClose,
  recipeToEdit,
}) => {
  const { currentUser, allUsers, createRecipe, updateRecipe, showToast } = useApp();

  const [title, setTitle] = useState(recipeToEdit?.title || '');
  const [description, setDescription] = useState(recipeToEdit?.description || '');
  
  // Mandatory cover image: NO DEFAULT IMAGE ALLOWED
  const [coverImage, setCoverImage] = useState(recipeToEdit?.coverImage || '');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputText, setUrlInputText] = useState('');

  const [prepTimeMin, setPrepTimeMin] = useState(recipeToEdit?.prepTimeMin || 20);
  const [cookTimeMin, setCookTimeMin] = useState(recipeToEdit?.cookTimeMin || 30);
  const [servings, setServings] = useState(recipeToEdit?.servings || 4);
  const [difficulty, setDifficulty] = useState<Recipe['difficulty']>(recipeToEdit?.difficulty || 'facil');
  const [category, setCategory] = useState<Recipe['category']>(recipeToEdit?.category || 'platos_fuertes');
  const [tags, setTags] = useState<DietaryTag[]>(recipeToEdit?.tags || ['vegetariano']);
  const [videoUrl, setVideoUrl] = useState(recipeToEdit?.videoUrl || '');

  // Collaborators management with autocomplete
  const [coAuthorsList, setCoAuthorsList] = useState<string[]>(recipeToEdit?.coAuthors || []);
  const [coAuthorInput, setCoAuthorInput] = useState('');
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  
  // Publication Status & Scheduling
  const [status, setStatus] = useState<RecipeStatus>(recipeToEdit?.status || 'published');
  const [scheduledDate, setScheduledDate] = useState(
    recipeToEdit?.scheduledPublishDate
      ? new Date(recipeToEdit.scheduledPublishDate).toISOString().slice(0, 16)
      : new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16)
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
        name: 'Ajo fresco picado',
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

  // Filter registered users for autocomplete excluding current user and already added
  const matchingUsers = allUsers.filter((u) => {
    if (currentUser && u.id === currentUser.id) return false;
    if (coAuthorsList.includes(u.name)) return false;
    if (!coAuthorInput.trim()) return false;
    const query = coAuthorInput.toLowerCase();
    return u.name.toLowerCase().includes(query) || u.username.toLowerCase().includes(query);
  });

  const handleAddCoAuthor = (nameToAdd: string) => {
    const trimmed = nameToAdd.trim();
    if (trimmed && !coAuthorsList.includes(trimmed)) {
      setCoAuthorsList((prev) => [...prev, trimmed]);
      setCoAuthorInput('');
      setShowUserSuggestions(false);
    }
  };

  const handleRemoveCoAuthor = (nameToRemove: string) => {
    setCoAuthorsList((prev) => prev.filter((name) => name !== nameToRemove));
  };

  // Image Upload via File
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('La imagen es demasiado pesada. Elige una de hasta 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCoverImage(event.target.result as string);
          showToast('Imagen cargada correctamente.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrlImage = () => {
    if (!urlInputText.trim()) return;
    setCoverImage(urlInputText.trim());
    setUrlInputText('');
    setShowUrlInput(false);
    showToast('Enlace de imagen asignado.');
  };

  const toggleTag = (tag: DietaryTag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddIngredient = () => {
    const newIng: Ingredient = {
      id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: '',
      quantity: 1,
      unit: 'unidad',
      estimatedPrice: 1.0,
      storeName: 'Supermercado Central Gourmet',
      storeLocation: 'Centro Culinario',
      inStock: true,
      stockLevel: 'alto',
      category: 'secos'
    };
    setIngredients((prev) => [...prev, newIng]);
  };

  const handleRemoveIngredient = (idx: number) => {
    if (ingredients.length <= 1) {
      showToast('La receta debe contener al menos un ingrediente.');
      return;
    }
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

    if (!coverImage.trim()) {
      showToast('Es obligatorio cargar una imagen propia para la receta.');
      return;
    }

    if (status === 'scheduled') {
      const scheduledTime = new Date(scheduledDate).getTime();
      if (isNaN(scheduledTime)) {
        showToast('Por favor selecciona una fecha y hora válida para programar la publicación.');
        return;
      }
    }

    const recipeData = {
      title: title.trim(),
      description: description.trim(),
      coverImage: coverImage.trim(),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden my-auto max-h-[92vh] flex flex-col text-zinc-100">
        
        {/* Header */}
        <div className="bg-zinc-950 px-6 py-4 text-zinc-100 border-b border-zinc-800 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <span
              className="material-symbols-outlined text-[26px] text-amber-400"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              room_service
            </span>
            <div>
              <h2 className="font-bold text-lg leading-tight font-display text-zinc-100">
                {recipeToEdit ? 'Editar Receta' : 'Creación de Nueva Receta'}
              </h2>
              <p className="text-xs text-zinc-400">
                Estructura ingredientes, paso a paso, etiquetas dietéticas y programación
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* Top section: Basic info & Mandatory Cover Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left column: Title, Description, Times */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Título de la Receta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Tarta de Manzanas Caramelizadas Sin Gluten"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-sm font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden placeholder-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                  Descripción o Historia de la Receta
                </label>
                <textarea
                  rows={3}
                  placeholder="Explica qué hace especial a este plato, texturas, aromas..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden resize-none placeholder-zinc-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Recipe['category'])}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden capitalize"
                  >
                    <option value="platos_fuertes">Platos Fuertes</option>
                    <option value="pastas">Pastas</option>
                    <option value="panaderia">Panadería & Masas</option>
                    <option value="ensaladas">Ensaladas & Bowls</option>
                    <option value="sopas">Sopas & Cremas</option>
                    <option value="postres">Postres & Dulces</option>
                    <option value="desayunos">Desayunos & Bebidas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase mb-1">
                    Dificultad
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Recipe['difficulty'])}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden capitalize"
                  >
                    <option value="facil">Fácil</option>
                    <option value="media">Media</option>
                    <option value="dificil">Avanzada / Chef</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                    Prep (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={prepTimeMin}
                    onChange={(e) => setPrepTimeMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                    Cocción (min)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cookTimeMin}
                    onChange={(e) => setCookTimeMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                    Raciones
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={servings}
                    onChange={(e) => setServings(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Right column: MANDATORY Cover Image */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1 flex items-center justify-between">
                  <span>Foto de Portada (Obligatoria) *</span>
                  {coverImage && (
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Imagen seleccionada
                    </span>
                  )}
                </label>

                {!coverImage ? (
                  <div className="w-full h-56 rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-950 flex flex-col items-center justify-center text-center p-6 transition-all hover:border-zinc-700">
                    <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-xs">
                      <span
                        className="material-symbols-outlined text-[30px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        room_service
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-zinc-200">
                      Aún no se ha seleccionado una imágen
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
                      Para publicar la receta es obligatorio cargar una foto de tu plato.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                      <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-sm">
                        <Upload className="w-4 h-4" />
                        <span>Subir desde mi equipo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageFileUpload}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="px-3.5 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Ingresar enlace web
                      </button>
                    </div>

                    {showUrlInput && (
                      <div className="mt-3 flex gap-2 w-full max-w-xs">
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={urlInputText}
                          onChange={(e) => setUrlInputText(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800 text-xs text-zinc-100"
                        />
                        <button
                          type="button"
                          onClick={handleApplyUrlImage}
                          className="px-3 py-1.5 bg-amber-500 text-zinc-950 rounded-lg text-xs font-bold"
                        >
                          Usar
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative h-56 rounded-2xl overflow-hidden border border-zinc-800 shadow-inner group">
                      <img
                        src={coverImage}
                        alt="Foto de la receta"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <label className="px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                          Cambiar imagen
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageFileUpload}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setCoverImage('')}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-zinc-400">
                      <span>Foto asignada</span>
                      <button
                        type="button"
                        onClick={() => setCoverImage('')}
                        className="text-rose-400 hover:underline cursor-pointer"
                      >
                        Quitar y seleccionar otra
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* CO-AUTHORS WITH AUTOCOMPLETE FROM ALL REGISTERED USERS */}
              <div className="relative">
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Añadir Colaboradores / Co-autores</span>
                </label>

                {coAuthorsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {coAuthorsList.map((authorName) => (
                      <span
                        key={authorName}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{authorName}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCoAuthor(authorName)}
                          className="hover:text-rose-400 cursor-pointer ml-1"
                          title="Eliminar colaborador"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Escribe el nombre o alias (@usuario) para autocompletar..."
                      value={coAuthorInput}
                      onChange={(e) => {
                        setCoAuthorInput(e.target.value);
                        setShowUserSuggestions(true);
                      }}
                      onFocus={() => setShowUserSuggestions(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (matchingUsers.length > 0) {
                            handleAddCoAuthor(matchingUsers[0].name);
                          } else if (coAuthorInput.trim()) {
                            handleAddCoAuthor(coAuthorInput);
                          }
                        }
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden placeholder-zinc-600"
                    />

                    {showUserSuggestions && coAuthorInput.trim().length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 z-30 max-h-48 overflow-y-auto divide-y divide-zinc-800">
                        {matchingUsers.length > 0 ? (
                          matchingUsers.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => handleAddCoAuthor(user.name)}
                              className="w-full px-3 py-2 text-left hover:bg-zinc-800/80 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-7 h-7 rounded-full object-cover ring-1 ring-amber-500/40"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-zinc-100 truncate">
                                  {user.name}
                                </div>
                                <div className="text-[10px] text-amber-400">
                                  @{user.username} • {user.role}
                                </div>
                              </div>
                              <span className="text-[11px] font-bold text-amber-400 shrink-0">
                                Etiquetar +
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-xs text-zinc-400 flex items-center justify-between">
                            <span>No coincide con un chef registrado.</span>
                            <button
                              type="button"
                              onClick={() => handleAddCoAuthor(coAuthorInput)}
                              className="text-xs text-amber-400 font-bold hover:underline cursor-pointer"
                            >
                              Agregar como texto
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddCoAuthor(coAuthorInput)}
                    className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 border border-zinc-700"
                  >
                    Añadir
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Reconoce la autoría compartida vinculando cuentas registradas en la comunidad.
                </p>
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase mb-1 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-rose-400" />
                  <span>Video Explicativo YouTube / TikTok (Opcional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-100 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-hidden placeholder-zinc-600"
                />
              </div>

            </div>
          </div>

          {/* Dietary Tags */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
            <label className="block text-xs font-bold text-amber-400 uppercase mb-2">
              Etiquetas Dietéticas y Alérgenos
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'celiaco' as DietaryTag, label: 'Sin TACC / Celíacos' },
                { id: 'vegano' as DietaryTag, label: 'Vegano' },
                { id: 'vegetariano' as DietaryTag, label: 'Vegetariano' },
                { id: 'diabetico' as DietaryTag, label: 'Apto Diabéticos' },
                { id: 'keto' as DietaryTag, label: 'Dieta Keto' },
                { id: 'sin_lactosa' as DietaryTag, label: 'Sin Lactosa' },
                { id: 'bajo_sodio' as DietaryTag, label: 'Bajo en Sodio' },
              ].map((item) => {
                const isSelected = tags.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleTag(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-xs'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
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
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
                  Ingredientes & Tiendas Vinculadas
                </h3>
                <p className="text-xs text-zinc-400">
                  Cantidades, precios estimados y comercio para adquisición
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar Ingrediente
              </button>
            </div>

            <div className="space-y-2">
              {ingredients.map((ing, idx) => (
                <div
                  key={ing.id}
                  className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-zinc-950 border border-zinc-800"
                >
                  <div className="col-span-4">
                    <input
                      type="text"
                      required
                      placeholder="Nombre (ej. Harina de Almendras)"
                      value={ing.name}
                      onChange={(e) => handleUpdateIngredient(idx, 'name', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-100 text-xs font-semibold focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      placeholder="Cant"
                      value={ing.quantity}
                      onChange={(e) => handleUpdateIngredient(idx, 'quantity', Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-100 text-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Unidad (g, ml, u)"
                      value={ing.unit}
                      onChange={(e) => handleUpdateIngredient(idx, 'unit', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-100 text-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="col-span-3">
                    <select
                      value={ing.storeName}
                      onChange={(e) => handleUpdateIngredient(idx, 'storeName', e.target.value)}
                      className="w-full px-2 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-200 text-[11px] focus:ring-1 focus:ring-amber-500 truncate"
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
                      className="p-1 text-zinc-500 hover:text-rose-400 disabled:opacity-30 cursor-pointer"
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
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">
                  Paso a Paso de la Elaboración
                </h3>
                <p className="text-xs text-zinc-400">
                  Instrucciones detalladas con tiempos de preparación
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddStep}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar Paso
              </button>
            </div>

            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500 text-zinc-950">
                      Paso {step.stepNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <input
                          type="number"
                          min="1"
                          value={step.durationMinutes}
                          onChange={(e) => handleUpdateStep(idx, 'durationMinutes', Number(e.target.value))}
                          className="w-14 px-2 py-1 bg-zinc-900 rounded-lg border border-zinc-800 text-xs text-center text-zinc-100"
                        />
                        <span className="text-zinc-400">min</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        disabled={steps.length <= 1}
                        className="p-1 text-zinc-500 hover:text-rose-400 disabled:opacity-30 cursor-pointer"
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
                    className="w-full px-3 py-1.5 bg-zinc-900 rounded-xl border border-zinc-800 text-zinc-100 text-xs font-semibold focus:ring-1 focus:ring-amber-500"
                  />

                  <textarea
                    rows={2}
                    required
                    placeholder="Instrucciones detalladas de este paso..."
                    value={step.description}
                    onChange={(e) => handleUpdateStep(idx, 'description', e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-900 rounded-xl border border-zinc-800 text-zinc-100 text-xs focus:ring-1 focus:ring-amber-500 resize-none"
                  />

                  <input
                    type="text"
                    placeholder="Consejo o truco opcional para el paso (ej. Humedece tus manos con agua)"
                    value={step.tip || ''}
                    onChange={(e) => handleUpdateStep(idx, 'tip', e.target.value)}
                    className="w-full px-3 py-1 bg-amber-500/10 rounded-xl border border-amber-500/30 text-xs text-amber-300 placeholder-amber-400/50 focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Nutritional Info Estimation */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
            <h4 className="text-xs font-bold text-zinc-300 uppercase mb-2">
              Información Nutricional por Porción
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-0.5">Calorías (kcal)</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800 text-xs font-bold text-zinc-100"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 block mb-0.5">Proteínas (g)</label>
                <input
                  type="number"
                  value={proteinG}
                  onChange={(e) => setProteinG(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800 text-xs text-zinc-100"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 block mb-0.5">Carbohidratos (g)</label>
                <input
                  type="number"
                  value={carbsG}
                  onChange={(e) => setCarbsG(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800 text-xs text-zinc-100"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 block mb-0.5">Grasas (g)</label>
                <input
                  type="number"
                  value={fatG}
                  onChange={(e) => setFatG(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800 text-xs text-zinc-100"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 block mb-0.5">Fibra (g)</label>
                <input
                  type="number"
                  value={fiberG}
                  onChange={(e) => setFiberG(Number(e.target.value))}
                  className="w-full px-2 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800 text-xs text-zinc-100"
                />
              </div>
            </div>
          </div>

          {/* PROGRAMMING & PUBLICATION: Draft vs Publish Now vs Schedule */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Modalidad de Publicación & Programación</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label
                className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                  status === 'published'
                    ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-sm font-bold'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
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
                  <div className={`text-[10px] ${status === 'published' ? 'text-zinc-900' : 'text-zinc-500'}`}>
                    Visible en el catálogo público
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                  status === 'draft'
                    ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-sm font-bold'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
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
                  <div className={`text-[10px] ${status === 'draft' ? 'text-zinc-900' : 'text-zinc-500'}`}>
                    Privado en tu perfil personal
                  </div>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                  status === 'scheduled'
                    ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-sm font-bold'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
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
                  <div className={`text-[10px] ${status === 'scheduled' ? 'text-zinc-900' : 'text-zinc-500'}`}>
                    Fecha y hora exacta
                  </div>
                </div>
              </label>
            </div>

            {/* Exact Date & Time Picker for Scheduled Publishing */}
            {status === 'scheduled' && (
              <div className="p-4 bg-zinc-900 rounded-2xl border border-amber-500/40 space-y-2 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-zinc-100 block">
                      Fecha y Hora de Publicación Automática:
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      El sistema publicará la receta automáticamente al alcanzar el momento programado.
                    </span>
                  </div>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-950 text-xs font-semibold text-zinc-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Submit Buttons */}
          <div className="sticky bottom-0 bg-zinc-900/95 backdrop-blur-md pt-3 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-zinc-100 text-xs font-semibold rounded-xl hover:bg-zinc-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs sm:text-sm font-bold rounded-full shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
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
