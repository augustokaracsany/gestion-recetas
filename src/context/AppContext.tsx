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
  DietaryTag
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_RECIPES,
  INITIAL_COMMENTS,
  INITIAL_FORUM_TOPICS,
  INITIAL_FORUM_REPLIES,
  INITIAL_REPORTS,
  INITIAL_COLLECTIONS,
  INITIAL_NOTIFICATIONS
} from '../data/seedData';

interface AppContextType {
  // Authentication & Users
  currentUser: UserProfile;
  allUsers: UserProfile[];
  switchUserRole: (role: UserRole) => void;
  selectSpecificUser: (userId: string) => void;
  loginUser: (email: string) => boolean;
  registerUser: (name: string, email: string, role: UserRole) => void;
  logoutUser: () => void;
  updateUserProfile: (data: Partial<UserProfile>) => void;
  addSubProfile: (name: string, relation: string, dietaryRestrictions: DietaryTag[]) => void;
  switchActiveSubProfile: (subProfileId: string | null) => void;
  requestPasswordReset: (email: string) => { success: boolean; message: string };
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
  
  // Comments
  comments: RecipeComment[];
  addComment: (recipeId: string, content: string, parentCommentId?: string) => void;
  
  // Recipe Comparison (RF-18)
  comparingRecipeIds: string[];
  toggleCompareRecipe: (recipeId: string) => void;
  clearCompareRecipes: () => void;

  // Shopping Cart & Ingredients (RF-22, RF-23, RF-25)
  cart: CartItem[];
  addRecipeIngredientsToCart: (recipe: Recipe, selectedIngredientIds?: string[]) => void;
  togglePantryItem: (cartItemId: string) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  selectedStoreFilter: string;
  setSelectedStoreFilter: (store: string) => void;

  // Wishlist & Collections (RF-06, RF-24)
  toggleWishlist: (recipeId: string) => void;
  collections: RecipeCollection[];
  createCollection: (name: string, description: string, recipeIds: string[], isPrivate?: boolean) => void;
  toggleRecipeInCollection: (collectionId: string, recipeId: string) => void;

  // Moderation & Reports (RF-11, RF-20)
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

