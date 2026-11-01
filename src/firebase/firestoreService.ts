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
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './firestoreErrors';
import { Recipe, PurchaseOrder, UserProfile, RecipeComment } from '../types';

/**
 * Sync user profile to Firestore
 */
export async function syncUserProfile(user: UserProfile): Promise<void> {
  // Only sync to Firestore if user is logged into Firebase and owns the profile
  if (!auth.currentUser || auth.currentUser.uid !== user.id) {
    return;
  }
  const path = `users/${user.id}`;
  try {
    const userDocRef = doc(db, 'users', user.id);
    const dataToSave = {
      id: user.id,
      name: user.name || 'Chef',
      username: user.username || user.id,
      email: user.email || '',
      avatar: user.avatar || '',
      role: user.role || 'usuario',
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
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetch a user profile from Firestore
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!auth.currentUser) {
    return null;
  }
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
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
  if (!auth.currentUser || auth.currentUser.uid !== recipe.authorId) {
    return;
  }
  const path = `recipes/${recipe.id}`;
  try {
    const recipeRef = doc(db, 'recipes', recipe.id);
    await setDoc(recipeRef, recipe, { merge: true });
  } catch (error) {
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
 * Seed initial role accounts into Firestore if signed in
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
          bio: u.bio,
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
      }
    }
    // Also seed admin document
    await setDoc(doc(db, 'admins', 'user-ignacio'), {
      userId: 'user-ignacio',
      role: 'admin',
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Initial users seeding notice:', error);
  }
}
