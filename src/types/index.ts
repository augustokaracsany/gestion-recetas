export type UserRole = 'usuario' | 'premium' | 'editor' | 'admin';

export type DietaryTag = 
  | 'vegetariano'
  | 'vegano'
  | 'celiaco'
  | 'diabetico'
  | 'keto'
  | 'sin_lactosa'
  | 'bajo_sodio';

export interface SubProfile {
  id: string;
  name: string;
  relation: string;
  avatarColor: string;
  dietaryRestrictions: DietaryTag[];
}

export interface UserAddress {
  id: string;
  alias: string; // ej: "Casa", "Trabajo", "Depto Palermo"
  street: string; // Calle
  number: string; // Número
  apartment?: string; // Piso / Depto
  city: string; // Ciudad / Barrio
  province: string; // Provincia / Localidad
  postalCode: string; // Código Postal
  isDefault: boolean;
  notes?: string; // Indicaciones adicionales (ej: "Timbre 4B, entre calles...")
  createdAt: string;
}

export type OrderStatus = 
  | 'pendiente_pago'
  | 'en_preparacion'
  | 'despachado'
  | 'en_camino'
  | 'entregado'
  | 'cancelado';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  priceARS: number;
  subtotalARS?: number;
  recipeTitle?: string;
  storeName?: string;
  store?: string;
  substituteUsed?: string;
}

export interface PurchaseOrder {
  id: string;
  userId: string;
  orderNumber: string; // ej: #GST-84920
  storeId: string;
  storeName: string;
  items: OrderItem[];
  subtotalARS: number;
  deliveryFeeARS: number;
  pantrySavingsARS: number;
  totalARS: number;
  status: OrderStatus;
  deliveryAddress: UserAddress;
  createdAt: string;
  estimatedDeliveryTime: string; // ej: "Hoy, entre 16:30 y 17:30 hs"
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note: string;
  }[];
}

export interface ResetPasswordSimulation {
  email: string;
  userName: string;
  token: string;
  resetLink: string;
  createdAt: string;
  expiresAt: string;
  isUsed?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  avatar: string;
  role: UserRole;
  bio: string;
  specialties: string[];
  dietaryPreferences: DietaryTag[];
  subprofiles: SubProfile[];
  activeSubProfileId?: string | null;
  followersCount: number;
  followingUserIds: string[];
  pinnedRecipeId?: string;
  wishlistRecipeIds: string[];
  wishlistIngredientItems?: WishlistIngredientItem[];
  addresses?: UserAddress[];
  preferredPostalCode?: string;
  preferredCity?: string;
  preferredStoreId?: string;
  location?: string;
  isBanned?: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedPrice: number; // in ARS ($)
  storeName: string;
  storeLocation: string;
  inStock: boolean;
  stockLevel?: 'alto' | 'medio' | 'bajo' | 'agotado';
  suggestedSubstitute?: string;
  category: 'frescos' | 'secos' | 'lacteos' | 'especias' | 'otros';
}

export interface Step {
  stepNumber: number;
  title: string;
  description: string;
  durationMinutes: number;
  tip?: string;
  imageUrl?: string;
  videoUrl?: string; // YouTube / TikTok / MP4 link
}

export interface NutritionalInfo {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export interface RecipeComment {
  id: string;
  recipeId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  likedUserIds: string[];
  dislikedUserIds: string[];
  parentCommentId?: string;
}

export type RecipeStatus = 'draft' | 'published' | 'scheduled';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  coAuthors: string[]; // List of user display names
  status: RecipeStatus;
  scheduledPublishDate?: string; // ISO string
  createdAt: string;
  updatedAt: string;
  prepTimeMin: number;
  cookTimeMin: number;
  servings: number;
  difficulty: 'facil' | 'media' | 'dificil';
  category: 'pastas' | 'panaderia' | 'ensaladas' | 'postres' | 'sopas' | 'platos_fuertes' | 'desayunos';
  tags: DietaryTag[];
  ingredients: Ingredient[];
  steps: Step[];
  nutrition: NutritionalInfo;
  likesCount: number;
  dislikesCount: number;
  likedUserIds: string[];
  dislikedUserIds: string[];
  commentsCount: number;
  isFeaturedDay?: boolean;
  isFeaturedWeek?: boolean;
  isFeaturedMonth?: boolean;
  isPinned?: boolean;
  videoUrl?: string;
}

export interface CartItemSource {
  recipeId: string;
  recipeTitle: string;
  quantity: number;
}

export interface CartItem {
  id: string;
  ingredient: Ingredient;
  recipeTitle: string;
  recipeId: string;
  quantityNeeded: number;
  haveInPantry: boolean;
  storeName: string;
  sources?: CartItemSource[];
  customStoreId?: string;
  substitutedBy?: string;
}

export interface WishlistIngredientItem {
  id: string;
  ingredient: Ingredient;
  recipeId?: string;
  recipeTitle?: string;
  addedAt: string;
}

export interface ModerationReport {
  id: string;
  targetType: 'recipe' | 'profile';
  targetId: string;
  targetTitleOrName: string;
  targetAuthorOrOwner?: string;
  reporterId: string;
  reporterName: string;
  reason: 'inapropiado' | 'spam' | 'plagio' | 'peligro_alimentario' | 'acoso' | 'otro';
  details: string;
  status: 'pending' | 'resolved_removed' | 'dismissed';
  createdAt: string;
}

export interface ForumTopic {
  id: string;
  category: 'panaderia' | 'dietas' | 'tecnicas' | 'preguntas' | 'equipamiento';
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  createdAt: string;
  repliesCount: number;
  viewsCount: number;
  tags: string[];
  isPinned?: boolean;
}

export interface ForumReply {
  id: string;
  topicId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likesCount: number;
  isBestAnswer?: boolean;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: 'like' | 'comment' | 'follow' | 'scheduled_published' | 'moderation' | 'badge';
  linkTarget?: string;
}

export interface RecipeCollection {
  id: string;
  name: string;
  description: string;
  userId: string;
  recipeIds: string[];
  isPrivate: boolean;
  coverImage?: string;
}