  // Notifications (RF-28)
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Print & Export (RF-29, RF-30, RF-31)
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
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or fallback to Seed Data
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || 'user-mateo';
  });

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
  const [printableRecipe, setPrintableRecipe] = useState<Recipe | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
  }, [currentUserId]);

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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(prev => prev === msg ? null : prev);
    }, 4000);
  };

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

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

  const loginUser = (email: string) => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUserId(found.id);
      showToast(`¡Bienvenido de vuelta, ${found.name}!`);
      return true;
    }
    showToast('Correo no encontrado. Puedes registrarte en la pestaña Registro.');
    return false;
  };

  const registerUser = (name: string, email: string, role: UserRole) => {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name,
      username: name.toLowerCase().replace(/\s+/g, '_'),
      email,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80`,
      role,
      bio: 'Cocinero entusiasta y miembro de la comunidad Gusto.',
      specialties: ['Cocina Casera'],
      dietaryPreferences: [],
      subprofiles: [],
      followersCount: 0,
      followingUserIds: ['user-mateo', 'user-lucia'],
      wishlistRecipeIds: [],
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    showToast(`¡Cuenta creada con éxito! Bienvenido ${name}.`);
  };

  const logoutUser = () => {
    showToast('Sesión cerrada correctamente.');
    // switch to first guest/standard
    setCurrentUserId('user-camila');
  };

  const updateUserProfile = (data: Partial<UserProfile>) => {
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...data } : u));
    showToast('Perfil actualizado con éxito.');
  };

  const addSubProfile = (name: string, relation: string, dietaryRestrictions: DietaryTag[]) => {
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
    showToast(`Subperfil familiar "${name}" agregado.`);
  };

  const switchActiveSubProfile = (subProfileId: string | null) => {
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

  const requestPasswordReset = (email: string) => {
    return {
      success: true,
      message: `Enlace seguro de restablecimiento enviado a ${email}.`
    };
  };

  const followUserToggle = (targetUserId: string) => {
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
      // Add notification to target user
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
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, ...recipeData, updatedAt: new Date().toISOString() } : r));
    showToast('Receta actualizada correctamente.');
  };

  const deleteRecipe = (id: string) => {
    const target = recipes.find(r => r.id === id);
    if (!target) return false;

    // Check permissions: author, editor, or admin
    const canDelete = currentUser.role === 'admin' || currentUser.role === 'editor' || target.authorId === currentUser.id;
    if (!canDelete) {
      showToast('No tienes permisos suficientes para eliminar esta receta.');
      return false;
    }

    setRecipes(prev => prev.filter(r => r.id !== id));
    // Also remove from cart, collections, compare
    setCart(prev => prev.filter(c => c.recipeId !== id));
    setComparingRecipeIds(prev => prev.filter(cid => cid !== id));
    showToast(`Receta "${target.title}" eliminada con éxito.`);
    return true;
  };

  const togglePinRecipe = (recipeId: string) => {
    const target = recipes.find(r => r.id === recipeId);
    if (!target) return;
    
    // Check permission: author or editor or admin
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
    if (!content.trim()) return;
    const newComment: RecipeComment = {
      id: `comm-${Date.now()}`,
      recipeId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      parentCommentId
    };
    setComments(prev => [...prev, newComment]);
    setRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, commentsCount: r.commentsCount + 1 } : r));
    showToast('Comentario publicado en la receta.');
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
      showToast('Receta añadida al comparador lado a lado (RF-18).');
    }
  };

  const clearCompareRecipes = () => {
    setComparingRecipeIds([]);
  };

  // Shopping Cart & Ingredients
  const addRecipeIngredientsToCart = (recipe: Recipe, selectedIngredientIds?: string[]) => {
    const ingsToAdd = selectedIngredientIds 
      ? recipe.ingredients.filter(ing => selectedIngredientIds.includes(ing.id))
      : recipe.ingredients;

    const newItems: CartItem[] = ingsToAdd.map(ing => ({
      id: `cart-${recipe.id}-${ing.id}-${Date.now()}`,
      ingredient: ing,
      recipeTitle: recipe.title,
      recipeId: recipe.id,
      quantityNeeded: ing.quantity,
      haveInPantry: false,
      storeName: ing.storeName
    }));

    setCart(prev => [...prev, ...newItems]);
    showToast(`${newItems.length} ingredientes de "${recipe.title}" agregados al carrito virtual.`);
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

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(c => c.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    showToast('Carrito de compras vaciado.');
  };

  // Wishlist & Collections
  const toggleWishlist = (recipeId: string) => {
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
    showToast(inWishlist ? 'Eliminado de tu lista de deseos (RF-24).' : 'Guardado en tu lista de deseos para cocinar luego.');
  };

  const createCollection = (name: string, description: string, recipeIds: string[], isPrivate = false) => {
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
      reporterId: currentUser.id,
      reporterName: currentUser.name,
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
    showToast(`Receta "${recipe.title}" exportada en formato JSON (RF-29).`);
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

INFORMACIÓN NUTRICIONAL (Por porción):
Calorías: ${recipe.nutrition.calories} kcal | Proteínas: ${recipe.nutrition.proteinG}g
Carbohidratos: ${recipe.nutrition.carbsG}g | Grasas: ${recipe.nutrition.fatG}g | Fibra: ${recipe.nutrition.fiberG}g

INGREDIENTES:
${recipe.ingredients.map(ing => `- ${ing.quantity} ${ing.unit} de ${ing.name} (Tienda: ${ing.storeName})`).join('\n')}

PASO A PASO:
${recipe.steps.map(s => `${s.stepNumber}. ${s.title} (${s.durationMinutes} min)\n   ${s.description}${s.tip ? `\n   Consejo: ${s.tip}` : ''}`).join('\n\n')}

Gusto - Sistema de Gestión de Recetas.
    `.trim();

    const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(textContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${recipe.title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Tarjeta de lectura rápida exportada.`);
  };

  const exportCollectionPackage = (collection: RecipeCollection) => {
    const collectedRecipes = recipes.filter(r => collection.recipeIds.includes(r.id));
    const packData = {
      collectionName: collection.name,
      description: collection.description,
      exportedAt: new Date().toISOString(),
      curatedBy: currentUser.name,
      totalRecipes: collectedRecipes.length,
      recipes: collectedRecipes
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(packData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `planificador_${collection.name.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Paquete de recetas y planificador semanal descargado (RF-30).`);
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
        logoutUser,
        updateUserProfile,
        addSubProfile,
        switchActiveSubProfile,
        requestPasswordReset,
        followUserToggle,

        recipes,
        createRecipe,
        updateRecipe,
        deleteRecipe,
        togglePinRecipe,
        toggleLikeRecipe,
        toggleDislikeRecipe,
        publishScheduledNow,

        comments,
        addComment,

        comparingRecipeIds,
        toggleCompareRecipe,
        clearCompareRecipes,

        cart,
        addRecipeIngredientsToCart,
        togglePantryItem,
        removeFromCart,
        clearCart,
        selectedStoreFilter,
        setSelectedStoreFilter,

        toggleWishlist,
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
