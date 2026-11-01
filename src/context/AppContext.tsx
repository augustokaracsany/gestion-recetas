import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  Recipe,
  RecipeComment,
  CartItem,
  ModerationReport,
  ForumTopic,
  ForumReply,
  AppNotification,
  RecipeCollection,
  Ingredient,
  SubProfile,
  DietaryTag,
  ResetPasswordSimulation,
  RecipeStatus,
  WishlistIngredientItem,
  CartItemSource,
  UserAddress,
  PurchaseOrder,
  OrderItem,
  OrderStatus
} from '../types';
import {
  UserLocation,
  PRESET_LOCATIONS,
  PARTNER_STORES,
  getStoreById
} from '../data/storesData';
import { formatARS } from '../utils/currency';
import {
  INITIAL_USERS,
  INITIAL_RECIPES,
  INITIAL_COMMENTS,
  INITIAL_FORUM_TOPICS,
  INITIAL_FORUM_REPLIES,
  INITIAL_REPORTS,
  INITIAL_COLLECTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORDERS
} from '../data/seedData';
import { auth, onAuthStateChanged, testConnection } from '../firebase/config';
import {
  loginWithGoogle,
  registerWithEmail,
  loginWithEmail,
  logoutFirebaseAuth,
  sendFirebasePasswordReset
} from '../firebase/authService';
import {
  syncUserProfile,
  subscribeToRecipes,
  saveRecipeToFirestore,
  deleteRecipeFromFirestore,
  subscribeToUserOrders,
  saveOrderToFirestore,
  seedInitialRecipesIfEmpty,
  seedInitialUsersToFirestore
} from '../firebase/firestoreService';

interface AppContextType {
  // Authentication & Users
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  switchUserRole: (role: UserRole) => void;
  selectSpecificUser: (userId: string) => void;
  loginUser: (email: string, password?: string) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  registerUser: (userData: {
    name: string;
    username: string;
    email: string;
    password?: string;
    role?: UserRole;
    avatar?: string;
    bio?: string;
    specialties?: string[];
    dietaryPreferences?: DietaryTag[];
    location?: string;
    address?: {
      alias?: string;
      street: string;
      number: string;
      apartment?: string;
      city: string;
      province: string;
      postalCode: string;
      notes?: string;
    };
  }) => Promise<{ success: boolean; message: string }> | { success: boolean; message: string };
  loginWithProvider: (provider: 'google' | 'apple') => Promise<void> | void;
  logoutUser: () => void;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  upgradeToPremium: (paymentDetails: {
    method: 'card' | 'mercadopago';
    billingCycle: 'monthly' | 'yearly';
    amountARS: number;
    cardLast4?: string;
    holderName?: string;
  }) => Promise<void>;
  addSubProfile: (name: string, relation: string, dietaryRestrictions: DietaryTag[]) => void;
  deleteSubProfile: (subProfileId: string) => void;
  switchActiveSubProfile: (subProfileId: string | null) => void;

  // Address Management
  userAddresses: UserAddress[];
  activeDeliveryAddress: UserAddress | null;
  addUserAddress: (addressData: Omit<UserAddress, 'id' | 'createdAt'>) => UserAddress;
  updateUserAddress: (addressId: string, addressData: Partial<UserAddress>) => void;
  deleteUserAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;

  // Orders & Tracking
  orders: PurchaseOrder[];
  createOrderFromCart: (customAddress?: UserAddress) => PurchaseOrder | null;
  advanceOrderStatus: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
  selectedOrderForTracking: PurchaseOrder | null;
  setSelectedOrderForTracking: (order: PurchaseOrder | null) => void;
  
  // Password Recovery
  resetSimulation: ResetPasswordSimulation | null;
  requestPasswordReset: (email: string) => { success: boolean; message: string; simulation?: ResetPasswordSimulation };
  resetPasswordWithToken: (tokenOrEmail: string, newPassword: string) => { success: boolean; message: string };
  clearResetSimulation: () => void;

  followUserToggle: (targetUserId: string) => void;
  
