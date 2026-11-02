import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './firestoreErrors';
import { Recipe, PurchaseOrder, UserProfile, UserRole, RecipeComment } from '../types';

/**
 * Sync user profile to Firestore, preserving existing Firestore roles (e.g. admin privileges)
 */
export async function syncUserProfile(user: UserProfile): Promise<UserProfile> {
  // Only sync to Firestore if user is logged into Firebase and owns the profile
  if (!auth.currentUser || auth.currentUser.uid !== user.id) {
    return user;
  }
  const path = `users/${user.id}`;
  try {
    const userDocRef = doc(db, 'users', user.id);
    const snap = await getDoc(userDocRef);
    let effectiveRole: UserRole = user.role || 'usuario';

    if (snap.exists()) {
      const remote = snap.data() as UserProfile;
      // If remote user document already has a defined role, respect remote role
      if (remote.role) {
        effectiveRole = remote.role;
      }
    }

    const dataToSave = {
      id: user.id,
      name: user.name || 'Chef',
      username: user.username || user.id,
      email: user.email || '',
      avatar: user.avatar || '',
      role: effectiveRole,
      bio: user.bio || '',
      specialties: user.specialties || [],
      dietaryPreferences: user.dietaryPreferences || [],
      followersCount: user.followersCount || 0,
      followingUserIds: user.followingUserIds || [],
      pinnedRecipeId: user.pinnedRecipeId || '',
      wishlistRecipeIds: user.wishlistRecipeIds || [],
      location: user.location || 'Argentina',
      preferredPostalCode: user.preferredPostalCode || '1414',
      preferredCity: user.preferredCity || 'CABA',
      preferredStoreId: user.preferredStoreId || 'coto-digital',
      isBanned: user.isBanned || false,
    };

    await setDoc(userDocRef, dataToSave, { merge: true });

    // If user has admin role, also sync to admins collection for security rules
    if (effectiveRole === 'admin') {
      await setDoc(doc(db, 'admins', user.id), {
        userId: user.id,
        email: user.email || '',
        role: 'admin',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    return { ...user, ...dataToSave, role: effectiveRole };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return user;
  }
}

/**
 * Fetch a user profile directly from Firestore
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!auth.currentUser) {
    return null;
  }
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      const userData = snap.data() as UserProfile;
      // Double check admins collection if role is not set
      if (userData.role !== 'admin') {
        const adminSnap = await getDoc(doc(db, 'admins', userId));
        if (adminSnap.exists()) {
          userData.role = 'admin';
        }
      }
      return userData;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Subscribe to real-time changes on a specific user profile document in Firestore
 */
export function subscribeToUserProfile(
  userId: string,
  onUpdate: (profile: UserProfile) => void
): () => void {
  if (!auth.currentUser) return () => {};
  try {
    const userDocRef = doc(db, 'users', userId);
    return onSnapshot(
      userDocRef,
      async (snap) => {
        if (snap.exists()) {
          const profile = snap.data() as UserProfile;
          // Check if registered as admin in admins collection
          if (profile.role !== 'admin') {
            try {
              const adminSnap = await getDoc(doc(db, 'admins', userId));
              if (adminSnap.exists()) {
                profile.role = 'admin';
              }
            } catch (e) {
              /* ignore permission warnings */
            }
          }
          onUpdate(profile);
        }
      },
      (err) => console.warn('subscribeToUserProfile notice:', err)
    );
  } catch (err) {
    console.warn('subscribeToUserProfile error:', err);
    return () => {};
  }
}

/**
 * Listen to all published recipes from Firestore
 */
export function subscribeToRecipes(
  currentUserId: string | null,
  onUpdate: (recipes: Recipe[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const path = 'recipes';
  try {
    const colRef = collection(db, path);
    const q = query(colRef);
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Recipe[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as Recipe);
        });
        if (list.length > 0) {
          onUpdate(list);
        }
      },
      (error) => {
        if (onError) onError(error);
        console.warn('Firestore recipes query notice:', error);
      }
    );
  } catch (error) {
    console.warn('Firestore subscribeToRecipes notice:', error);
    return () => {};
  }
}

/**
 * Save or update a recipe in Firestore
 */
export async function saveRecipeToFirestore(recipe: Recipe): Promise<void> {
  if (!auth.currentUser) {
    console.warn('[saveRecipeToFirestore] Cannot save: Firebase Auth user is not authenticated.');
    return;
  }
  const path = `recipes/${recipe.id}`;
  try {
    const recipeRef = doc(db, 'recipes', recipe.id);
    const dataToSave = {
      id: recipe.id,
      title: recipe.title || 'Receta de autor',
      description: recipe.description || '',
      coverImage: recipe.coverImage || '',
      authorId: recipe.authorId || auth.currentUser.uid,
      authorName: recipe.authorName || 'Chef',
      authorAvatar: recipe.authorAvatar || '',
      coAuthors: recipe.coAuthors || [],
      status: recipe.status || 'published',
      createdAt: recipe.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      prepTimeMin: recipe.prepTimeMin || 15,
      cookTimeMin: recipe.cookTimeMin || 20,
      servings: recipe.servings || 4,
      difficulty: recipe.difficulty || 'media',
      category: recipe.category || 'todas',
      tags: recipe.tags || [],
      ingredients: recipe.ingredients || [],
      steps: recipe.steps || [],
      nutrition: recipe.nutrition || { calories: 300, proteinG: 10, carbsG: 30, fatG: 10, fiberG: 2 },
      likesCount: recipe.likesCount ?? 0,
      dislikesCount: recipe.dislikesCount ?? 0,
      likedUserIds: recipe.likedUserIds || [],
      dislikedUserIds: recipe.dislikedUserIds || [],
      commentsCount: recipe.commentsCount ?? 0,
    };
    await setDoc(recipeRef, dataToSave, { merge: true });
    console.log(`[saveRecipeToFirestore] Recipe "${recipe.title}" (${recipe.id}) saved to Firestore successfully.`);
  } catch (error) {
    console.error(`[saveRecipeToFirestore Error] Failed to persist recipe ${recipe.id}:`, error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a recipe from Firestore
 */
export async function deleteRecipeFromFirestore(recipeId: string): Promise<void> {
  if (!auth.currentUser) {
    return;
  }
  const path = `recipes/${recipeId}`;
  try {
    await deleteDoc(doc(db, 'recipes', recipeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Listen to current user's purchase orders
 * Crucial: Firestore security rules enforce (isSignedIn() && userId == request.auth.uid)
 * Therefore, only attach onSnapshot if user is authenticated in Firebase Auth.
 */
export function subscribeToUserOrders(
  userId: string,
  onUpdate: (orders: PurchaseOrder[]) => void,
  onError?: (error: unknown) => void
): () => void {
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return () => {};
  }
  const path = 'orders';
  try {
    const colRef = collection(db, path);
    const q = query(colRef, where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: PurchaseOrder[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as PurchaseOrder);
        });
        onUpdate(list);
      },
      (error) => {
        if (onError) onError(error);
        console.warn('Firestore orders subscription notice:', error);
      }
    );
  } catch (error) {
    console.warn('Firestore subscribeToUserOrders notice:', error);
    return () => {};
  }
}

/**
 * Save or update a purchase order in Firestore
 */
export async function saveOrderToFirestore(order: PurchaseOrder): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== order.userId) {
    return;
  }
  const path = `orders/${order.id}`;
  try {
    const orderRef = doc(db, 'orders', order.id);
    await setDoc(orderRef, order, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Add a comment to a recipe
 */
export async function addCommentToFirestore(recipeId: string, comment: RecipeComment): Promise<void> {
  if (!auth.currentUser) {
    return;
  }
  const path = `recipes/${recipeId}/comments/${comment.id}`;
  try {
    const commentRef = doc(db, 'recipes', recipeId, 'comments', comment.id);
    await setDoc(commentRef, comment);
    const recipeRef = doc(db, 'recipes', recipeId);
    const rSnap = await getDoc(recipeRef);
    if (rSnap.exists()) {
      const current = rSnap.data().commentsCount || 0;
      await updateDoc(recipeRef, { commentsCount: current + 1 });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Seed initial catalog to Firestore if empty and user is authorized
 */
export async function seedInitialRecipesIfEmpty(initialRecipes: Recipe[]): Promise<void> {
  if (!auth.currentUser) {
    return;
  }
  const path = 'recipes';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      console.log('Seeding initial recipes into Firestore...');
      for (const r of initialRecipes) {
        await setDoc(doc(db, 'recipes', r.id), r);
      }
      console.log('Firestore recipes seeded successfully.');
    }
  } catch (error) {
    console.warn('Initial recipe seeding skipped or permissions constrained:', error);
  }
}

/**
 * Seed initial role accounts into Firestore if signed in without overwriting existing profiles or roles
 */
export async function seedInitialUsersToFirestore(initialUsers: UserProfile[]): Promise<void> {
  if (!auth.currentUser) return;
  try {
    for (const u of initialUsers) {
      const uRef = doc(db, 'users', u.id);
      const snap = await getDoc(uRef);

      if (!snap.exists()) {
        await setDoc(uRef, {
          id: u.id,
          name: u.name,
          username: u.username,
          email: u.email,
          avatar: u.avatar,
          role: u.role,
          bio: u.bio || '',
          specialties: u.specialties || [],
          dietaryPreferences: u.dietaryPreferences || [],
          followersCount: u.followersCount || 0,
          followingUserIds: u.followingUserIds || [],
          location: u.location || 'Argentina',
          preferredPostalCode: u.preferredPostalCode || '1414',
          preferredCity: u.preferredCity || 'CABA',
          preferredStoreId: u.preferredStoreId || 'coto',
          isBanned: false
        });

        if (u.role === 'admin') {
          await setDoc(doc(db, 'admins', u.id), {
            userId: u.id,
            email: u.email,
            role: 'admin',
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      } else {
        const existingData = snap.data();
        // If user already exists in Firestore and has role 'admin', ensure admins collection is registered
        if (existingData.role === 'admin' || u.role === 'admin') {
          await setDoc(doc(db, 'admins', u.id), {
            userId: u.id,
            email: u.email || existingData.email,
            role: 'admin',
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      }
    }
    console.log('[Firestore] Initial user seeding complete without clobbering existing Firestore roles.');
  } catch (error) {
    console.warn('[Firestore] Users seeding notice:', error);
  }
}

/**
 * Seed realistic test comments for all existing recipes in Firestore
 */
export async function seedCommentsForRecipes(
  onProgress?: (msg: string) => void
): Promise<{ success: boolean; commentsCount: number; message: string }> {
  if (!auth.currentUser) {
    return { success: false, commentsCount: 0, message: 'Usuario no autenticado en Firebase.' };
  }

  const SAMPLE_AUTHORS = [
    { id: 'user-camila', name: 'Camila Ríos', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80' },
    { id: 'user-mateo', name: 'Mateo Rossi', avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=160&auto=format&fit=crop&q=80' },
    { id: 'user-lucia', name: 'Lucía Valenzuela', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80' },
    { id: 'user-ignacio', name: 'Ignacio Gómez', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80' }
  ];

  const SAMPLE_COMMENT_TEXTS = [
    '¡Excelente receta! Me quedó increíble en el primer intento. Recomiendo agregar un toque de orégano fresco.',
    'Muy bien explicados los pasos. A mi familia le encantó el sabor y la textura final.',
    'Reemplacé un ingrediente por opciones integrales y quedó deliciosa de todas formas. ¡Gracias por compartir!',
    'Punto justo de cocción y sabor riquísimo. Se convirtió en mi plato favorito para los fines de semana.',
    'Super práctica para hacer entre semana. El tiempo indicado fue exacto.',
    'Una maravilla gastronómica. Guardada inmediatamente en mis colecciones personales.'
  ];

  try {
    if (onProgress) onProgress('Buscando recetas guardadas en Firestore...');
    const recipesSnap = await getDocs(collection(db, 'recipes'));
    
    if (recipesSnap.empty) {
      return { success: false, commentsCount: 0, message: 'No hay recetas en Firestore para inyectar comentarios.' };
    }

    let totalCreated = 0;
    let batch = writeBatch(db);
    let batchOpCount = 0;

    for (const recipeDoc of recipesSnap.docs) {
      const recipeId = recipeDoc.id;
      const countForThisRecipe = 2 + Math.floor(Math.random() * 3); // 2 to 4 comments per recipe

      for (let i = 0; i < countForThisRecipe; i++) {
        const commentId = `cmt-${recipeId}-${Date.now().toString(36)}-${i}`;
        const author = SAMPLE_AUTHORS[(totalCreated + i) % SAMPLE_AUTHORS.length];
        const contentText = SAMPLE_COMMENT_TEXTS[(totalCreated + i) % SAMPLE_COMMENT_TEXTS.length];
        const commentRef = doc(db, 'recipes', recipeId, 'comments', commentId);

        const commentDoc: RecipeComment = {
          id: commentId,
          recipeId: recipeId,
          authorId: author.id,
          authorName: author.name,
          authorAvatar: author.avatar,
          content: contentText,
          createdAt: new Date(Date.now() - (i * 3600000 + Math.random() * 86400000)).toISOString(),
          likes: Math.floor(Math.random() * 15),
          likedUserIds: [author.id],
          dislikedUserIds: []
        };

        batch.set(commentRef, commentDoc);
        totalCreated++;
        batchOpCount++;

        // Update commentsCount on parent recipe doc
        const recipeRef = doc(db, 'recipes', recipeId);
        batch.update(recipeRef, { commentsCount: (recipeDoc.data().commentsCount || 0) + countForThisRecipe });
        batchOpCount++;

        if (batchOpCount >= 400) {
          await batch.commit();
          batch = writeBatch(db);
          batchOpCount = 0;
        }
      }
    }

    if (batchOpCount > 0) {
      await batch.commit();
    }

    const msg = `Se inyectaron con éxito ${totalCreated} comentarios de prueba en ${recipesSnap.size} recetas.`;
    if (onProgress) onProgress(msg);
    return { success: true, commentsCount: totalCreated, message: msg };
  } catch (error) {
    console.error('Error in seedCommentsForRecipes:', error);
    handleFirestoreError(error, OperationType.WRITE, 'recipes/*/comments');
    return { success: false, commentsCount: 0, message: 'Error al inyectar comentarios en Firestore.' };
  }
}

/**
 * Seed massive recipes with subcollection comments in Firestore using batches
 */
export async function seedMassiveRecipesWithComments(
  count: number = 20,
  onProgress?: (msg: string) => void
): Promise<{ success: boolean; recipesCreated: number; commentsCreated: number; message: string }> {
  if (!auth.currentUser) {
    return { success: false, recipesCreated: 0, commentsCreated: 0, message: 'Usuario no autenticado en Firebase.' };
  }

  const TITLES_BASE = [
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

  const CATEGORIES = ['pastas', 'panaderia', 'ensaladas', 'postres', 'sopas', 'platos_fuertes', 'desayunos'] as const;

  const AUTHORS = [
    { id: 'user-camila', name: 'Camila Ríos', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80' },
    { id: 'user-mateo', name: 'Mateo Rossi', avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=160&auto=format&fit=crop&q=80' },
    { id: 'user-lucia', name: 'Lucía Valenzuela', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80' },
    { id: 'user-ignacio', name: 'Ignacio Gómez', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80' }
  ];

  const COMMENT_TEXTS = [
    '¡Receta espectacular! Salió perfecta al primer intento.',
    'Excelente combinación de ingredientes y sabores.',
    'Gran recomendación culinaria. Quedó muy sabrosa.',
    'Paso a paso clarísimo. 10/10 esta preparación.',
    'Imperdible para cualquier almuerzo en familia.'
  ];

  try {
    let totalRecipes = 0;
    let totalComments = 0;
    let currentBatch = writeBatch(db);
    let opsInBatch = 0;

    for (let i = 1; i <= count; i++) {
      if (onProgress && i % 5 === 0) {
        onProgress(`Generando lote de recetas (${i}/${count})...`);
      }

      const recId = `rec-masiva-${Date.now().toString(36)}-${i}`;
      const author = AUTHORS[i % AUTHORS.length];
      const category = CATEGORIES[i % CATEGORIES.length];
      const titleBase = TITLES_BASE[i % TITLES_BASE.length];

      const numComments = 2 + Math.floor(Math.random() * 4); // 2 to 5 comments

      const recipeDoc: Recipe = {
        id: recId,
        title: `${titleBase} #${i}`,
        description: `Receta gastronómica de alta calidad generada en lote masivo de prueba. Opción #${i}.`,
        coverImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
        authorId: author.id,
        authorName: author.name,
        authorAvatar: author.avatar,
        coAuthors: [],
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        prepTimeMin: 15 + (i % 30),
        cookTimeMin: 20 + (i % 45),
        servings: 4,
        difficulty: i % 2 === 0 ? 'facil' : 'media',
        category,
        tags: ['vegetariano'],
        ingredients: [
          { id: 'ing-1', name: 'Ingrediente Base Principal', quantity: 300, unit: 'g', estimatedPrice: 2500, storeName: 'Coto Digital', storeLocation: 'CABA', inStock: true, category: 'frescos' },
          { id: 'ing-2', name: 'Sazonador Gastronómico', quantity: 1, unit: 'cda', estimatedPrice: 1200, storeName: 'Coto Digital', storeLocation: 'CABA', inStock: true, category: 'especias' }
        ],
        steps: [
          { stepNumber: 1, title: 'Preparación de ingredientes', description: 'Lavar, cortar y sazonar todos los ingredientes.', durationMinutes: 10 },
          { stepNumber: 2, title: 'Cocción y emplatado', description: 'Cocer a fuego medio durante el tiempo especificado y servir bien caliente.', durationMinutes: 20 }
        ],
        nutrition: { calories: 350 + (i % 150), proteinG: 18, carbsG: 40, fatG: 12, fiberG: 4 },
        likesCount: Math.floor(Math.random() * 25),
        dislikesCount: 0,
        likedUserIds: [author.id],
        dislikedUserIds: [],
        commentsCount: numComments
      };

      const recipeRef = doc(db, 'recipes', recId);
      currentBatch.set(recipeRef, recipeDoc);
      totalRecipes++;
      opsInBatch++;

      // Subcollection comments
      for (let c = 0; c < numComments; c++) {
        const cmtId = `cmt-m-${recId}-${c}`;
        const cAuthor = AUTHORS[(i + c) % AUTHORS.length];
        const cmtText = COMMENT_TEXTS[(i + c) % COMMENT_TEXTS.length];
        const cmtRef = doc(db, 'recipes', recId, 'comments', cmtId);

        const cmtDoc: RecipeComment = {
          id: cmtId,
          recipeId: recId,
          authorId: cAuthor.id,
          authorName: cAuthor.name,
          authorAvatar: cAuthor.avatar,
          content: cmtText,
          createdAt: new Date(Date.now() - c * 1800000).toISOString(),
          likes: Math.floor(Math.random() * 8),
          likedUserIds: [cAuthor.id],
          dislikedUserIds: []
        };

        currentBatch.set(cmtRef, cmtDoc);
        totalComments++;
        opsInBatch++;

        if (opsInBatch >= 400) {
          await currentBatch.commit();
          currentBatch = writeBatch(db);
          opsInBatch = 0;
        }
      }
    }

    if (opsInBatch > 0) {
      await currentBatch.commit();
    }

    const finalMsg = `Generación masiva completada: ${totalRecipes} recetas y ${totalComments} comentarios inyectados en Firestore.`;
    if (onProgress) onProgress(finalMsg);
    return { success: true, recipesCreated: totalRecipes, commentsCreated: totalComments, message: finalMsg };
  } catch (error) {
    console.error('Error in seedMassiveRecipesWithComments:', error);
    handleFirestoreError(error, OperationType.WRITE, 'recipes');
    return { success: false, recipesCreated: 0, commentsCreated: 0, message: 'Error en la generación masiva de recetas.' };
  }
}
