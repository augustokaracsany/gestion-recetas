import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../firebase/config';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { UserProfile, Recipe, DietaryTag } from '../types';
import { INITIAL_RECIPES } from '../data/seedData';
import { seedCommentsForRecipes, seedMassiveRecipesWithComments, fixAllRecipesCommentsCount } from '../firebase/firestoreService';
import {
  ShieldCheck,
  Database,
  Users,
  UtensilsCrossed,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Server,
  Lock,
  MessageSquare,
  ChefHat,
  RefreshCw
} from 'lucide-react';

const FIRST_NAMES = ['Sofía', 'Mateo', 'Lucía', 'Lucas', 'Valentina', 'Benjamín', 'Martina', 'Joaquín', 'Catalina', 'Thiago', 'Emma', 'Santino', 'Juana', 'Bautista', 'Olivia', 'Felipe'];
const LAST_NAMES = ['Rossi', 'Valenzuela', 'Ríos', 'Gómez', 'Fernández', 'López', 'Martínez', 'Rodríguez', 'Pérez', 'García', 'Sánchez', 'Romero', 'Álvarez', 'Torres', 'Benítez'];
const CITIES = [
  { city: 'Palermo, CABA', province: 'CABA', postal: '1414', store: 'coto' },
  { city: 'Belgrano, CABA', province: 'CABA', postal: '1428', store: 'jumbo' },
  { city: 'Córdoba Capital', province: 'Córdoba', postal: '5000', store: 'vea' },
  { city: 'Rosario Centro', province: 'Santa Fe', postal: '2000', store: 'dia' },
  { city: 'Mendoza Capital', province: 'Mendoza', postal: '5500', store: 'coto' },
  { city: 'La Plata', province: 'Buenos Aires', postal: '1900', store: 'jumbo' },
];
const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=160&auto=format&fit=crop&q=80',
];
const TAGS: DietaryTag[] = ['vegetariano', 'vegano', 'celiaco', 'diabetico', 'keto', 'sin_lactosa', 'bajo_sodio'];
const CATEGORIES = ['pastas', 'panaderia', 'ensaladas', 'postres', 'sopas', 'platos_fuertes', 'desayunos'] as const;