  // Recipes
  recipes: Recipe[];
  createRecipe: (recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'likesCount' | 'dislikesCount' | 'likedUserIds' | 'dislikedUserIds' | 'commentsCount'>) => string;
  updateRecipe: (id: string, recipeData: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => boolean;
  togglePinRecipe: (recipeId: string) => void;
  toggleLikeRecipe: (recipeId: string) => void;
  toggleDislikeRecipe: (recipeId: string) => void;
  publishScheduledNow: (recipeId: string) => void;
  toggleFeaturedRecipe: (recipeId: string, timeframe: 'day' | 'week' | 'month') => void;
  
  // Comments
  comments: RecipeComment[];
  addComment: (recipeId: string, content: string, parentCommentId?: string) => void;
  editComment: (commentId: string, newContent: string) => void;
  deleteComment: (commentId: string) => void;
  voteComment: (commentId: string, type: 'like' | 'dislike') => void;
  
  // Recipe Comparison
  comparingRecipeIds: string[];
  toggleCompareRecipe: (recipeId: string) => void;
  clearCompareRecipes: () => void;

  // Shopping Cart & Ingredients
  cart: CartItem[];
  addRecipeIngredientsToCart: (recipe: Recipe, selectedIngredientIds?: string[]) => void;
  addMultipleRecipesToCart: (recipes: Recipe[]) => void;
  togglePantryItem: (cartItemId: string) => void;
  updateCartItemQuantity: (cartItemId: string, newQuantity: number) => void;
  updateCartItemStore: (cartItemId: string, newStoreIdOrName: string) => void;
  applyCartItemSubstitute: (cartItemId: string, substituteName: string) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  selectedStoreFilter: string;
  setSelectedStoreFilter: (store: string) => void;
  userLocation: UserLocation;
  setUserLocation: (location: UserLocation) => void;
  preferredStoreId: string;
  setPreferredStoreId: (storeId: string) => void;

  // Wishlist & Collections
  toggleWishlist: (recipeId: string) => void;
  toggleWishlistIngredient: (ingredient: Ingredient, recipeId: string, recipeTitle: string) => void;
  removeWishlistIngredient: (wishlistIngredientId: string) => void;
  moveWishlistIngredientToCart: (wishlistIngredientId: string) => void;
  moveCartItemToWishlist: (cartItemId: string) => void;
  addAllWishlistIngredientsToCart: () => void;
  collections: RecipeCollection[];
  createCollection: (name: string, description: string, recipeIds: string[], isPrivate?: boolean) => void;
  toggleRecipeInCollection: (collectionId: string, recipeId: string) => void;

  // Moderation & Reports
  reports: ModerationReport[];
  submitReport: (targetType: 'recipe' | 'profile', targetId: string, titleOrName: string, reason: ModerationReport['reason'], details: string) => void;
  resolveReport: (reportId: string, resolution: 'removed' | 'dismissed') => void;

  // Forum (Community Discussions)
  forumTopics: ForumTopic[];
  forumReplies: ForumReply[];
  createForumTopic: (category: ForumTopic['category'], title: string, content: string, tags: string[]) => string;
  createForumReply: (topicId: string, content: string) => void;
  toggleForumReplyLike: (replyId: string) => void;
  markBestAnswer: (replyId: string) => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Print & Export
  printableRecipe: Recipe | null;
  setPrintableRecipe: (recipe: Recipe | null) => void;
  exportRecipeJson: (recipe: Recipe) => void;
  exportRecipeText: (recipe: Recipe) => void;
  exportCollectionPackage: (collection: RecipeCollection) => void;

  // Toast System
  toast: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  USERS: 'gusto_users_v1',
  CURRENT_USER_ID: 'gusto_current_user_id_v1',
  RECIPES: 'gusto_recipes_v1',
  COMMENTS: 'gusto_comments_v1',
  CART: 'gusto_cart_v1',
  REPORTS: 'gusto_reports_v1',
  COLLECTIONS: 'gusto_collections_v1',
  TOPICS: 'gusto_topics_v1',
  REPLIES: 'gusto_replies_v1',
  NOTIFICATIONS: 'gusto_notifications_v1',
  ORDERS: 'gusto_orders_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or fallback to Seed Data
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (saved === 'logged_out' || !saved) return null;
    return saved;
  });

  const [orders, setOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<PurchaseOrder | null>(null);

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECIPES);
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  });

  const [comments, setComments] = useState<RecipeComment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    return saved ? JSON.parse(saved) : [];
  });

  const [reports, setReports] = useState<ModerationReport[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [collections, setCollections] = useState<RecipeCollection[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
    return saved ? JSON.parse(saved) : INITIAL_COLLECTIONS;
  });

  const [forumTopics, setForumTopics] = useState<ForumTopic[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TOPICS);
    return saved ? JSON.parse(saved) : INITIAL_FORUM_TOPICS;
  });

  const [forumReplies, setForumReplies] = useState<ForumReply[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REPLIES);
    return saved ? JSON.parse(saved) : INITIAL_FORUM_REPLIES;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [comparingRecipeIds, setComparingRecipeIds] = useState<string[]>([]);
  const [selectedStoreFilter, setSelectedStoreFilter] = useState<string>('Todas');
  const [userLocation, setUserLocationState] = useState<UserLocation>(() => {
    const saved = localStorage.getItem('gusto_user_location_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return PRESET_LOCATIONS[0];
  });
  const [preferredStoreId, setPreferredStoreIdState] = useState<string>(() => {
    return localStorage.getItem('gusto_pref_store_v1') || 'coto';
  });

  const setUserLocation = (loc: UserLocation) => {
    setUserLocationState(loc);
    localStorage.setItem('gusto_user_location_v1', JSON.stringify(loc));
    showToast(`Ubicación actualizada: CP ${loc.postalCode} (${loc.cityName})`);
  };

  const setPreferredStoreId = (storeId: string) => {
    setPreferredStoreIdState(storeId);
    localStorage.setItem('gusto_pref_store_v1', storeId);
    const store = getStoreById(storeId);
    if (store) {
      showToast(`Tienda preferida cambiada a ${store.name}`);
    }
  };

  const [printableRecipe, setPrintableRecipe] = useState<Recipe | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Password reset simulation state
  const [resetSimulation, setResetSimulation] = useState<ResetPasswordSimulation | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'logged_out');
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
  }, [collections]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(forumTopics));
  }, [forumTopics]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPLIES, JSON.stringify(forumReplies));
  }, [forumReplies]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Initialize Firebase listeners, initial Firestore catalog seed and auth state
  useEffect(() => {
    testConnection().catch(console.warn);
    seedInitialRecipesIfEmpty(INITIAL_RECIPES).catch(console.warn);
    seedInitialUsersToFirestore(INITIAL_USERS).catch(console.warn);

    // Subscribe to recipes from Firestore
    const unsubRecipes = subscribeToRecipes(
      currentUserId,
      (firestoreRecipes) => {
        if (firestoreRecipes && firestoreRecipes.length > 0) {
          setRecipes(firestoreRecipes);
        }
      },
      (err) => console.warn('Firestore recipes subscription note:', err)
    );

    // Listen to Firebase Auth state
    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUsers((prev) => {
          const cleanEmail = (fbUser.email || '').toLowerCase();
          const existing = prev.find(
            (u) => u.id === fbUser.uid || (cleanEmail && u.email.toLowerCase() === cleanEmail)
          );
          if (existing) {
            syncUserProfile(existing).catch(console.warn);
            return prev;
          }
          const newUser: UserProfile = {
            id: fbUser.uid,
            name: fbUser.displayName || 'Chef Gusto',
            username: (cleanEmail ? cleanEmail.split('@')[0] : `chef_${fbUser.uid.slice(0, 5)}`)
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, '_'),
            email: cleanEmail || `${fbUser.uid}@gusto.app`,
            avatar:
              fbUser.photoURL ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
            role: 'usuario',
            bio: 'Perfil autenticado en Firebase.',
            specialties: ['Cocina Casera'],
            dietaryPreferences: [],
            subprofiles: [],
            addresses: [
              {
                id: `addr-${fbUser.uid}`,
                alias: 'Principal',
                street: 'Av. Corrientes',
                number: '1450',
                city: 'CABA',
                province: 'Buenos Aires',
                postalCode: '1042',
                isDefault: true,
                createdAt: new Date().toISOString(),
              },
            ],
            followersCount: 0,
            followingUserIds: ['user-mateo'],
            wishlistRecipeIds: [],
            location: 'Buenos Aires, CABA',
          };
          syncUserProfile(newUser).catch(console.warn);
          return [newUser, ...prev];
        });
        setCurrentUserId(fbUser.uid);
      }
    });

    return () => {
      unsubRecipes?.();
      unsubAuth?.();
    };
  }, []);

  // Subscribe to current user's purchase orders in Firestore ONLY if user is authenticated in Firebase
  useEffect(() => {
    if (!auth.currentUser || !currentUserId || currentUserId === 'logged_out' || auth.currentUser.uid !== currentUserId) {
      return;
    }
    const unsubOrders = subscribeToUserOrders(
      currentUserId,
      (userOrders) => {
        if (userOrders && userOrders.length > 0) {
          setOrders((prev) => {
            const map = new Map<string, PurchaseOrder>();
            prev.forEach((o) => map.set(o.id, o));
            userOrders.forEach((o) => map.set(o.id, o));
            return Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
        }
      },
      (err) => console.warn('Firestore orders subscription note:', err)
    );
    return () => {
      unsubOrders?.();
    };
  }, [currentUserId]);

  // Automatic scheduler: checks for recipes whose scheduled publish time has passed
  useEffect(() => {
    const checkScheduled = () => {
      const nowIso = new Date().toISOString();
      setRecipes((prev) => {
        let changed = false;
        const updated = prev.map((r) => {
          if (
            r.status === 'scheduled' &&
            r.scheduledPublishDate &&
            new Date(r.scheduledPublishDate).getTime() <= Date.now()
          ) {
            changed = true;
            const notif: AppNotification = {
              id: `notif-pub-${r.id}-${Date.now()}`,
              userId: r.authorId,
              title: 'Receta publicada automáticamente',
              message: `Tu receta programada "${r.title}" ya ha alcanzado su horario y ha sido publicada con éxito.`,
              createdAt: new Date().toISOString(),
              read: false,
              type: 'scheduled_published',
              linkTarget: r.id,
            };
            setNotifications((nPrev) => [notif, ...nPrev]);
            const pubRecipe: Recipe = {
              ...r,
              status: 'published' as RecipeStatus,
              updatedAt: nowIso,
            };
            saveRecipeToFirestore(pubRecipe).catch(console.warn);
            return pubRecipe;
          }
          return r;
        });
        if (changed) {
          return updated;
        }
        return prev;
      });
    };

    checkScheduled();
    const interval = setInterval(checkScheduled, 10000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(prev => prev === msg ? null : prev);
    }, 4000);
  };

  const currentUser = users.find(u => u.id === currentUserId) || null;

  // Role quick switch
  const switchUserRole = (role: UserRole) => {
    const targetUser = users.find(u => u.role === role);
    if (targetUser) {
      setCurrentUserId(targetUser.id);
      showToast(`Sesión cambiada a perfil: ${targetUser.name} (${targetUser.role.toUpperCase()})`);
    }
  };

  const selectSpecificUser = (userId: string) => {
    const u = users.find(x => x.id === userId);
    if (u) {
      setCurrentUserId(u.id);
      showToast(`Sesión activa: ${u.name}`);
    }
  };

  const loginUser = async (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // Attempt Firebase Authentication if password provided
    if (password) {
      const fbResult = await loginWithEmail(cleanEmail, password);
      if (fbResult.success && fbResult.user) {
        const fbUid = fbResult.user.uid;
        let found = users.find(u => u.id === fbUid || u.email.toLowerCase() === cleanEmail);
        if (found) {
          setCurrentUserId(found.id);
          showToast(`¡Bienvenido de vuelta, ${found.name}! (Firebase Auth)`);
          return { success: true, message: `Bienvenido, ${found.name}` };
        }
      }
    }

    const found = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      showToast('Correo no registrado. Por favor verifica los datos o crea una cuenta nueva.');
      return { success: false, message: 'Correo no registrado.' };
    }
    if (password && found.password && found.password !== password) {
      showToast('Contraseña incorrecta. Puedes restablecerla con la opción de recuperación.');
      return { success: false, message: 'Contraseña incorrecta.' };
    }
    setCurrentUserId(found.id);
    showToast(`¡Bienvenido de vuelta, ${found.name}!`);
    return { success: true, message: `Bienvenido, ${found.name}` };
  };

  const registerUser = async (userData: {
    name: string;
    username: string;
    email: string;
    password?: string;
    role?: UserRole;
    avatar?: string;
    bio?: string;
    specialties?: string[];
    dietaryPreferences?: DietaryTag[];
    location?: string;
    address?: {
      street: string;
      number: string;
      apartment?: string;
      city: string;
      province: string;
      postalCode: string;
      notes?: string;
    };
  }) => {
    const cleanEmail = userData.email.trim().toLowerCase();
    const cleanUsername = userData.username.trim().replace(/^@/, '').toLowerCase().replace(/\s+/g, '_');

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      showToast('Este correo electrónico ya está registrado. Inicia sesión directamente.');
      return { success: false, message: 'El correo electrónico ya está registrado.' };
    }

    if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
      showToast('Ese alias ya está en uso. Por favor elige otro diferente.');
      return { success: false, message: 'El alias ya está en uso.' };
    }

    // Try creating real user in Firebase Authentication
    let firebaseUid: string | null = null;
    if (userData.password) {
      const fbReg = await registerWithEmail(cleanEmail, userData.password, userData.name.trim());
      if (fbReg.success && fbReg.user) {
        firebaseUid = fbReg.user.uid;
      } else if (fbReg.code === 'auth/email-already-in-use') {
        showToast('Este correo ya está registrado en Firebase. Inicia sesión directamente.');
        return { success: false, message: 'El correo ya está registrado en Firebase.' };
      }
    }

    const initialAddresses: UserAddress[] = [];
    if (userData.address && userData.address.street) {
      initialAddresses.push({
        id: `addr-${Date.now()}`,
        alias: 'Principal',
        street: userData.address.street.trim(),
        number: userData.address.number.trim(),
        apartment: userData.address.apartment?.trim(),
        city: userData.address.city.trim() || 'CABA',
        province: userData.address.province.trim() || 'Buenos Aires',
        postalCode: userData.address.postalCode.trim() || '1414',
        isDefault: true,
        notes: userData.address.notes?.trim(),
        createdAt: new Date().toISOString(),
      });
    }

    const assignedId = firebaseUid || `user-${Date.now()}`;
    const newUser: UserProfile = {
      id: assignedId,
      name: userData.name.trim(),
      username: cleanUsername || `chef_${Date.now().toString().slice(-4)}`,
      email: cleanEmail,
      password: userData.password || 'password123',
      avatar: userData.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80`,
      role: 'usuario',
      bio: userData.bio?.trim() || 'Cocinero apasionado y nuevo miembro de la comunidad Gusto.',
      specialties: userData.specialties && userData.specialties.length > 0 ? userData.specialties : ['Cocina Casera'],
      dietaryPreferences: userData.dietaryPreferences || [],
      subprofiles: [],
      addresses: initialAddresses,
      followersCount: 0,
      followingUserIds: ['user-mateo', 'user-lucia'],
      wishlistRecipeIds: [],
      location: userData.address ? `${userData.address.city}, ${userData.address.province}` : (userData.location || 'Argentina'),
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    syncUserProfile(newUser).catch(console.warn);

    if (initialAddresses.length > 0) {
      const addr = initialAddresses[0];
      setUserLocation({
        postalCode: addr.postalCode,
        cityName: addr.city,
        city: addr.city,
        zone: addr.province,
        province: addr.province,
        address: `${addr.street} ${addr.number}${addr.apartment ? ' ' + addr.apartment : ''}`,
      });
    }

    showToast(`¡Cuenta creada con éxito! Bienvenido a Gusto, ${newUser.name}.`);
    return { success: true, message: 'Cuenta creada con éxito.' };
  };

  const loginWithProvider = async (provider: 'google' | 'apple') => {
    if (provider === 'google') {
      const googleRes = await loginWithGoogle();
      if (googleRes.success && googleRes.user) {
        const fbUser = googleRes.user;
        const cleanEmail = (fbUser.email || '').toLowerCase();
        let target = users.find(u => u.id === fbUser.uid || (cleanEmail && u.email.toLowerCase() === cleanEmail));

        if (!target) {
          target = {
            id: fbUser.uid,
            name: fbUser.displayName || 'Cocinero Google',
            username: (cleanEmail ? cleanEmail.split('@')[0] : `google_${fbUser.uid.slice(0, 5)}`)
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, '_'),
            email: cleanEmail || `${fbUser.uid}@gusto.app`,
            password: 'oauth_firebase_google',
            avatar:
              fbUser.photoURL ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
            role: 'usuario',
            bio: 'Cuenta autenticada vía Google y Firebase.',
            specialties: ['Cocina Express', 'Sabor de Temporada'],
            dietaryPreferences: [],
            subprofiles: [],
            addresses: [
              {
                id: `addr-google-${Date.now()}`,
                alias: 'Principal',
                street: 'Av. Corrientes',
                number: '1450',
                city: 'CABA',
                province: 'Buenos Aires',
                postalCode: '1042',
                isDefault: true,
                createdAt: new Date().toISOString(),
              }
            ],
            followersCount: 24,
            followingUserIds: ['user-mateo'],
            wishlistRecipeIds: [],
            location: 'Buenos Aires, CABA',
          };
          setUsers(prev => [target!, ...prev]);
        }
        setCurrentUserId(target.id);
        syncUserProfile(target).catch(console.warn);
        showToast(`¡Sesión iniciada exitosamente con Google (${target.name})!`);
        return;
      } else {
        showToast(`Error al iniciar con Google: ${googleRes.message}`);
        return;
      }
    }

    const providerName = 'Apple';
    const email = 'usuario.apple@gusto.app';
    let target = users.find(u => u.email.toLowerCase() === email);

    if (!target) {
      target = {
        id: `user-${provider}-${Date.now()}`,
        name: 'Chef Apple ID',
        username: 'apple_chef',
        email,
        password: 'oauth_secure_provider',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
        role: 'usuario',
        bio: `Cuenta vinculada mediante inicio de sesión con ${providerName}.`,
        specialties: ['Cocina Express', 'Sabor de Temporada'],
        dietaryPreferences: [],
        subprofiles: [],
        addresses: [
          {
            id: `addr-${provider}-${Date.now()}`,
            alias: 'Principal',
            street: 'Av. Corrientes',
            number: '1450',
            city: 'CABA',
            province: 'Buenos Aires',
            postalCode: '1042',
            isDefault: true,
            createdAt: new Date().toISOString(),
          }
        ],
        followersCount: 24,
        followingUserIds: ['user-mateo'],
        wishlistRecipeIds: [],
        location: 'Buenos Aires, CABA',
      };
      setUsers(prev => [target!, ...prev]);
    }
    setCurrentUserId(target.id);
    showToast(`Sesión iniciada exitosamente con ${providerName}.`);
  };

  const logoutUser = () => {
    logoutFirebaseAuth().catch(console.warn);
    setCurrentUserId(null);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'logged_out');
    showToast('Sesión cerrada correctamente. Hasta pronto.');
  };

  const updateUserProfile = (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    syncUserProfile(updated).catch(console.warn);
    showToast('Perfil actualizado con éxito.');
  };

  const upgradeToPremium = async (paymentDetails: {
    method: 'card' | 'mercadopago';
    billingCycle: 'monthly' | 'yearly';
    amountARS: number;
    cardLast4?: string;
    holderName?: string;
  }) => {
    if (!currentUser) {
      showToast('Por favor inicia sesión para mejorar tu cuenta.');
      return;
    }
    const updated: UserProfile = {
      ...currentUser,
      role: 'premium',
    };
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    await syncUserProfile(updated).catch(console.warn);

    const notif: AppNotification = {
      id: `notif-prem-${Date.now()}`,
      userId: currentUser.id,
      title: '¡Suscripción Chef Premium Activada!',
      message: `Tu pago de ${formatARS(paymentDetails.amountARS)} (${paymentDetails.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}) fue aprobado con éxito. Ahora disfrutas de todos los beneficios Premium en Gusto.`,
      createdAt: new Date().toISOString(),
      read: false,
      type: 'badge',
    };
    setNotifications(prev => [notif, ...prev]);
    showToast(`¡Felicidades ${currentUser.name}! Tu cuenta ahora es Chef Premium.`);
  };

  const addSubProfile = (name: string, relation: string, dietaryRestrictions: DietaryTag[]) => {
    if (!currentUser) return;
    const newSub: SubProfile = {
      id: `sub-${Date.now()}`,
      name,
      relation,
      avatarColor: 'bg-amber-600',
      dietaryRestrictions
    };
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          subprofiles: [...u.subprofiles, newSub]
        };
      }
      return u;
    }));
    showToast(`Subperfil "${name}" agregado.`);
  };

  const deleteSubProfile = (subProfileId: string) => {
    if (!currentUser) return;
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          subprofiles: u.subprofiles.filter(sp => sp.id !== subProfileId),
          activeSubProfileId: u.activeSubProfileId === subProfileId ? null : u.activeSubProfileId
        };
      }
      return u;
    }));
    showToast('Subperfil eliminado.');
  };

  const switchActiveSubProfile = (subProfileId: string | null) => {
    if (!currentUser) return;
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, activeSubProfileId: subProfileId };
      }
      return u;
    }));
    if (subProfileId) {
      const sub = currentUser.subprofiles.find(s => s.id === subProfileId);
      showToast(`Filtros adaptados al subperfil: ${sub?.name}`);
    } else {
      showToast('Restaurado a perfil principal.');
    }
  };

  // Address management
  const userAddresses: UserAddress[] = currentUser?.addresses || [];
  const activeDeliveryAddress: UserAddress | null = userAddresses.find(a => a.isDefault) || userAddresses[0] || null;

  const addUserAddress = (addressData: Omit<UserAddress, 'id' | 'createdAt'>): UserAddress => {
    if (!currentUser) {
      throw new Error('Debe iniciar sesión para agregar una dirección');
    }
    const newAddress: UserAddress = {
      ...addressData,
      id: `addr-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isDefault: userAddresses.length === 0 ? true : !!addressData.isDefault,
    };

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const currentList = u.addresses || [];
        const updatedList = newAddress.isDefault
          ? currentList.map(a => ({ ...a, isDefault: false })).concat(newAddress)
          : [...currentList, newAddress];
        return { ...u, addresses: updatedList };
      }
      return u;
    }));

    if (newAddress.isDefault) {
      setUserLocation({
        postalCode: newAddress.postalCode,
        cityName: newAddress.city,
        city: newAddress.city,
        zone: newAddress.province,
        province: newAddress.province,
        address: `${newAddress.street} ${newAddress.number}${newAddress.apartment ? ' ' + newAddress.apartment : ''}`,
      });
    }

    showToast(`Dirección "${newAddress.alias || newAddress.street}" guardada exitosamente.`);
    return newAddress;
  };

  const updateUserAddress = (addressId: string, addressData: Partial<UserAddress>) => {
    if (!currentUser) return;
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const currentList = u.addresses || [];
        const isSettingDefault = addressData.isDefault;
        const updatedList = currentList.map(a => {
          if (a.id === addressId) {
            return { ...a, ...addressData };
          }
          if (isSettingDefault) {
            return { ...a, isDefault: false };
          }
          return a;
        });
        return { ...u, addresses: updatedList };
      }
      return u;
    }));

    if (addressData.isDefault || addressData.postalCode || addressData.city) {
      const updated = (currentUser.addresses || []).find(a => a.id === addressId);
      if (updated) {
        const merged = { ...updated, ...addressData };
        if (merged.isDefault) {
          setUserLocation({
            postalCode: merged.postalCode,
            cityName: merged.city,
            city: merged.city,
            zone: merged.province,
            province: merged.province,
            address: `${merged.street} ${merged.number}${merged.apartment ? ' ' + merged.apartment : ''}`,
          });
        }
      }
    }
    showToast('Dirección actualizada.');
  };

  const deleteUserAddress = (addressId: string) => {
    if (!currentUser) return;
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const currentList = u.addresses || [];
        const remaining = currentList.filter(a => a.id !== addressId);
        if (remaining.length > 0 && !remaining.some(a => a.isDefault)) {
          remaining[0].isDefault = true;
          setUserLocation({
            postalCode: remaining[0].postalCode,
            cityName: remaining[0].city,
            city: remaining[0].city,
            zone: remaining[0].province,
            province: remaining[0].province,
            address: `${remaining[0].street} ${remaining[0].number}`,
          });
        }
        return { ...u, addresses: remaining };
      }
      return u;
    }));
    showToast('Dirección eliminada.');
  };

  const setDefaultAddress = (addressId: string) => {
    if (!currentUser) return;
    let targetAddr: UserAddress | undefined;
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const currentList = u.addresses || [];
        const updatedList = currentList.map(a => {
          if (a.id === addressId) {
            targetAddr = a;
            return { ...a, isDefault: true };
          }
          return { ...a, isDefault: false };
        });
        return { ...u, addresses: updatedList };
      }
      return u;
    }));

    if (targetAddr) {
      setUserLocation({
        postalCode: targetAddr.postalCode,
        cityName: targetAddr.city,
        city: targetAddr.city,
        zone: targetAddr.province,
        province: targetAddr.province,
        address: `${targetAddr.street} ${targetAddr.number}${targetAddr.apartment ? ' ' + targetAddr.apartment : ''}`,
      });
      showToast(`"${targetAddr.alias || targetAddr.street}" fijada como dirección predeterminada.`);
    }
  };

  // Orders and Tracking
  const createOrderFromCart = (customAddress?: UserAddress): PurchaseOrder | null => {
    if (cart.length === 0) {
      showToast('Tu carrito está vacío.');
      return null;
    }

    const targetAddress: UserAddress = customAddress || activeDeliveryAddress || {
      id: `addr-quick-${Date.now()}`,
      alias: 'Dirección de Entrega',
      street: userLocation.address?.split(' ')[0] || 'Av. Corrientes',
      number: userLocation.address?.split(' ')[1] || '1234',
      city: userLocation.cityName || userLocation.city || 'CABA',
      province: userLocation.province || 'Buenos Aires',
      postalCode: userLocation.postalCode || '1414',
      isDefault: true,
      createdAt: new Date().toISOString(),
    };

    const store = getStoreById(preferredStoreId) || PARTNER_STORES[0];

    const items: OrderItem[] = cart.map(c => {
      const baseQty = c.ingredient.quantity > 0 ? c.ingredient.quantity : 1;
      const ratio = c.quantityNeeded / baseQty;
      const unitPrice = c.ingredient.estimatedPrice;
      const itemSubtotal = Math.round(unitPrice * ratio);

      return {
        id: c.id,
        name: c.ingredient.name,
        quantity: c.quantityNeeded,
        unit: c.ingredient.unit,
        priceARS: unitPrice,
        subtotalARS: itemSubtotal,
        store: c.storeName || store.name,
        recipeTitle: c.recipeTitle,
        substituteUsed: c.substitutedBy,
      };
    });

    const subtotalARS = items.reduce((sum, item) => sum + (item.subtotalARS || (item.priceARS * item.quantity)), 0);
    const pantrySavingsARS = cart
      .filter(c => c.haveInPantry)
      .reduce((sum, c) => {
        const baseQty = c.ingredient.quantity > 0 ? c.ingredient.quantity : 1;
        const ratio = c.quantityNeeded / baseQty;
        return sum + Math.round(c.ingredient.estimatedPrice * ratio);
      }, 0);
    const deliveryFeeARS = store.deliveryFeeARS || 2850;
    const totalARS = Math.max(0, subtotalARS + deliveryFeeARS - pantrySavingsARS);

    const estMinutes = 45 + Math.floor(Math.random() * 35);
    const estTime = new Date(Date.now() + estMinutes * 60 * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    const newOrder: PurchaseOrder = {
      id: `ord-${Date.now()}`,
      userId: currentUser?.id || 'guest',
      orderNumber: `#GST-${Math.floor(10000 + Math.random() * 90000)}`,
      storeId: store.id,
      storeName: store.name,
      items,
      subtotalARS,
      deliveryFeeARS,
      pantrySavingsARS,
      totalARS,
      status: 'en_preparacion',
      deliveryAddress: targetAddress,
      createdAt: new Date().toISOString(),
      estimatedDeliveryTime: `Hoy, ${estTime} hs`,
      statusHistory: [
        {
          status: 'pendiente_pago',
          timestamp: new Date(Date.now() - 3 * 60 * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          note: 'Orden recibida y validada por la pasarela de pagos',
        },
        {
          status: 'en_preparacion',
          timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          note: `Empaquetando en sucursal ${store.name}`,
        },
      ],
    };

    setOrders(prev => [newOrder, ...prev]);
    setSelectedOrderForTracking(newOrder);
    setCart([]);
    saveOrderToFirestore(newOrder).catch(console.warn);
    showToast(`¡Pedido ${newOrder.orderNumber} confirmado en ${store.name}! Puedes rastrearlo en tiempo real.`);
    return newOrder;
  };

  const advanceOrderStatus = (orderId: string) => {
    const nextStatusMap: Record<OrderStatus, OrderStatus | null> = {
      pendiente_pago: 'en_preparacion',
      en_preparacion: 'despachado',
      despachado: 'en_camino',
      en_camino: 'entregado',
      entregado: null,
      cancelado: null,
    };

    const statusNotes: Record<OrderStatus, string> = {
      pendiente_pago: 'Pago en proceso',
      en_preparacion: 'El supermercado comenzó la preparación de tus ingredientes',
      despachado: 'Pedido armado y transferido al transportista express',
      en_camino: 'El repartidor está en camino a tu domicilio',
      entregado: '¡Pedido entregado con éxito! Que disfrutes cocinando',
      cancelado: 'Pedido cancelado',
    };

    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        const nextStatus = nextStatusMap[ord.status];
        if (!nextStatus) return ord;
        const updatedHistory = [
          ...ord.statusHistory,
          {
            status: nextStatus,
            timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            note: statusNotes[nextStatus],
          }
        ];
        const updatedOrder: PurchaseOrder = {
          ...ord,
          status: nextStatus,
          statusHistory: updatedHistory,
        };
        if (selectedOrderForTracking?.id === orderId) {
          setSelectedOrderForTracking(updatedOrder);
        }
        saveOrderToFirestore(updatedOrder).catch(console.warn);
        return updatedOrder;
      }
      return ord;
    }));

    showToast('Estado del pedido actualizado.');
  };

  const cancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        const updatedOrder: PurchaseOrder = {
          ...ord,
          status: 'cancelado',
          statusHistory: [
            ...ord.statusHistory,
            {
              status: 'cancelado',
              timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
              note: 'Cancelación solicitada por el usuario',
            }
          ]
        };
        if (selectedOrderForTracking?.id === orderId) {
          setSelectedOrderForTracking(updatedOrder);
        }
        saveOrderToFirestore(updatedOrder).catch(console.warn);
        return updatedOrder;
      }
      return ord;
    }));
    showToast('El pedido ha sido cancelado.');
  };

  const requestPasswordReset = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    // Trigger Firebase password reset email in background
    sendFirebasePasswordReset(cleanEmail).catch(console.warn);

    const foundUser = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!foundUser) {
      showToast('No encontramos ninguna cuenta con ese correo electrónico.');
      return {
        success: false,
        message: 'No existe usuario registrado con ese correo.'
      };
    }

    const token = 'GST-' + Math.floor(10000 + Math.random() * 90000);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const simulation: ResetPasswordSimulation = {
      email: foundUser.email,
      userName: foundUser.name,
      token,
      resetLink: `https://gusto.app/reset-password?token=${token}&email=${encodeURIComponent(foundUser.email)}`,
      createdAt: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      expiresAt,
      isUsed: false,
    };
    setResetSimulation(simulation);
    showToast(`Código de restablecimiento ${token} generado para ${foundUser.name}.`);
    return {
      success: true,
      message: `Código y enlace temporal generados con éxito.`,
      simulation
    };
  };

  const resetPasswordWithToken = (tokenOrEmail: string, newPassword: string) => {
    const cleanInput = tokenOrEmail.trim().toLowerCase();
    
    // Check if token matches resetSimulation
    let targetUser: UserProfile | undefined;
    if (resetSimulation && resetSimulation.token.toLowerCase() === cleanInput) {
      targetUser = users.find(u => u.email.toLowerCase() === resetSimulation.email.toLowerCase());
    } else {
      targetUser = users.find(u => u.email.toLowerCase() === cleanInput);
    }

    if (!targetUser) {
      showToast('Error: Token de seguridad o correo inválido.');
      return { success: false, message: 'Código de seguridad o correo inválido.' };
    }

    setUsers(prev => prev.map(u => u.id === targetUser!.id ? { ...u, password: newPassword } : u));
    setResetSimulation(null);
    setCurrentUserId(targetUser.id);
    showToast('¡Contraseña actualizada con éxito! Has iniciado sesión automáticamente.');
    return { success: true, message: 'Contraseña actualizada.' };
  };

  const clearResetSimulation = () => {
    setResetSimulation(null);
  };

  const followUserToggle = (targetUserId: string) => {
    if (!currentUser) {
      showToast('Por favor inicia sesión para seguir a otros creadores.');
      return;
    }
    const isFollowing = currentUser.followingUserIds.includes(targetUserId);
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const nextFollowing = isFollowing
          ? u.followingUserIds.filter(id => id !== targetUserId)
          : [...u.followingUserIds, targetUserId];
        return { ...u, followingUserIds: nextFollowing };
      }
      if (u.id === targetUserId) {
        return {
          ...u,
          followersCount: isFollowing ? Math.max(0, u.followersCount - 1) : u.followersCount + 1
        };
      }
      return u;
    }));
    
    if (!isFollowing) {
      const targetUser = users.find(u => u.id === targetUserId);
      if (targetUser) {
        const notif: AppNotification = {
          id: `notif-${Date.now()}`,
          userId: targetUserId,
          title: 'Nuevo seguidor',
          message: `${currentUser.name} ha comenzado a seguir tu perfil de cocina.`,
          createdAt: new Date().toISOString(),
          read: false,
          type: 'follow'
        };
        setNotifications(prev => [notif, ...prev]);
      }
      showToast('¡Ahora sigues a este creador!');
    } else {
      showToast('Has dejado de seguir a este perfil.');
    }
  };

  // Recipe Operations
  const createRecipe = (recipeData: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'likesCount' | 'dislikesCount' | 'likedUserIds' | 'dislikedUserIds' | 'commentsCount'>) => {
    if (!currentUser) {
      showToast('Debes iniciar sesión para publicar una receta.');
      return '';
    }
    const newId = `rec-${Date.now()}`;
    const newRecipe: Recipe = {
      ...recipeData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likesCount: 0,
      dislikesCount: 0,
      likedUserIds: [],
      dislikedUserIds: [],
      commentsCount: 0,
    };
    setRecipes(prev => [newRecipe, ...prev]);
    saveRecipeToFirestore(newRecipe).catch(console.warn);

    if (newRecipe.status === 'scheduled') {
      showToast(`Receta "${newRecipe.title}" programada para el ${new Date(newRecipe.scheduledPublishDate || '').toLocaleDateString('es-ES')}.`);
    } else if (newRecipe.status === 'draft') {
      showToast(`Borrador de "${newRecipe.title}" guardado en tu espacio personal.`);
    } else {
      showToast(`¡Receta "${newRecipe.title}" publicada en la comunidad!`);
    }
    return newId;
  };

  const updateRecipe = (id: string, recipeData: Partial<Recipe>) => {
    setRecipes(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, ...recipeData, updatedAt: new Date().toISOString() } : r);
      const target = updated.find(r => r.id === id);
      if (target) {
        saveRecipeToFirestore(target).catch(console.warn);
      }
      return updated;
    });
    showToast('Receta actualizada correctamente.');
  };

  const deleteRecipe = (id: string) => {
    const target = recipes.find(r => r.id === id);
    if (!target) return false;

    if (!currentUser) {
      showToast('Debes iniciar sesión para gestionar recetas.');
      return false;
    }

    const canDelete = currentUser.role === 'admin' || currentUser.role === 'editor' || target.authorId === currentUser.id;
    if (!canDelete) {
      showToast('No tienes permisos suficientes para eliminar esta receta.');
      return false;
    }

    setRecipes(prev => prev.filter(r => r.id !== id));
    setCart(prev => prev.filter(c => c.recipeId !== id));
    setComparingRecipeIds(prev => prev.filter(cid => cid !== id));
    deleteRecipeFromFirestore(id).catch(console.warn);
    showToast(`Receta "${target.title}" eliminada con éxito.`);
    return true;
  };

  const togglePinRecipe = (recipeId: string) => {
    if (!currentUser) {
      showToast('Inicia sesión para gestionar recetas fijadas.');
      return;
    }
    const target = recipes.find(r => r.id === recipeId);
    if (!target) return;
    
    if (target.authorId !== currentUser.id && currentUser.role !== 'editor' && currentUser.role !== 'admin') {
      showToast('Solo los autores o editores pueden fijar recetas en el perfil.');
      return;
    }

    const nextState = !target.isPinned;
    setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, isPinned: nextState } : r));
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, pinnedRecipeId: nextState ? recipeId : undefined };
      }
      return u;
    }));
    showToast(nextState ? 'Receta fijada en la parte superior.' : 'Receta desfijada.');
  };

  const toggleLikeRecipe = (recipeId: string) => {
    if (!currentUser) {
      showToast('Inicia sesión para votar por esta receta.');
      return;
    }
    setRecipes(prev => prev.map(r => {
      if (r.id !== recipeId) return r;
      const alreadyLiked = r.likedUserIds.includes(currentUser.id);
      const alreadyDisliked = r.dislikedUserIds.includes(currentUser.id);

      const nextLiked = alreadyLiked
        ? r.likedUserIds.filter(id => id !== currentUser.id)
        : [...r.likedUserIds, currentUser.id];
      const nextDisliked = alreadyDisliked
        ? r.dislikedUserIds.filter(id => id !== currentUser.id)
        : r.dislikedUserIds;

      const diffLikes = alreadyLiked ? -1 : 1;
      const diffDislikes = alreadyDisliked ? -1 : 0;

      return {
        ...r,
        likedUserIds: nextLiked,
        dislikedUserIds: nextDisliked,
        likesCount: Math.max(0, (r.likesCount ?? 0) + diffLikes),
        dislikesCount: Math.max(0, (r.dislikesCount ?? 0) + diffDislikes)
      };
    }));
  };

  const toggleDislikeRecipe = (recipeId: string) => {
    if (!currentUser) {
      showToast('Inicia sesión para votar por esta receta.');
      return;
    }
    setRecipes(prev => prev.map(r => {
      if (r.id !== recipeId) return r;
      const alreadyLiked = r.likedUserIds.includes(currentUser.id);
      const alreadyDisliked = r.dislikedUserIds.includes(currentUser.id);

      const nextDisliked = alreadyDisliked
        ? r.dislikedUserIds.filter(id => id !== currentUser.id)
        : [...r.dislikedUserIds, currentUser.id];
      const nextLiked = alreadyLiked
        ? r.likedUserIds.filter(id => id !== currentUser.id)
        : r.likedUserIds;

      const diffDislikes = alreadyDisliked ? -1 : 1;
      const diffLikes = alreadyLiked ? -1 : 0;

      return {
        ...r,
        likedUserIds: nextLiked,
        dislikedUserIds: nextDisliked,
        likesCount: Math.max(0, (r.likesCount ?? 0) + diffLikes),
        dislikesCount: Math.max(0, (r.dislikesCount ?? 0) + diffDislikes)
      };
    }));
  };

  const toggleFeaturedRecipe = (recipeId: string, timeframe: 'day' | 'week' | 'month') => {
    if (!currentUser || (currentUser.role !== 'editor' && currentUser.role !== 'admin')) {
      showToast('Solo los editores o administradores pueden destacar recetas en el catálogo.');
      return;
    }
    setRecipes(prev => prev.map(r => {
      if (r.id !== recipeId) return r;
      if (timeframe === 'day') {
        const next = !r.isFeaturedDay;
        showToast(next ? `Receta "${r.title}" destacada en el Top del Día.` : `Receta retirada del Top del Día.`);
        return { ...r, isFeaturedDay: next };
      } else if (timeframe === 'week') {
        const next = !r.isFeaturedWeek;
        showToast(next ? `Receta "${r.title}" destacada en el Top de la Semana.` : `Receta retirada del Top de la Semana.`);
        return { ...r, isFeaturedWeek: next };
      } else {
        const next = !r.isFeaturedMonth;
        showToast(next ? `Receta "${r.title}" destacada en el Top del Mes.` : `Receta retirada del Top del Mes.`);
        return { ...r, isFeaturedMonth: next };
      }
    }));
  };

  const publishScheduledNow = (recipeId: string) => {
    setRecipes(prev => prev.map(r => {
      if (r.id === recipeId) {
        return {
          ...r,
          status: 'published',
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    }));
    showToast('¡Receta programada publicada inmediatamente!');
  };

  // Comments
  const addComment = (recipeId: string, content: string, parentCommentId?: string) => {
    if (!currentUser) {
      showToast('Por favor inicia sesión para comentar en las recetas.');
      return;
    }
    if (!content.trim()) return;
    const newComment: RecipeComment = {
      id: `comm-${Date.now()}`,
      recipeId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      likedUserIds: [],
      dislikedUserIds: [],
      parentCommentId
    };
    setComments(prev => [...prev, newComment]);
    setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, commentsCount: r.commentsCount + 1 } : r));
    showToast('Comentario publicado en la receta.');
  };

  const editComment = (commentId: string, newContent: string) => {
    if (!currentUser) {
      showToast('Inicia sesión para editar tu comentario.');
      return;
    }
    const cleanContent = newContent.trim();
    if (!cleanContent) {
      showToast('El comentario no puede estar vacío.');
      return;
    }

    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        if (c.authorId !== currentUser.id && currentUser.role !== 'admin') {
          showToast('Solo el autor o el administrador pueden editar este comentario.');
          return c;
        }
        return {
          ...c,
          content: cleanContent,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    }));
    showToast('Comentario editado con éxito.');
  };

  const deleteComment = (commentId: string) => {
    if (!currentUser) {
      showToast('Inicia sesión para eliminar tu comentario.');
      return;
    }
    const target = comments.find(c => c.id === commentId);
    if (!target) return;
    const canDelete = target.authorId === currentUser.id || currentUser.role === 'admin' || currentUser.role === 'editor';
    if (!canDelete) {
      showToast('No tienes permisos suficientes para eliminar este comentario.');
      return;
    }

    setComments(prev => prev.filter(c => c.id !== commentId && c.parentCommentId !== commentId));
    setRecipes(prev => prev.map(r => r.id === target.recipeId ? { ...r, commentsCount: Math.max(0, r.commentsCount - 1) } : r));
    showToast('Comentario eliminado.');
  };

  const voteComment = (commentId: string, type: 'like' | 'dislike') => {
    if (!currentUser) {
      showToast('Inicia sesión para calificar este comentario.');
      return;
    }

    setComments(prev => prev.map(c => {
      if (c.id !== commentId) return c;
      const likedList = c.likedUserIds || [];
      const dislikedList = c.dislikedUserIds || [];
      const alreadyLiked = likedList.includes(currentUser.id);
      const alreadyDisliked = dislikedList.includes(currentUser.id);

      let nextLiked = [...likedList];
      let nextDisliked = [...dislikedList];

      if (type === 'like') {
        if (alreadyLiked) {
          nextLiked = nextLiked.filter(id => id !== currentUser.id);
        } else {
          nextLiked.push(currentUser.id);
          nextDisliked = nextDisliked.filter(id => id !== currentUser.id);
        }
      } else {
        if (alreadyDisliked) {
          nextDisliked = nextDisliked.filter(id => id !== currentUser.id);
        } else {
          nextDisliked.push(currentUser.id);
          nextLiked = nextLiked.filter(id => id !== currentUser.id);
        }
      }

      return {
        ...c,
        likedUserIds: nextLiked,
        dislikedUserIds: nextDisliked,
        likes: nextLiked.length - nextDisliked.length
      };
    }));
  };

  // Recipe Comparison
  const toggleCompareRecipe = (recipeId: string) => {
    if (comparingRecipeIds.includes(recipeId)) {
      setComparingRecipeIds(prev => prev.filter(id => id !== recipeId));
      showToast('Receta retirada del comparador.');
    } else {
      if (comparingRecipeIds.length >= 3) {
        showToast('Puedes comparar hasta un máximo de 3 recetas a la vez.');
        return;
      }
      setComparingRecipeIds(prev => [...prev, recipeId]);
      showToast('Receta añadida al comparador lado a lado.');
    }
  };

  const clearCompareRecipes = () => {
    setComparingRecipeIds([]);
  };

  // Helper for consolidating ingredients across recipes
  const normalizeIngName = (name: string): string => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\(.*?\)/g, '')
      .trim();
  };

  // Shopping Cart & Ingredients (Multi-Recipe & Consolidation)
  const addRecipeIngredientsToCart = (recipe: Recipe, selectedIngredientIds?: string[]) => {
    const ingsToAdd = selectedIngredientIds 
      ? recipe.ingredients.filter(ing => selectedIngredientIds.includes(ing.id))
      : recipe.ingredients;

    setCart(prev => {
      const updated = [...prev];

      ingsToAdd.forEach(ing => {
        const norm = normalizeIngName(ing.name);
        const existingIdx = updated.findIndex(item => 
          normalizeIngName(item.ingredient.name) === norm &&
          item.ingredient.unit.toLowerCase().trim() === ing.unit.toLowerCase().trim()
        );

        if (existingIdx >= 0) {
          // Consolidate quantity
          const existing = updated[existingIdx];
          const newQty = existing.quantityNeeded + ing.quantity;
          const currentSources: CartItemSource[] = existing.sources && existing.sources.length > 0
            ? [...existing.sources]
            : [{ recipeId: existing.recipeId, recipeTitle: existing.recipeTitle, quantity: existing.quantityNeeded }];

          const sIdx = currentSources.findIndex(s => s.recipeId === recipe.id);
          if (sIdx >= 0) {
            currentSources[sIdx] = {
              ...currentSources[sIdx],
              quantity: currentSources[sIdx].quantity + ing.quantity
            };
          } else {
            currentSources.push({
              recipeId: recipe.id,
              recipeTitle: recipe.title,
              quantity: ing.quantity
            });
          }

          updated[existingIdx] = {
            ...existing,
            quantityNeeded: newQty,
            sources: currentSources
          };
        } else {
          // Add as new item
          const newItem: CartItem = {
            id: `cart-${recipe.id}-${ing.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            ingredient: ing,
            recipeTitle: recipe.title,
            recipeId: recipe.id,
            quantityNeeded: ing.quantity,
            haveInPantry: false,
            storeName: ing.storeName,
            sources: [{
              recipeId: recipe.id,
              recipeTitle: recipe.title,
              quantity: ing.quantity
            }]
          };
          updated.push(newItem);
        }
      });

      return updated;
    });

    showToast(`Ingredientes de "${recipe.title}" añadidos y consolidados en el carrito.`);
  };

  const addMultipleRecipesToCart = (recipeList: Recipe[]) => {
    if (!recipeList.length) return;

    setCart(prev => {
      const updated = [...prev];

      recipeList.forEach(recipe => {
        recipe.ingredients.forEach(ing => {
          const norm = normalizeIngName(ing.name);
          const existingIdx = updated.findIndex(item => 
            normalizeIngName(item.ingredient.name) === norm &&
            item.ingredient.unit.toLowerCase().trim() === ing.unit.toLowerCase().trim()
          );

          if (existingIdx >= 0) {
            const existing = updated[existingIdx];
            const newQty = existing.quantityNeeded + ing.quantity;
            const currentSources: CartItemSource[] = existing.sources && existing.sources.length > 0
              ? [...existing.sources]
              : [{ recipeId: existing.recipeId, recipeTitle: existing.recipeTitle, quantity: existing.quantityNeeded }];

            const sIdx = currentSources.findIndex(s => s.recipeId === recipe.id);
            if (sIdx >= 0) {
              currentSources[sIdx] = {
                ...currentSources[sIdx],
                quantity: currentSources[sIdx].quantity + ing.quantity
              };
            } else {
              currentSources.push({
                recipeId: recipe.id,
                recipeTitle: recipe.title,
                quantity: ing.quantity
              });
            }

            updated[existingIdx] = {
              ...existing,
              quantityNeeded: newQty,
              sources: currentSources
            };
          } else {
            const newItem: CartItem = {
              id: `cart-${recipe.id}-${ing.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              ingredient: ing,
              recipeTitle: recipe.title,
              recipeId: recipe.id,
              quantityNeeded: ing.quantity,
              haveInPantry: false,
              storeName: ing.storeName,
              sources: [{
                recipeId: recipe.id,
                recipeTitle: recipe.title,
                quantity: ing.quantity
              }]
            };
            updated.push(newItem);
          }
        });
      });

      return updated;
    });

    showToast(`¡${recipeList.length} recetas añadidas al carrito con cantidades consolidadas!`);
  };

  const togglePantryItem = (cartItemId: string) => {
    setCart(prev => prev.map(item => {
      if (item.id === cartItemId) {
        const next = !item.haveInPantry;
        return { ...item, haveInPantry: next };
      }
      return item;
    }));
  };

  const updateCartItemQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, quantityNeeded: newQuantity } : item));
  };

  const updateCartItemStore = (cartItemId: string, newStoreIdOrName: string) => {
    const store = PARTNER_STORES.find(s => s.id === newStoreIdOrName || s.name.toLowerCase() === newStoreIdOrName.toLowerCase());
    const storeName = store ? store.name : newStoreIdOrName;
    const storeId = store ? store.id : undefined;

    setCart(prev => prev.map(item => {
      if (item.id === cartItemId) {
        return {
          ...item,
          storeName: storeName,
          customStoreId: storeId,
          ingredient: {
            ...item.ingredient,
            storeName: storeName,
            inStock: true,
            stockLevel: 'alto'
          }
        };
      }
      return item;
    }));
    showToast(`Tienda cambiada a "${storeName}" para este ingrediente.`);
  };

  const applyCartItemSubstitute = (cartItemId: string, substituteName: string) => {
    setCart(prev => prev.map(item => {
      if (item.id === cartItemId) {
        return {
          ...item,
          substitutedBy: substituteName,
          ingredient: {
            ...item.ingredient,
            name: substituteName,
            inStock: true,
            stockLevel: 'medio'
          }
        };
      }
      return item;
    }));
    showToast(`Ingrediente sustituido por "${substituteName}".`);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(c => c.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    showToast('Carrito de compras vaciado.');
  };

  // Wishlist & Collections
  const toggleWishlist = (recipeId: string) => {
    if (!currentUser) {
      showToast('Inicia sesión para guardar recetas en tu lista de deseos.');
      return;
    }
    const inWishlist = currentUser.wishlistRecipeIds.includes(recipeId);
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          wishlistRecipeIds: inWishlist
            ? u.wishlistRecipeIds.filter(id => id !== recipeId)
            : [...u.wishlistRecipeIds, recipeId]
        };
      }
      return u;
    }));
    showToast(inWishlist ? 'Eliminado de tu lista de deseos.' : 'Guardado en tu lista de deseos para cocinar luego.');
  };

  const toggleWishlistIngredient = (ingredient: Ingredient, recipeId: string, recipeTitle: string) => {
    if (!currentUser) {
      showToast('Inicia sesión para guardar ingredientes en tu lista de deseos.');
      return;
    }
    const currentWishlist = currentUser.wishlistIngredientItems || [];
    const exists = currentWishlist.some(w => 
      w.ingredient.id === ingredient.id || 
      normalizeIngName(w.ingredient.name) === normalizeIngName(ingredient.name)
    );

    let nextWishlist: WishlistIngredientItem[];
    if (exists) {
      nextWishlist = currentWishlist.filter(w => 
        !(w.ingredient.id === ingredient.id || normalizeIngName(w.ingredient.name) === normalizeIngName(ingredient.name))
      );
      showToast(`"${ingredient.name}" eliminado de tu lista de deseos.`);
    } else {
      const newItem: WishlistIngredientItem = {
        id: `wish-ing-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        ingredient,
        recipeId,
        recipeTitle,
        addedAt: new Date().toISOString()
      };
      nextWishlist = [newItem, ...currentWishlist];
      showToast(`"${ingredient.name}" guardado en tu lista de deseos.`);
    }

    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, wishlistIngredientItems: nextWishlist } : u));
  };

  const removeWishlistIngredient = (wishlistIngredientId: string) => {
    if (!currentUser) return;
    const nextWishlist = (currentUser.wishlistIngredientItems || []).filter(w => w.id !== wishlistIngredientId);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, wishlistIngredientItems: nextWishlist } : u));
    showToast('Ingrediente retirado de la lista de deseos.');
  };

  const moveWishlistIngredientToCart = (wishlistIngredientId: string) => {
    if (!currentUser) return;
    const item = (currentUser.wishlistIngredientItems || []).find(w => w.id === wishlistIngredientId);
    if (!item) return;

    const pseudoRecipe: Recipe = {
      id: item.recipeId,
      title: item.recipeTitle,
      ingredients: [item.ingredient]
    } as any;

    addRecipeIngredientsToCart(pseudoRecipe, [item.ingredient.id]);
    removeWishlistIngredient(wishlistIngredientId);
    showToast(`"${item.ingredient.name}" movido al carrito.`);
  };

  const moveCartItemToWishlist = (cartItemId: string) => {
    const item = cart.find(c => c.id === cartItemId);
    if (!item) return;
    if (!currentUser) {
      showToast('Inicia sesión para guardar ingredientes en tu lista de deseos.');
      return;
    }
    toggleWishlistIngredient(item.ingredient, item.recipeId, item.recipeTitle);
    removeFromCart(cartItemId);
  };

  const addAllWishlistIngredientsToCart = () => {
    if (!currentUser || !currentUser.wishlistIngredientItems || currentUser.wishlistIngredientItems.length === 0) {
      showToast('No tienes ingredientes en tu lista de deseos.');
      return;
    }

    currentUser.wishlistIngredientItems.forEach(wishItem => {
      const pseudoRecipe: Recipe = {
        id: wishItem.recipeId,
        title: wishItem.recipeTitle,
        ingredients: [wishItem.ingredient]
      } as any;
      addRecipeIngredientsToCart(pseudoRecipe, [wishItem.ingredient.id]);
    });

    showToast(`¡Se agregaron ${currentUser.wishlistIngredientItems.length} ingredientes guardados al carrito!`);
  };

  const createCollection = (name: string, description: string, recipeIds: string[], isPrivate = false) => {
    if (!currentUser) {
      showToast('Inicia sesión para crear colecciones de recetas.');
      return;
    }
    const newCol: RecipeCollection = {
      id: `col-${Date.now()}`,
      name,
      description,
      userId: currentUser.id,
      recipeIds,
      isPrivate,
      coverImage: recipes.find(r => recipeIds.includes(r.id))?.coverImage
    };
    setCollections(prev => [newCol, ...prev]);
    showToast(`Colección personal "${name}" creada.`);
  };

  const toggleRecipeInCollection = (collectionId: string, recipeId: string) => {
    setCollections(prev => prev.map(c => {
      if (c.id === collectionId) {
        const exists = c.recipeIds.includes(recipeId);
        const nextIds = exists ? c.recipeIds.filter(id => id !== recipeId) : [...c.recipeIds, recipeId];
        return { ...c, recipeIds: nextIds };
      }
      return c;
    }));
    showToast('Colección actualizada.');
  };

  // Moderation
  const submitReport = (targetType: 'recipe' | 'profile', targetId: string, titleOrName: string, reason: ModerationReport['reason'], details: string) => {
    const newReport: ModerationReport = {
      id: `rep-mod-${Date.now()}`,
      targetType,
      targetId,
      targetTitleOrName: titleOrName,
      reporterId: currentUser ? currentUser.id : 'guest-reporter',
      reporterName: currentUser ? currentUser.name : 'Usuario de la Comunidad',
      reason,
      details,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setReports(prev => [newReport, ...prev]);
    showToast('Tu reporte ha sido enviado a los moderadores. Gracias por mantener la comunidad segura.');
  };

  const resolveReport = (reportId: string, resolution: 'removed' | 'dismissed') => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    if (resolution === 'removed') {
      if (report.targetType === 'recipe') {
        setRecipes(prev => prev.filter(r => r.id !== report.targetId));
      } else {
        setUsers(prev => prev.map(u => u.id === report.targetId ? { ...u, isBanned: true } : u));
      }
    }

    setReports(prev => prev.map(r => r.id === reportId ? {
      ...r,
      status: resolution === 'removed' ? 'resolved_removed' : 'dismissed'
    } : r));

    showToast(resolution === 'removed' ? 'Elemento retirado y reporte marcado como resuelto.' : 'Reporte desestimado.');
  };

  // Forum
  const createForumTopic = (category: ForumTopic['category'], title: string, content: string, tags: string[]) => {
    if (!currentUser) {
      showToast('Por favor inicia sesión para abrir un debate en el foro.');
      return '';
    }
    const newId = `top-${Date.now()}`;
    const newTopic: ForumTopic = {
      id: newId,
      category,
      title,
      content,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.role,
      createdAt: new Date().toISOString(),
      repliesCount: 0,
      viewsCount: 1,
      tags
    };
    setForumTopics(prev => [newTopic, ...prev]);
    showToast(`Hilo de debate "${title}" iniciado en el foro.`);
    return newId;
  };

  const createForumReply = (topicId: string, content: string) => {
    if (!currentUser) {
      showToast('Por favor inicia sesión para participar en el foro.');
      return;
    }
    if (!content.trim()) return;
    const newReply: ForumReply = {
      id: `rep-${Date.now()}`,
      topicId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
      likesCount: 0,
    };
    setForumReplies(prev => [...prev, newReply]);
    setForumTopics(prev => prev.map(t => t.id === topicId ? { ...t, repliesCount: t.repliesCount + 1 } : t));
    showToast('Respuesta publicada en el debate.');
  };

  const toggleForumReplyLike = (replyId: string) => {
    setForumReplies(prev => prev.map(r => r.id === replyId ? { ...r, likesCount: r.likesCount + 1 } : r));
  };

  const markBestAnswer = (replyId: string) => {
    setForumReplies(prev => prev.map(r => ({
      ...r,
      isBestAnswer: r.id === replyId ? !r.isBestAnswer : false
    })));
    showToast('Respuesta destacada de la comunidad actualizada.');
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('Todas las notificaciones marcadas como leídas.');
  };

  // Exporting & Printing
  const exportRecipeJson = (recipe: Recipe) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(recipe, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${recipe.title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Receta "${recipe.title}" exportada en formato JSON.`);
  };

  const exportRecipeText = (recipe: Recipe) => {
    const textContent = `
========================================
${recipe.title.toUpperCase()}
========================================
Por: ${recipe.authorName} ${recipe.coAuthors.length > 0 ? `| Co-autores: ${recipe.coAuthors.join(', ')}` : ''}
Dificultad: ${recipe.difficulty} | Porciones: ${recipe.servings}
Tiempo: Prep ${recipe.prepTimeMin} min | Cocción ${recipe.cookTimeMin} min
Categoría: ${recipe.category}
Etiquetas: ${recipe.tags.join(', ')}

DESCRIPCIÓN:
${recipe.description}

INGREDIENTES:
${recipe.ingredients.map(i => `- ${i.quantity} ${i.unit} de ${i.name} (${i.storeName} - ~${formatARS(i.estimatedPrice)})`).join('\n')}

PASO A PASO:
${recipe.steps.map(s => `${s.stepNumber}. ${s.title.toUpperCase()} (${s.durationMinutes} min)\n${s.description}${s.tip ? `\nConsejo Chef: ${s.tip}` : ''}`).join('\n\n')}

INFORMACIÓN NUTRICIONAL:
Calorías: ${recipe.nutrition.calories} kcal | Proteínas: ${recipe.nutrition.proteinG}g | Carbohidratos: ${recipe.nutrition.carbsG}g | Grasas: ${recipe.nutrition.fatG}g | Fibra: ${recipe.nutrition.fiberG}g

Receta generada por Gusto - Sistema de Gestión de Recetas.
`;
    const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(textContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${recipe.title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Receta "${recipe.title}" descargada en formato texto.`);
  };

  const exportCollectionPackage = (collection: RecipeCollection) => {
    const collectionRecipes = recipes.filter(r => collection.recipeIds.includes(r.id));
    const packageData = {
      collectionName: collection.name,
      description: collection.description,
      exportedAt: new Date().toISOString(),
      recipesCount: collectionRecipes.length,
      recipes: collectionRecipes
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(packageData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `coleccion_${collection.name.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Colección completa "${collection.name}" exportada con sus recetas.`);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers: users,
        switchUserRole,
        selectSpecificUser,
        loginUser,
        registerUser,
        loginWithProvider,
        logoutUser,
        updateUserProfile,
        upgradeToPremium,
        addSubProfile,
        deleteSubProfile,
        switchActiveSubProfile,
        
        // Address Management
        userAddresses,
        activeDeliveryAddress,
        addUserAddress,
        updateUserAddress,
        deleteUserAddress,
        setDefaultAddress,

        // Orders & Tracking
        orders,
        createOrderFromCart,
        advanceOrderStatus,
        cancelOrder,
        selectedOrderForTracking,
        setSelectedOrderForTracking,

        resetSimulation,
        requestPasswordReset,
        resetPasswordWithToken,
        clearResetSimulation,

        followUserToggle,

        recipes,
        createRecipe,
        updateRecipe,
        deleteRecipe,
        togglePinRecipe,
        toggleLikeRecipe,
        toggleDislikeRecipe,
        publishScheduledNow,
        toggleFeaturedRecipe,

        comments,
        addComment,
        editComment,
        deleteComment,
        voteComment,

        comparingRecipeIds,
        toggleCompareRecipe,
        clearCompareRecipes,

        cart,
        addRecipeIngredientsToCart,
        addMultipleRecipesToCart,
        togglePantryItem,
        updateCartItemQuantity,
        updateCartItemStore,
        applyCartItemSubstitute,
        removeFromCart,
        clearCart,
        selectedStoreFilter,
        setSelectedStoreFilter,
        userLocation,
        setUserLocation,
        preferredStoreId,
        setPreferredStoreId,

        toggleWishlist,
        toggleWishlistIngredient,
        removeWishlistIngredient,
        moveWishlistIngredientToCart,
        moveCartItemToWishlist,
        addAllWishlistIngredientsToCart,
        collections,
        createCollection,
        toggleRecipeInCollection,

        reports,
        submitReport,
        resolveReport,

        forumTopics,
        forumReplies,
        createForumTopic,
        createForumReply,
        toggleForumReplyLike,
        markBestAnswer,

        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,

        printableRecipe,
        setPrintableRecipe,
        exportRecipeJson,
        exportRecipeText,
        exportCollectionPackage,

        toast,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
