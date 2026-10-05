import React from 'react';
import { Recipe } from '../types';
import { Printer, ArrowLeft, Clock, Users, Flame, ChefHat } from 'lucide-react';

interface PrintRecipeViewProps {
  recipe: Recipe;
  onClose: () => void;
}

export const PrintRecipeView: React.FC<PrintRecipeViewProps> = ({
  recipe,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-stone-100 p-4 sm:p-8">
      {/* Top Controls Bar (hidden during actual window.print() via no-print class) */}
      <div className="no-print max-w-3xl mx-auto mb-6 bg-white p-4 rounded-2xl shadow-sm border border-stone-200 flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la Aplicación
        </button>

        <div className="text-xs text-stone-500 hidden sm:block">
          Vista previa de impresión limpia optimizada (RF-31)
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
        >
          <Printer className="w-4 h-4" />
          Imprimir Ahora (PDF / Papel)
        </button>
      </div>

      {/* Printable Sheet (Standard A4 / Editorial Paper Style) */}
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-md border border-stone-200 print:border-none print:shadow-none print:p-0 print:m-0 text-stone-900 space-y-6">
        {/* Printable Header */}
        <div className="border-b-2 border-stone-800 pb-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-800 mb-1">
              <ChefHat className="w-4 h-4" />
              Gusto • Sistema de Gestión de Recetas
            </div>
            <h1 className="text-3xl font-bold font-serif-display leading-tight">
              {recipe.title}
            </h1>
            <p className="text-xs text-stone-600 mt-1 italic max-w-xl">
              {recipe.description}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider block text-stone-500">
              Autor
            </span>
            <span className="font-semibold text-sm text-stone-800">{recipe.authorName}</span>
            {recipe.coAuthors.length > 0 && (
              <span className="text-[10px] text-stone-500 block">
                Co-autores: {recipe.coAuthors.join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* Recipe Meta Strip */}
        <div className="grid grid-cols-4 gap-2 text-center py-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-bold">Tiempo Prep</span>
            <strong className="text-stone-800">{recipe.prepTimeMin} min</strong>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-bold">Tiempo Cocción</span>
            <strong className="text-stone-800">{recipe.cookTimeMin} min</strong>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-bold">Porciones</span>
            <strong className="text-stone-800">{recipe.servings} raciones</strong>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-bold">Dificultad</span>
            <strong className="text-stone-800 capitalize">{recipe.difficulty}</strong>
          </div>
        </div>

        {/* Dietary Tags */}
        <div className="flex flex-wrap gap-1.5">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-stone-400 text-stone-700 uppercase"
            >
              {tag.replace('_', ' ')}
            </span>
          ))}
        </div>

        {/* Two Columns: Ingredients & Steps */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-2">
          {/* Ingredients list with check-boxes */}
          <div className="md:col-span-5 space-y-3">
            <h3 className="font-bold text-sm uppercase tracking-wider border-b border-stone-300 pb-1.5">
              Ingredientes
            </h3>
            <ul className="space-y-2 text-xs">
              {recipe.ingredients.map((ing) => (
                <li key={ing.id} className="flex items-start gap-2">
                  <span className="w-3.5 h-3.5 rounded border border-stone-400 shrink-0 mt-0.5 inline-block" />
                  <span>
                    <strong>{ing.quantity} {ing.unit}</strong> de {ing.name}
                  </span>
                </li>
              ))}
            </ul>

            {/* Nutrition info */}
            <div className="mt-6 pt-3 border-t border-stone-200 text-[11px] space-y-1 text-stone-600">
              <span className="font-bold uppercase text-[10px] block text-stone-800">
                Nutrición (Por ración):
              </span>
              <div className="grid grid-cols-2 gap-1">
                <span>Calorías: <strong>{recipe.nutrition.calories} kcal</strong></span>
                <span>Proteínas: <strong>{recipe.nutrition.proteinG}g</strong></span>
                <span>Carbohidratos: <strong>{recipe.nutrition.carbsG}g</strong></span>
                <span>Grasas: <strong>{recipe.nutrition.fatG}g</strong></span>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="md:col-span-7 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider border-b border-stone-300 pb-1.5">
              Modo de Preparación
            </h3>
            <div className="space-y-4 text-xs">
              {recipe.steps.map((step) => (
                <div key={step.stepNumber} className="space-y-1">
                  <div className="font-bold text-stone-900 flex items-center justify-between">
                    <span>
                      {step.stepNumber}. {step.title}
                    </span>
                    <span className="text-stone-500 font-normal">
                      {step.durationMinutes} min
                    </span>
                  </div>
                  <p className="text-stone-700 leading-relaxed pl-3 border-l-2 border-amber-300">
                    {step.description}
                  </p>
                  {step.tip && (
                    <div className="pl-3 text-[11px] text-amber-900 italic">
                      * Consejo del Chef: {step.tip}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info on print sheet */}
        <div className="border-t border-stone-200 pt-4 flex items-center justify-between text-[10px] text-stone-400">
          <span>Impreso desde Gusto - Catálogo y Gestión Culinaria</span>
          <span>Fecha: {new Date().toLocaleDateString('es-ES')}</span>
        </div>
      </div>
    </div>
  );
};