export const AdminSeederPanel: React.FC = () => {
  const { currentUser, showToast } = useApp();

  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeedingComments, setIsSeedingComments] = useState(false);
  const [isSeedingMassive, setIsSeedingMassive] = useState(false);
  const [isFixingCommentsCount, setIsFixingCommentsCount] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [stats, setStats] = useState<{ usersCreated: number; recipesCreated: number } | null>(null);

  // Access Control: Only visible and accessible for admin role
  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const handleFixComments = async () => {
    setIsFixingCommentsCount(true);
    setProgressText('Recalculando e inscribiendo el total real de comentarios en cada receta...');
    try {
      const res = await fixAllRecipesCommentsCount((msg) => setProgressText(msg));
      setIsFixingCommentsCount(false);
      showToast(res.message);
    } catch (err: any) {
      console.error('Error fixing comments count:', err);
      setIsFixingCommentsCount(false);
      showToast('Error al corregir contadores de comentarios en Firestore.');
    }
  };

  const handleSeedComments = async () => {
    setIsSeedingComments(true);
    setProgressText('Inyectando comentarios de prueba en subcolecciones...');
    try {
      const res = await seedCommentsForRecipes((msg) => setProgressText(msg));
      setIsSeedingComments(false);
      if (res.success) {
        showToast(res.message);
      } else {
        showToast(res.message || 'Error al inyectar comentarios.');
      }
    } catch (err: any) {
      console.error('Error seeding comments:', err);
      setIsSeedingComments(false);
      showToast('Error al inyectar comentarios de prueba.');
    }
  };

  const handleSeedMassive = async () => {
    setIsSeedingMassive(true);
    setProgressText('Generando recetas masivas con comentarios en subcolecciones...');
    try {
      const res = await seedMassiveRecipesWithComments(25, (msg) => setProgressText(msg));
      setIsSeedingMassive(false);
      if (res.success) {
        showToast(res.message);
      } else {
        showToast(res.message || 'Error en la generación masiva.');
      }
    } catch (err: any) {
      console.error('Error seeding massive recipes:', err);
      setIsSeedingMassive(false);
      showToast('Error al generar recetas masivas con comentarios.');
    }
  };

  const handleRunSeeder = async () => {
    setIsSeeding(true);
    setProgressText('Preparando generación masiva (100 usuarios y 500 recetas)...');
    setStats(null);

    try {
      // 1. Generate 100 Users (incorporating accounts from cuentas.txt / role structure)
      const usersToCreate: UserProfile[] = [
        {
          id: 'user-basico-1',
          name: 'Camila Ríos',
          username: 'camicocina',
          email: 'usuario.basico@gusto.app',
          password: 'GustoUser2026!',
          avatar: AVATARS[2],
          role: 'usuario',
          bio: 'Aficionada a la cocina casera. Nivel básico.',
          specialties: ['Meal Prep', 'Cenas Rápidas'],
          dietaryPreferences: ['vegetariano'],
          subprofiles: [],
          followersCount: 42,
          followingUserIds: [],
          wishlistRecipeIds: [],
          location: 'Córdoba Capital',
          preferredPostalCode: '5000',
          preferredCity: 'Córdoba Capital',
          preferredStoreId: 'vea',
          addresses: [{ id: 'addr-1', alias: 'Casa', street: 'Bv. Chacabuco', number: '620', city: 'Córdoba Capital', province: 'Córdoba', postalCode: '5000', isDefault: true, createdAt: new Date().toISOString() }]
        },
        {
          id: 'user-premium-1',
          name: 'Mateo Rossi',
          username: 'mateochef',
          email: 'chef.premium@gusto.app',
          password: 'GustoPremium2026!',
          avatar: AVATARS[4],
          role: 'premium',
          bio: 'Chef pastelero y usuario Premium con suscripción activa.',
          specialties: ['Panadería artesanal', 'Pastelería'],
          dietaryPreferences: ['vegetariano'],
          subprofiles: [],
          followersCount: 1420,
          followingUserIds: ['user-basico-1'],
          wishlistRecipeIds: [],
          location: 'Palermo, CABA',
          preferredPostalCode: '1414',
          preferredCity: 'Palermo, CABA',
          preferredStoreId: 'coto',
          addresses: [{ id: 'addr-2', alias: 'Casa', street: 'Av. Santa Fe', number: '3420', city: 'Palermo, CABA', province: 'CABA', postalCode: '1414', isDefault: true, createdAt: new Date().toISOString() }]
        },
        {
          id: 'user-editor-1',
          name: 'Lucía Valenzuela',
          username: 'lucianutri',
          email: 'editor.recetas@gusto.app',
          password: 'GustoEditor2026!',
          avatar: AVATARS[3],
          role: 'editor',
          bio: 'Editora gastronómica y nutricionista clínica.',
          specialties: ['Cocina Sin TACC', 'Nutrición Metabólica'],
          dietaryPreferences: ['celiaco', 'vegano'],
          subprofiles: [],
          followersCount: 3890,
          followingUserIds: [],
          wishlistRecipeIds: [],
          location: 'Belgrano, CABA',
          preferredPostalCode: '1428',
          preferredCity: 'Belgrano, CABA',
          preferredStoreId: 'jumbo',
          addresses: [{ id: 'addr-3', alias: 'Depto', street: 'Av. Cabildo', number: '2150', city: 'Belgrano, CABA', province: 'CABA', postalCode: '1428', isDefault: true, createdAt: new Date().toISOString() }]
        },
        {
          id: 'user-admin-1',
          name: 'Ignacio Gómez',
          username: 'ignacioadmin',
          email: 'admin@gusto.app',
          password: 'GustoAdmin2026!',
          avatar: AVATARS[1],
          role: 'admin',
          bio: 'Administrador general y moderador de Gusto.',
          specialties: ['Gestión de Calidad'],
          dietaryPreferences: [],
          subprofiles: [],
          followersCount: 95,
          followingUserIds: [],
          wishlistRecipeIds: [],
          location: 'San Nicolás, CABA',
          preferredPostalCode: '1001',
          preferredCity: 'San Nicolás, CABA',
          preferredStoreId: 'coto',
          addresses: [{ id: 'addr-4', alias: 'Oficina', street: 'Av. Corrientes', number: '1250', city: 'San Nicolás, CABA', province: 'CABA', postalCode: '1001', isDefault: true, createdAt: new Date().toISOString() }]
        }
      ];

      // Complete up to 100 users with generated profiles
      for (let i = 5; i <= 100; i++) {
        const fName = FIRST_NAMES[i % FIRST_NAMES.length];
        const lName = LAST_NAMES[i % LAST_NAMES.length];
        const cityData = CITIES[i % CITIES.length];
        const role = i % 10 === 0 ? 'editor' : (i % 5 === 0 ? 'premium' : 'usuario');
        usersToCreate.push({
          id: `user-gen-${i}`,
          name: `${fName} ${lName}`,
          username: `${fName.toLowerCase()}_${lName.toLowerCase()}_${i}`,
          email: `chef.user${i}@gusto.app`,
          password: 'GustoUser2026!',
          avatar: AVATARS[i % AVATARS.length],
          role,
          bio: `Cocinero aficionado apasionado por la gastronomía argentina y de autor. Cuenta #${i}.`,
          specialties: ['Cocina Casera', 'Pastelería', 'Platos Regionales'],
          dietaryPreferences: [TAGS[i % TAGS.length]],
          subprofiles: [],
          followersCount: Math.floor(Math.random() * 500),
          followingUserIds: ['user-mateo'],
          wishlistRecipeIds: [],
          location: cityData.city,
          preferredPostalCode: cityData.postal,
          preferredCity: cityData.city,
          preferredStoreId: cityData.store,
          addresses: [{ id: `addr-gen-${i}`, alias: 'Principal', street: 'Av. Principal', number: `${100 + i}`, city: cityData.city, province: cityData.province, postalCode: cityData.postal, isDefault: true, createdAt: new Date().toISOString() }]
        });
      }

      // 2. Generate 500 Recipes (linking randomly to the 100 users)
      const recipesToCreate: Recipe[] = [];
      const baseTitles = [
        'Empanadas Criollas al Horno de Barro',
        'Asado de Tira con Chimichurri Casero',
        'Locro Pulsudo Tradicional Patrio',
        'Humita en Chala Cremosa',
        'Milanesa Napolitana con Papas Pay',
        'Ñoquis Caseros de Papa con Estofado',
        'Pastel de Papas y Carne Cortada a Cuchillo',
        'Chocotorta Clásica de Cumpleaños',
        'Alfajores de Maicena con Dulce de Leche',
        'Flan Casero Mixto con Dulce y Crema'
      ];

      for (let j = 1; j <= 500; j++) {
        const author = usersToCreate[j % usersToCreate.length];
        const cat = CATEGORIES[j % CATEGORIES.length];
        const titleBase = baseTitles[j % baseTitles.length];
        const title = `${titleBase} #${j}`;
        const prepTime = 15 + (j % 45);
        const cookTime = 20 + (j % 90);

        recipesToCreate.push({
          id: `rec-gen-${j}`,
          title,
          description: `Deliciosa receta elaborada con ingredientes frescos de estación y técnicas tradicionales. Compartida por la comunidad Gusto.`,
          coverImage: INITIAL_RECIPES[(j - 1) % INITIAL_RECIPES.length].coverImage,
          authorId: author.id,
          authorName: author.name,
          authorAvatar: author.avatar,
          coAuthors: [],
          status: 'published',
          createdAt: new Date(Date.now() - j * 3600000).toISOString(),
          updatedAt: new Date().toISOString(),
          prepTimeMin: prepTime,
          cookTimeMin: cookTime,
          servings: 4,
          difficulty: j % 3 === 0 ? 'dificil' : (j % 2 === 0 ? 'media' : 'facil'),
          category: cat,
          tags: [TAGS[j % TAGS.length]],
          ingredients: [
            { id: 'ing-1', name: 'Ingrediente principal de calidad', quantity: 500, unit: 'g', estimatedPrice: 2500, storeName: 'Supermercado Asociado', storeLocation: 'CABA', inStock: true, category: 'frescos' },
            { id: 'ing-2', name: 'Aceite de oliva virgen extra', quantity: 50, unit: 'ml', estimatedPrice: 1800, storeName: 'Supermercado Asociado', storeLocation: 'CABA', inStock: true, category: 'secos' }
          ],
          steps: [
            { stepNumber: 1, title: 'Preparación inicial', description: 'Reunir todos los ingredientes y limpiar el área de trabajo.', durationMinutes: 10 },
            { stepNumber: 2, title: 'Cocción principal', description: 'Cocinar a fuego moderado siguiendo los tiempos indicados hasta lograr el punto óptimo.', durationMinutes: prepTime + cookTime }
          ],
          nutrition: {
            calories: 350 + (j % 300),
            proteinG: 18 + (j % 15),
            carbsG: 40 + (j % 25),
            fatG: 12 + (j % 10),
            fiberG: 4
          },
          likesCount: Math.floor(Math.random() * 250),
          dislikesCount: 0,
          likedUserIds: [],
          dislikedUserIds: [],
          commentsCount: Math.floor(Math.random() * 15)
        });
      }

      // 3. Batch Injection into Firestore (processing in chunks of 300 writes to respect 500 writeBatch limit)
      setProgressText('Inyectando usuarios en lotes (batch max 200 ops)...');
      let batchCount = 0;
      let currentBatch = writeBatch(db);
      let operationCounter = 0;

      for (const user of usersToCreate) {
        const uRef = doc(db, 'users', user.id);
        currentBatch.set(uRef, user);
        operationCounter++;

        if (user.role === 'admin') {
          const adminRef = doc(db, 'admins', user.id);
          currentBatch.set(adminRef, {
            userId: user.id,
            email: user.email,
            role: 'admin',
            updatedAt: new Date().toISOString()
          });
          operationCounter++;
        }

        if (operationCounter >= 200) {
          await currentBatch.commit();
          batchCount++;
          currentBatch = writeBatch(db);
          operationCounter = 0;
        }
      }

      setProgressText('Inyectando recetas en lotes (batch max 200 ops)...');
      for (const recipe of recipesToCreate) {
        const rRef = doc(db, 'recipes', recipe.id);
        currentBatch.set(rRef, recipe);
        operationCounter++;

        if (operationCounter >= 200) {
          await currentBatch.commit();
          batchCount++;
          currentBatch = writeBatch(db);
          operationCounter = 0;
        }
      }

      if (operationCounter > 0) {
        await currentBatch.commit();
        batchCount++;
      }

      setIsSeeding(false);
      setStats({ usersCreated: usersToCreate.length, recipesCreated: recipesToCreate.length });
      showToast(`¡Inyección masiva completada! 100 usuarios y 500 recetas creadas en ${batchCount} lotes.`);
    } catch (err: any) {
      console.error('Seeder execution error:', err);
      setIsSeeding(false);
      showToast(`Error en inyección: ${err?.message || 'Error desconocido'}`);
    }
  };

  const isAnySeeding = isSeeding || isSeedingComments || isSeedingMassive || isFixingCommentsCount;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-sm space-y-5 my-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center shadow-md">
            <Server className="w-5 h-5 text-zinc-950" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-zinc-100">
              Panel de Administración y Seeder Avanzado
            </h3>
            <p className="text-xs text-zinc-400">
              Herramienta exclusiva para administradores (Role: <span className="font-mono font-bold text-amber-400">admin</span>)
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-red-950/80 border border-red-800 text-red-300 rounded-full text-xs font-bold flex items-center gap-1">
          <Lock className="w-3.5 h-3.5" />
          <span>Acceso Restringido Admin</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xs flex items-center gap-3">
          <Users className="w-8 h-8 text-amber-400" />
          <div>
            <div className="font-bold text-zinc-200">100 Cuentas de Usuario</div>
            <div className="text-zinc-500 text-[11px]">Básicas, Premium, Editors y Admin</div>
          </div>
        </div>

        <div className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xs flex items-center gap-3">
          <UtensilsCrossed className="w-8 h-8 text-amber-400" />
          <div>
            <div className="font-bold text-zinc-200">500 Recetas de Autor</div>
            <div className="text-zinc-500 text-[11px]">Vinculadas aleatoriamente a los autores</div>
          </div>
        </div>

        <div className="p-3.5 bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xs flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-amber-400" />
          <div>
            <div className="font-bold text-zinc-200">10-20 Comentarios por Receta</div>
            <div className="text-zinc-500 text-[11px]">Subcolección con fechas, likes y conteo sinc</div>
          </div>
        </div>
      </div>

      {isAnySeeding && (
        <div className="p-3 bg-amber-950/40 border border-amber-800/80 rounded-2xl text-xs font-bold text-amber-300 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>{progressText}</span>
        </div>
      )}

      {stats && !isAnySeeding && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl text-xs font-bold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Se inyectaron con éxito {stats.usersCreated} usuarios y {stats.recipesCreated} recetas en Firestore.</span>
        </div>
      )}

      {/* Buttons Grid for Seeder Actions */}
      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Button 1: Inyectar 100 Usuarios y 500 Recetas */}
        <button
          type="button"
          disabled={isAnySeeding}
          onClick={handleRunSeeder}
          className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSeeding ? (
            <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
          ) : (
            <Sparkles className="w-4 h-4 text-zinc-950" />
          )}
          <span>Inyectar 100 usuarios y 500 recetas</span>
        </button>

        {/* Button 2: Inyectar 10-20 Comentarios por Receta */}
        <button
          type="button"
          disabled={isAnySeeding}
          onClick={handleSeedComments}
          className="px-4 py-3 rounded-2xl bg-zinc-950 border border-amber-500/40 hover:bg-zinc-800 text-amber-400 font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSeedingComments ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          ) : (
            <MessageSquare className="w-4 h-4 text-amber-400" />
          )}
          <span>Inyectar 10 a 20 Comentarios por Receta</span>
        </button>

        {/* Button 3: Generar Recetas Masivas con Comentarios */}
        <button
          type="button"
          disabled={isAnySeeding}
          onClick={handleSeedMassive}
          className="px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSeedingMassive ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          ) : (
            <ChefHat className="w-4 h-4 text-amber-400" />
          )}
          <span>Generar Recetas Masivas con Comentarios</span>
        </button>

        {/* Button 4: Corregir Contador 'commentsCount' en Firestore */}
        <button
          type="button"
          disabled={isAnySeeding}
          onClick={handleFixComments}
          className="px-4 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isFixingCommentsCount ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <RefreshCw className="w-4 h-4 text-emerald-200" />
          )}
          <span>Sincronizar Contador 'commentsCount'</span>
        </button>
      </div>
    </div>
  );
};
