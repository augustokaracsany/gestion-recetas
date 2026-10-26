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

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
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
  location?: string;
  isBanned?: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedPrice: number; // in USD
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
  videoUrl?: string; // YouTube / TikTok / MP4 link (RF-26)
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
  likes: number;
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
  coAuthors: string[]; // List of user display names (RF-27)
  status: RecipeStatus;
  scheduledPublishDate?: string; // ISO string (RF-09)
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

export interface CartItem {
  id: string;
  ingredient: Ingredient;
  recipeTitle: string;
  recipeId: string;
  quantityNeeded: number;
  haveInPantry: boolean;
  storeName: string;
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
